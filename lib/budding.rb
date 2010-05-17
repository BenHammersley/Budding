unless Object.const_defined?(:BUDDING_ROOT)
  BUDDING_ROOT = File.expand_path(File.join(File.dirname(__FILE__), '..'))
  $:.push(BUDDING_ROOT)
  $:.push(File.join(BUDDING_ROOT, 'lib'))
end

require 'sinatra'
require 'rubygems'
require 'sequel'
require 'sinatra/sequel'
require 'yaml'

module Budding
  CONFIG = {}
  autoload :Database, File.join(BUDDING_ROOT, 'conf', 'database.rb')
  autoload :Frontend, 'budding/frontend'
  def self.setup_environment()
    db_config_file = open(File.join(BUDDING_ROOT, 'conf', 'database.yml'))
    CONFIG[:dbparams] = YAML::load(db_config_file).inject({}) do |hash, (k, v)|
      hash.merge!({k.to_sym => v})
    end
    for path in ['public', 'log', 'tmp']
      Dir.mkdir(File.join(BUDDING_ROOT, path)) unless File.exist?(File.join(BUDDING_ROOT, path))
    end
  end
  setup_environment()
end
