require 'rubygems'
require 'sinatra'
require 'prawn'
require 'rtf'

unless Object.const_defined?(:BUDDING_ROOT)
  BUDDING_ROOT = File.expand_path(File.join(File.dirname(__FILE__), '..', '..'))
  $:.push(File.join(BUDDING_ROOT, 'lib'))
  require 'budding'
end

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
    end
    get '/' do
      #@now = Time.now
      #erb :index
      redirect '/login'
    end
    get '/login' do
      erb :login
    end
    post '/login' do
      @user = User.find(:email => params[:email])
      unless @user.nil?
        if @user.login(params[:email], params[:password])
          session[:user] = {:email => params[:email]}
          redirect '/dashboard'
        else
          @error_msg = "Email and password combination provided don't match."
        end
      else
        @error_msg = "User not registered. Do you want to sign up?"
      end
      erb :login
    end
    post '/signup' do
      @error_msg = "Password and password verifier don't match." if params[:signup_password] != params[:password_verifier]
      @error_msg = "User already exists. Maybe trying password recovery?" unless User.find(:email => params[:signup_email]).nil?
      if @error_msg.nil?
        @user = User.new({:email => params[:signup_email], :password => params[:signup_password]}).save
        session[:user] = {:email => params[:signup_email]}
        redirect '/dashboard'
      else
        erb :login
      end
    end
    get '/dashboard' do
      @documents = current_user.documents
      erb :dashboard
    end
    get '/document/create' do
      @languages = Language.all
      erb :"document/create"
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
        "txt" => "text/plain"
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
    # experimental -- jonas, march 23, 2010
    get '/experimental/create' do
      erb :"experimental/create"
    end
  end
end
