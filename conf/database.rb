unless Object.const_defined?(:BUDDING_ROOT)
  BUDDING_ROOT = File.expand_path(File.join(File.dirname(__FILE__), '..'))
  $:.push(File.join(BUDDING_ROOT, 'lib'))
  require 'budding'
end

require 'logger'
require 'rubygems'
require 'sequel'
require 'sinatra/sequel'
require 'bcrypt'

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
    set :database, Budding::CONFIG[:dbparams]
    database.loggers = [Logger.new($stdout)]
    def self.setup
      migration "create users, documents and languages tables" do
        database.create_table :users do
          primary_key :user_id, :type => Integer
          String :email, :size => 60
          String :password, :size => 60
        end
        database.create_table :languages do
          primary_key :language_id, :type => Integer
          String :language
        end
        database.create_table :documents do
            primary_key :document_id, :type => Bignum
            foreign_key :user_id, :users, :type => Integer
            String :title
            String :short_summary
            String :teaser
            String :story, :text => true
            String :locations
            String :people
            String :companies
            String :keywords
            foreign_key :language_id, :languages, :type => Integer
            DateTime :created_on
        end
      end
      migration "populate language dataset" do
        ["Afrikaans", "Arabic", "Bulgarian", "Bengali", "Bosnian",
          "Catalan (Valencia)", "Chinese (Traditional)", "Chinese (Simplified)",
          "Danish", "English (UK)", "English (USA)", "Farsi", "Finnish", "French (France)",
          "French (Canada)", "Hebrew", "Hindi", "Croatian", "Hungarian", "Indonesian",
          "Japanese", "Korean", "Lithuanian", "Malayalam", "Marathi", "Malay",
          "Norwegian", "Dutch", "Punjabi", "Polish", "Pashto", "Portuguese (Brazil)",
          "Portuguese (Portugal)", "Romanian", "Russian", "Slovak", "Slovenian",
          "Swahili", "Swedish", "Tamil", "Telugu", "Thai", "Tagalog", "Turkish",
          "Ukrainian", "Urdu", "Welsh", "Basque", "Esperanto", "Gaelic", "Japanese",
          "Javanese", "Serbian", "Kannada"].each do |lang|
            database[:languages].insert(:language => lang)
          end
      end
    end
    class User < Sequel::Model
      one_to_many :documents
      def before_create
        self.password = BCrypt::Password.create(self.password)
        super()
      end
      def login(email, password)
        self.email == email and BCrypt::Password.new(self.password) == password
      end
    end
    class Language < Sequel::Model; end
    class Document < Sequel::Model
      many_to_one :user
      many_to_one :language
      def before_create
        self.created_on = Time.now
      end
    end
  end
end