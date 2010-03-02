$:.push(File.expand_path(File.join(File.dirname(__FILE__), '..', 'lib')))

require 'logger'

module Sinatra
  module SequelExtension
    def database=(conn_params)
      @database = nil
      set :database_url, nil
      set :conn_params, nil
      if conn_params.is_a?(String)
        set :database_url, conn_params
      else
        set :conn_params, conn_params
      end
      database
    end

    def database
      @database ||= Sequel.connect(conn_params || database_url)
    end
  protected
    def create_migrations_table
      database.create_table? :migrations do
        primary_key :id
        String :name, :null => false, :index => true
        timestamp :ran_at
      end
    end
  end
end

module Budding
  module Database
    set :database, Budding::DBPARAMS
    database.loggers = [Logger.new($stdout)]
    def self.setup
      # migration 'create first table' do
      #   database.create_table :first_table do
      #     # primary_key
      #     # String
      #     # String
      #     # DateTime
      #     # DateTime
      #     # Fixnum
      #   end
      # end
    end
  end
end