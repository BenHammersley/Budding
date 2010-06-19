require 'rack'
require 'sinatra'
require 'rubygems'
require 'prawn'
require 'rtf'
require 'cgi'
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
        @languages = Language.all
        @text_blocks = [] 
        if @document_id
          @document_title = @document.title || "Untitled document"
          @text_blocks = Nokogiri::HTML(@document.story).xpath('//p')
          @has_title = true if @document_title
        else
          @document_title = "Untitled document"
        end
        @languages = Language.all
        erb :editor
      end
      
    end
    
    # use Rack::Auth::Basic do |username, password|
    #   username == 'budding' && password == 'zomgwtfl0lz'
    # end
    
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
      @title = "Budding: Tagger"
      @tags = database[:tags].all
      erb :tagger
    end
    
    post '/text-extractor' do
      url = params[:url]
      html = open(url).read
      doc = Nokogiri::HTML(html)
      text = doc.xpath('//*/text()').select { |t| !["script", "style", "link"].include?(t.parent.name) }.collect { |t| t.text.strip }.select { |t| t != "" }
      content_type :json, :charset => 'utf-8'
      text.to_json
    end
    
    get '/google-query/:term' do
      firefox_user_agent = 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.0.6) Gecko/2009011913 Firefox/3.0.6 (.NET CLR 3.5.30729)'
      url = ['http://www.google.com/search?q=', CGI::escape(params[:term])].join('')
      google_html = Nokogiri::HTML(open(url, 'User-Agent' => firefox_user_agent))
      google_results = google_html.xpath('//h3[@class="r"]/a').collect do |result|
        {:href => result.attributes['href'].to_s, :title => result.text}
      end
      content_type :json, :charset => 'utf-8'
      google_results.to_json
    end
    
    get '/links' do
      links = database[:links].filter(~{:title => nil}).all
      content_type :json, :charset => 'utf-8'
      links.to_json
    end
    
    post '/links' do
      for tag in params[:links]
        link =  database[:links].filter({:title => tag["title"], :tag => tag["tag"]})
        database[:links].insert({:title => tag["title"], :tag => tag["tag"]})
      end
      redirect '/tagger'
    end
    
    get '/tags' do
      @title = "Budding: Tags"
      @tags = database[:tags].all
      erb :tags
    end
    
    get '/data-only/tags' do
      tags = database[:tags].all.collect do |tag|
        {:name => tag[:name], :query_url => tag[:query_url]}
      end
      content_type :json, :charset => 'utf-8'
      tags.to_json
    end

    post '/data-only/document' do
      content_type :json
      document = Document.find(:document_id => params[:id])
      document.update({:title => params[:title]})
      document.save()
      #JSON.dump({:status => "ok"})
      "{\"status\":\"ok\"}"
    end

    post '/tags' do
      body = request.body.read
      puts "body: " + body
      tags = JSON.parse(body)
      database.run("delete from tags;")
      for tag in tags
        database[:tags].insert({
          :name => tag["name"],
          :description => tag["description"],
          :query_url => tag["query_url"],
          :created_at => Time.now
        })
      end
      content_type :json, :charset => 'utf-8'
      {:status => 0}.to_json
    end
    
    # post '/tags/:id' do
    #   tag = JSON.parse(request.body.read)
    #   database[:tags].filter({
    #     :name => tag["name"]
    #   }).update(({
    #     :name => tag["name"], 
    #     :description => tag["description"], 
    #     :query_url => tag["query_url"]
    #   })
    #   {:status => 0}.to_json
    # end
    
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
      document_data.merge!({
        :author => params[:author],
        :author_location => params[:author_location],
        :short_summary => params[:summary],
        :keywords => params[:keywords],
        :language_id => params[:language],
        :editor_settings => params[:editor_settings]
      })
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
      document_data.merge!({
        :author => params[:author],
        :author_location => params[:author_location],
        :short_summary => params[:summary],
        :keywords => params[:keywords],
        :language_id => params[:language],
        :editor_settings => params[:editor_settings]
      })
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
    
    get '/documents/:id/as/html' do
      redirect '/' unless logged?
      @document = Document.find(:document_id => params[:id])
      unless @document.user != current_user or @document.nil?
        @tags = database[:tags].all
        @text_blocks = Nokogiri::HTML(@document.story).xpath('//p')
        @document_title = @document.title || "Untitled document"
        @html = []
        @html << '<!DOCTYPE html>'
        @html << '<head>'
        @html << '<meta charset="utf-8">'
        @html << '<title>%s</title>' % @document_title
        @html << '</head>'
        @html << '<body>'
        for text_block in @text_blocks
          block_type = text_block.attributes['class']
          if block_type.text == 'text-block-' # FIXME
            block_type = 'p' 
          else
            block_type = block_type.text.match(/-([^->]+)$/)[1]
          end
          for tag_type in @tags
            content = text_block.inner_html.gsub('<%s' % tag_type[:name], '<a')
            content = text_block.inner_html.gsub('</%s' % tag_type[:name], '</a')
          end
          @html << '<%s>%s</%s>' % [block_type, content, block_type]
        end
        @html << '</body>'
        content_type "text/html; charset=utf-8"
        @html.join("\n")
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
