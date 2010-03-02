$:.push(File.expand_path(File.join(File.dirname(__FILE__), 'lib')))

require 'rubygems'
require 'rake/clean'
require 'fileutils'

require 'budding'
require 'conf/database'

task :setup_environment do
  Budding::setup_environment()
end

task :setup_db => :setup_environment do
  Budding::Database::setup()
end

task :web do
  Budding::Frontend::run!(:host => 'localhost', :port => 8080)
end

task :try do
  # ...
end