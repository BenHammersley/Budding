require 'rubygems'
require 'rack'
require 'sinatra'
require 'prawn'
require 'rtf'
require 'open-uri'
require 'nokogiri'
require 'set'
require 'json'

unless Object.const_defined?(:BUDDING_ROOT)
  BUDDING_ROOT = File.expand_path(File.join(File.dirname(__FILE__), '..', '..'))
  $:.push(File.join(BUDDING_ROOT, 'lib'))
  require 'budding'
end

require 'rack/flash'
require 'pony'

module Budding
  class Frontend < Sinatra::Base
    
    include Budding::Database
    
    enable :static
    enable :sessions
    
    set :root, BUDDING_ROOT
    set :views, File.join(BUDDING_ROOT, 'lib/budding/frontend/views')
    
    helpers Rack::Utils
    
    helpers do
      
      def current_user
        @user ||= User.find(:email => session[:user][:email])
      end
      
      def logged?
        if session[:user] and session[:user][:email]
          !current_user.nil?
        else
          false
        end
      end
      
      def document_owner?
        @document.user_id == session.fetch(:user, {}).fetch(:user_id, nil)
      end
      
      def ui_code_dump(thing)
        %Q{<pre style="margin: 15px 0px 15px 0px; font-family: monofur;">}
          %Q{#{thing.gsub('<', '&lt;').gsub('>', '&gt;')}}
        %Q{</pre>}
      end

      def ui_editor()
        @text_blocks = [] 
        if @document_id
          @document_title = @document.title || "Untitled document"
          @text_blocks = @document.story.split(/(?:\r\n)+/) if @document.story
          @has_title = true if @document_title
        else
          @document_title = "Untitled document"
        end
        @languages = Language.all
        erb :"experimental/create"
      end
      
    end
    
    use Rack::Auth::Basic do |username, password|
      username == 'budding' && password == 'zomgwtfl0lz'
    end
    
    use Rack::Flash, :accessorize => [:info, :form]

    get '/' do
      redirect '/dashboard' if logged?
      @title = "Budding"
      flash.form = 'login' if flash.form.nil?
      erb :index
    end

    post '/login' do
      @user = User.find(:email => params[:email])
      unless @user.nil?
        if @user.login(params[:email], params[:password])
          session[:user] = {:email => params[:email], :user_id => @user.user_id}
          redirect '/dashboard'
        else
          # Pony::mail(
          #   :to => params[:email],
          #   :from => 'accounts@startbudding.com', 
          #   :subject => '[Budding] Password recovery', 
          #   :body => ''
          # )
          flash.info = "Wrong password for <b>#{params[:email]}</b>. We sent you a recovery link over e-mail."
          flash.form = 'login'
          redirect '/'
        end
      else
        flash.info = "Your e-mail is not registered yet. Signup now and we'll send you an e-mail with your password, but no activation is needed."
        flash.form = 'signup'
        redirect '/'
      end
    end
    
    get '/logout' do
      session[:user] = nil
      flash.form = 'login'
      redirect '/'
    end

    post '/signup' do
      unless User.find(:email => params[:signup_email]).nil?
        flash.info = "It looks like your e-mail is already registered. Try logging in instead." 
        flash.form = 'login'
        redirect '/'
      else
        @user = User.new({:email => params[:signup_email], :password => params[:signup_password]}).save
        session[:user] = {:email => params[:signup_email]}
        redirect '/dashboard'
      end
      flash.form = 'login'
      redirect '/'
    end
    
    get '/dashboard' do
      redirect '/' unless logged?
      @title = "Budding: Dashboard"
      @documents = current_user.documents_dataset.order(:created_on.desc).all
      erb :dashboard
    end
    
    get '/tagger' do
      erb :tagger
    end
    
    post '/tagger' do
      url = params[:url] # testing with http://en.wikipedia.org/wiki/Special:Export/Apple_Inc.
      firefox_user_agent = 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.0.6) Gecko/2009011913 Firefox/3.0.6 (.NET CLR 3.5.30729)'
      wxml = Nokogiri::XML(open(url, 'User-Agent' => firefox_user_agent))
      # Nokogiri's XPATH implementation doesn't seem to parse 
      # Wikipedia's XML format very well, which forces us to...
      root = wxml.child
      i = 0
      i += 1 while root.children[i].name != "page"
      page = root.children[i]
      i = 0
      i += 1 while page.children[i].name != "revision"
      revision = page.children[i]
      i = 0
      i += 1 while (revision.children[i].text.length < 100)
      text = revision.children[i].text
      # puts text
      potential_keywords = text.scan(/[A-Z]\w+(?:(?: )[A-Z]\w+)/m)
      potential_keywords_freq = {}
      for pk in potential_keywords
        potential_keywords_freq[pk] ||= 1
        potential_keywords_freq[pk] += 1
      end
      avg = potential_keywords_freq.values.sum/potential_keywords_freq.values.length
      @tags = Set.new(potential_keywords_freq.collect { |k, v| k if v > avg }.compact).to_a
      content_type :json, :charset => 'utf-8'
      @tags.to_json
    end
    
    get '/tags' do
      # @all_tags = database[:tags].all
      erb :tags
    end
    
    post '/tags' do
      erb :tags
    end
    
    get '/editor' do
      redirect '/' unless logged?
      @document = Document.new
      ui_editor()
    end
    
    post '/documents' do
      redirect '/' unless logged?
      document_data = {
        :title => params[:title],
        :story => params[:story]
      }      
      document_data[:user_id] = current_user.user_id
      # document_data.merge!({
      #   :short_summary => params[:summary],
      #   :teaser => params[:teaser],
      #   :locations => params[:locations],
      #   :people => params[:people],
      #   :companies => params[:companies],
      #   :keywords => params[:keywords],
      #   :language_id => params[:language]
      # })
      doc = Document.new(document_data)
      doc.save
      redirect "/documents/#{doc.document_id}"
    end
    
    post '/documents/:id' do
      redirect '/' unless logged?
      document_data = {
        :title => params[:title],
        :story => params[:story]
      }
      @document = Document.find(:document_id => params[:id])
      redirect '/' unless document_owner?
      @document.update(document_data)
      redirect "/documents/#{params[:id]}"
    end
    
    get '/documents' do
      redirect '/dashboard'
    end
    
    get '/documents/:id' do
      redirect '/' unless logged?
      @document = Document.find(:document_id => params[:id])
      redirect '/' unless document_owner?
      @document_id = @document.document_id
      unless @document.user != current_user or @document.nil?
        @lang = @document.language.name unless @document.language.nil?
        ui_editor()
      else
        # erb :"document/not_found"
        raise ::Sinatra::NotFound
      end
    end
    
    get '/documents/:id/delete' do
      redirect '/' unless logged?
      @document = Document.find(:document_id => params[:id])
      redirect '/' unless document_owner?
      unless @document.user != current_user or @document.nil?
        @document.delete()
        redirect '/dashboard'
      end
    end
    
    get '/documents/:id/as/:filetype' do
      redirect '/' unless logged?
      mime_type = {
        "pdf" => "application/pdf",
        "rtf" => "application/rtf",
        "txt" => "text/plain",
        "doc" => "application/msword"
      }
      @document = Document.find(:document_id => params[:id])
      unless @document.user != current_user or @document.nil?
        content_type "#{mime_type[params[:filetype]]}; charset=utf-8"
        content_disposition = 'inline; filename="%s.%s"' % [escape_html(@document.title), params[:filetype]]
        response['Content-Disposition'] = content_disposition
        erb :"document/export/#{params[:filetype]}"
      else
        #erb :"document/not_found"
        raise ::Sinatra::NotFound
      end
    end
    
    get '/test_url/(' do
      params[:id]
    end
            
  end
end
