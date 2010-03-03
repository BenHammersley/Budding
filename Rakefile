$:.push(File.expand_path(File.join(File.dirname(__FILE__), 'lib')))

require 'rubygems'
require 'rake/clean'
require 'fileutils'

require 'budding'
require 'conf/database'

task :setup_environment do
  Budding::setup_environment()
end

task :reset_full do
  db = Sequel.connect(:username => 'root', :password => '', :hostname => '127.0.0.1', :adapter => 'mysql')
  db.run("drop database if exists budding;")
  db.run("create database budding character set = 'utf8';")
  db.run("grant all privileges on budding.* to 'j0hn'@'localhost' identified by 'b0dd\!ng';")
  db.run("flush privileges;")
end

task :reset do
  db = Sequel.connect(BUDDING_ROOT::DBPARAMS)
  for table in db["show tables;"].all.collect { |t| t["Tables_in_#{Budding::DBPARAMS['database']}".to_sym] }
    db.run("drop table #{table};")
  end
end

task :setup_db => :setup_environment do
  Budding::Database::setup()
end

task :web do
  Budding::Frontend::run!(:host => 'localhost', :port => 8080)
end

task :try do
end