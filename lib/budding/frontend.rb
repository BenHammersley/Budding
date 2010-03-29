require 'rubygems'
require 'sinatra'
require 'prawn'
require 'rtf'

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
      
      def ui_code_dump(thing)
        %Q{<pre style="margin: 15px 0px 15px 0px; font-family: monofur;">#{thing.gsub('<', '&lt;').gsub('>', '&gt;')}</pre>}
      end

      def ui_editor()
        @text_blocks = [] 
        if @document
          @title = "Budding: #{@document.title}" if @document.title
          @text_blocks = @document.story.split("\n\n") if @document.story
        else
          @title = "Budding: Untitled document"
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
      flash.form = 'signup' if flash.form.nil?
      erb :index
    end

    post '/login' do
      @user = User.find(:email => params[:email])
      unless @user.nil?
        if @user.login(params[:email], params[:password])
          session[:user] = {:email => params[:email]}
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

    post '/signup' do
      unless User.find(:email => params[:signup_email]).nil?
        flash.info = "It looks like your e-mail is already registered. Try logging in instead." 
      else
        @user = User.new({:email => params[:signup_email], :password => params[:signup_password]}).save
        session[:user] = {:email => params[:signup_email]}
        redirect '/dashboard'
      end
      flash.form = 'login'
      redirect '/'
    end
    
    get '/dashboard' do
      @title = "Budding: Dashboard"
      @documents = current_user.documents_dataset.order(:created_on.desc).all
      erb :dashboard
    end
    
    get '/editor' do
      @document = Document.new
      ui_editor()
    end
    
    post '/documents' do
      document_data = {
        :user_id => current_user.user_id,
        :title => params[:title],
        :story => params[:story]
      }
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
      if doc.save
        redirect "/documents/#{doc.document_id}"
      else
        'Error'
      end
    end
    
    get '/documents/:id' do
      @document = Document.find(:document_id => params[:id])
      unless @document.user != current_user or @document.nil?
        @lang = @document.language.name unless @document.language.nil?
        ui_editor()
      else
        # erb :"document/not_found"
        raise ::Sinatra::NotFound
      end
    end
    
    get '/documents/:id/as/:filetype' do
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
        
  end
end
