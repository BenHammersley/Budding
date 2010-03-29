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
    
    helpers do
      def current_user
        @user ||= User.find(:email => session[:user][:email])
      end
      def ui_code_dump(thing)
        %Q{<pre style="margin: 15px 0px 15px 0px; font-family: monofur;">#{thing.gsub('<', '&lt;').gsub('>', '&gt;')}</pre>}
      end
    end
    
    use Rack::Auth::Basic do |username, password|
      username == 'budding' && password == 'zomgwtfl0lz'
    end
    
    use Rack::Flash, :accessorize => [:info, :form]

    get '/' do
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
    
    get '/document/create' do
      @title = "Budding: Untitled document"
      @languages = Language.all
      erb :"experimental/create"
    end
    post '/document/create' do
      document_data = {
        :user_id => current_user.user_id,
        :title => params[:title],
        :short_summary => params[:summary],
        :teaser => params[:teaser],
        :story => params[:story],
        :locations => params[:locations],
        :people => params[:people],
        :companies => params[:companies],
        :keywords => params[:keywords],
        :language_id => params[:language]
      }
      doc = Document.new(document_data)
      if doc.save
        redirect "/document/open/#{doc.document_id}"
      else
        'Error'
      end
    end
    get '/document/open/:id' do
      @document = Document.find(:document_id => params[:id])
      unless @document.user != current_user or @document.nil?
        @lang = @document.language.name
        erb :"document/open"
      else
        #erb :"document/not_found"
        raise ::Sinatra::NotFound
      end
    end
    get '/document/export/:filetype/:id' do
      mime_type = {
        "pdf" => "application/pdf",
        "rtf" => "application/rtf",
        "txt" => "text/plain",
        "doc" => "application/msword"
      }
      @document = Document.find(:document_id => params[:id])
      unless @document.user != current_user or @document.nil?
        content_type "#{mime_type[params[:filetype]]}; charset=utf-8"
        response['Content-Disposition'] = 'inline; filename="%s.%s"' %
                                          [Rack::Utils.escape_html(@document.title), params[:filetype]]
        erb :"document/export/#{params[:filetype]}"
      else
        #erb :"document/not_found"
        raise ::Sinatra::NotFound
      end
    end
    get '/document/edit/:id' do
      @document = Document.find(:document_id => params[:id])
      @languages = Language.all
      unless @document.nil?
        erb :"document/edit"
      else
        #erb :"document/not_found"
        raise ::Sinatra::NotFound
      end
    end
    post '/document/edit/:id' do
      document_data = {
        :user_id => current_user.user_id,
        :title => params[:title],
        :short_summary => params[:summary],
        :teaser => params[:teaser],
        :story => params[:story],
        :locations => params[:locations],
        :people => params[:people],
        :companies => params[:companies],
        :keywords => params[:keywords],
        :language_id => params[:language]
      }
      doc = Document.find(:document_id => params[:id]).update(document_data)
      if doc.save
        redirect "/document/open/#{doc.document_id}"
      else
        'Error'
      end
    end
  end
end
