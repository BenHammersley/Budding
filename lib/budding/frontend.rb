require 'rubygems'
require 'sinatra'

unless Object.const_defined?(:BUDDING_ROOT)
  BUDDING_ROOT = File.expand_path(File.join(File.dirname(__FILE__), '..', '..'))
  $:.push(File.join(BUDDING_ROOT, 'lib'))
  require 'budding'
end

module Budding
  class Frontend < Sinatra::Base
    enable :static
    set :root, BUDDING_ROOT
    set :views, File.join(BUDDING_ROOT, 'lib/budding/frontend/views')
    get '/' do
      @now = Time.now
      erb :index
    end
  end
end