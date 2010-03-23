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
  dbparams = Budding::CONFIG[:dbparams]
  db.run("drop database if exists %s;" % dbparams[:database])
  if dbparams[:encoding]
    db.run("create database budding character set = '%s';" % dbparams[:encoding])
  end
  dbauth = [dbparams[:database], dbparams[:username], dbparams[:hostname], dbparams[:password]]
  db.run("grant all privileges on %s.* to '%s'@'%s' identified by '%s';" % dbauth)
  db.run("flush privileges;")
end

task :reset do
  db = Sequel.connect(Budding::CONFIG[:dbparams])
  for table in db["show tables;"].all.collect { |t| t["Tables_in_#{Budding::CONFIG[:dbparams][:database]}".to_sym] }
    db.run("drop table #{table};")
  end
end

task :setup_db => :setup_environment do
  Budding::Database::setup()
end

task :web do
  hostname = {'staging' => 'li147-10.members.linode.com', 'local' => 'localhost'}[ENV['BUDDING_ENV']]
  Budding::Frontend::run!(:host => hostname, :port => 8080)
end

task :try do
end