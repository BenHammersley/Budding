require 'rubygems'
require 'sinatra'

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
    set :public, "public"
    set :views, File.join(BUDDING_ROOT, 'lib/budding/frontend/views')
    get '/' do
      #@now = Time.now
      #erb :index
      redirect '/login'
    end
    get '/login' do
      erb :login
    end
    post '/login' do
      @user = User.filter(:email => params[:email]).first
      unless @user.nil?
        if @user.login(params[:email], params[:password])
          session[:user] = @user
          redirect '/dashboard'
        else
          @error = "Email and password combination provided don't match."
        end
      else
        @error = "User not registered. Do you want to sign up?"
      end
      erb :login
    end
    post '/signup' do
      @error = "Password and password verifier don't match." if params[:signup_password] != params[:password_verifier]
      @error = "User already exists. Maybe trying password recovery?" unless User.find(:email => params[:signup_email]).nil?
      unless defined?(:error)
        @user = User.new({:email => params[:signup_email], :password => params[:signup_password]}).save
        session[:user] = @user
        redirect '/dashboard'
      else
        erb :login
      end
    end
    get '/dashboard' do
      erb :dashboard
    end
  end
end