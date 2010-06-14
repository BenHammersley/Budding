$:.push(File.expand_path(File.join(File.dirname(__FILE__), 'lib')))

require 'rubygems'
require 'nokogiri'
require 'set'
require 'rake/clean'
require 'fileutils'
require 'open-uri'

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

namespace :user do
  task :add do
    Budding::Database::User.new({:email => ENV['EMAIL'], :password => ENV['PASSWORD']}).save()
    puts("Added user '#{ENV['EMAIL']}' with password '#{ENV['PASSWORD']}'.")
  end
  task :remove do
    Budding::Database::User.find({:email => ENV['EMAIL']}).delete()
    puts("Removed user '#{ENV['EMAIL']}'.")
  end
  task :list do
    for user in Budding::Database::User.all
      puts(user.email)
    end
  end
end

task :web do
  hostname = {'staging' => 'li147-10.members.linode.com', 'local' => 'localhost'}[ENV.fetch('BUDDING_ENV', 'local')]
  Budding::Frontend::run!(:host => hostname, :port => 8080)
end

task :try do
end

task :start_openoffice do
  oo_pid = File.join(BUDDING_ROOT, "conf", "oo_pid")
  `soffice -accept="socket,host=localhost,port=2002;urp;StarOffice.ServiceManager" -norestore -nofirstwizard -nologo -headless`
  File.open(oo_pid) do |f|
    f << $?.pid
  end
end

task :stop_openoffice do
  oo_pid_file = File.join(BUDDING_ROOT, "conf", "oo_pid")
  oo_pid = File.read(oo_pid)
  `kill -s 9 #{oo_pid}`
end

def get_all_the_text(doc, text_list=nil)
  text_list ||= []
  for child in doc.children
    unless ['meta link script style'].include?(child.name)
      text = child.inner_html().strip
      if text.length != 0
        text_list << text
      end
    end
    # if child.children.length > 1
    #   get_all_the_text(child, text_list)
    # end
  end
  return text_list
end

task :extract_text_from_html do
  html = open('http://railstips.org/blog/archives/2009/04/01/crack-the-easiest-way-to-parse-xml-and-json/').read
  doc = Nokogiri::HTML(html)
  puts doc.xpath('//*/text()').select { |t| !["script", "style", "link"].include?(t.parent.name) }.collect { |t| t.text.strip }.select { |t| t != "" }
  # puts get_all_the_text(doc)
end

task :read_wikipedia_xml do
  wxml = Nokogiri::XML(open('test/wikipedia/apple_inc.xml'))
  # Nokogiri's XPATH implementation doesn't seem to parse 
  # Wikipedia's XML format very well, which forces us to...
  root = wxml.child
  i = 0
  i += 1 while root.children[i].name != "page"
  page = root.children[i]
  i = 0
  i += 1 while page.children[i].name != "revision"
  revision = page.children[i]
  i = 0
  i += 1 while (revision.children[i].text.length < 100)
  text = revision.children[i].text
  potential_keywords = text.scan(/[A-Z]\w+(?:(?: )[A-Z]\w+)/)
  puts set(potential_keywords).to_a
end