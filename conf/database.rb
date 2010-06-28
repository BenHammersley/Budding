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

=begin

  users
  -----
  user_id int
  email varchar(60)
  password varchar(60)
  
  documents
  ---------
  document_id bigint
  user_id int
  title varchar(255)
  short_summary varchar(255)
  teaser varchar(255)
  story text
  locations varchar(255)
  people varchar(255)
  companies varchar(255)
  keywords varchar(255)
  language_id int
  created_on datetime
  author varchar(255)
  author_location varchar(255)
  
  languages
  ---------
  language_id int
  name varchar(255)
  
  tags
  ----
  tag_id bigint
  name varchar(255)
  canonical_resource varchar(255)
  suggested_resources varchar(255)
  created_at datetime
  category varchar(60)
  
  migrations
  ----------
  id int
  name varchar(255)
  ran_at timestamp

=end

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
          String :name
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
            database[:languages].insert(:name => lang)
          end
      end
      migration "add tags table" do
        database.create_table :tags do
          # id, name, category, canonical_resource, suggested_resources
            primary_key :tag_id, :type => Bignum
            String :name
            String :canonical_resource
            String :suggested_resources
            DateTime :created_at
        end
      end
      migration "add category to tags" do
        database.add_column(:tags, :category, String, :size => 60)
      end
      migration "add author info to documents" do
        database.add_column(:documents, :author, String, :size => 255)
        database.add_column(:documents, :author_location, String, :size => 255)
      end
      migration "add editor_settings to documents" do
        database.add_column(:documents, :editor_settings, :text)
      end
      migration "rename tags to links" do
        database.rename_table :tags, :links
      end
      migration "add new tags table" do
        database.create_table :tags do
          # id, name, category, canonical_resource, suggested_resources
          primary_key :tag_id, :type => Bignum
          String :name
          String :description
          String :query_url
          DateTime :created_at
        end
      end
      migration "rename links table attributes" do
        database.run("alter table links change column tag_id link_id bigint(20) not null;")
        database.rename_column :links, :canonical_resource, :href
      end
      migration "rename other links table attributes" do
        database.rename_column :links, :category, :tag
        database.rename_column :links, :name, :title
      end
      migration "fix links primary key" do
        database.run("alter table links change column link_id link_id bigint(20) auto_increment not null;")
      end
      migration "add user's role" do
        database.add_column(:users, :role, :text)
      end
    end
    class User < Sequel::Model
      one_to_many :documents
      def before_create
        self.password = BCrypt::Password.create(self.password)
        super()
      end
      def login(email, password)
        unless self.email.nil? or self.password.nil?
          self.email == email and BCrypt::Password.new(self.password) == password
        end
      end
      def admin?
        self.role == "admin"
      end
    end
    class Language < Sequel::Model
      one_to_many :document
    end
    class Document < Sequel::Model
      many_to_one :user
      many_to_one :language
      def before_create
        self.created_on = Time.now
      end
    end
  end
end