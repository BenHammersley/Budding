require 'net/http'
require 'uri'
require 'stringio'
require 'zlib'

module Budding
  class BaseScraper
    attr_accessor :domain, :path, :port
    FIREFOX_HEADERS = {
      'User-Agent' => 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.0.6) Gecko/2009011913 Firefox/3.0.6 (.NET CLR 3.5.30729)',
      'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language' => 'en-us,en;q=0.5',
      'Accept-Encoding' => 'gzip,deflate',
      'Accept-Charset' => 'ISO-8859-1,utf-8;q=0.7,*;q=0.7',
      'Connection' => 'close'
    }
    def initialize(options={})
      @parsed_url = URI::parse(options['url'])
      @domain = @parsed_url.host
      @port = @parsed_url.port
      @path = @parsed_url.path
    end
    def download_page(path, domain=nil, port=nil)
      domain ||= @domain
      path ||= @path
      port ||= @port
      @httpclient = Net::HTTP.new(domain, 80)
      resp, data = @httpclient.get2(path, FIREFOX_HEADERS)
      if resp.header['content-encoding'].downcase == 'gzip'
        data_fileobj = StringIO.new
        data_fileobj.write(data)
        data_fileobj.rewind()
        gzip_reader = Zlib::GzipReader.new(data_fileobj)
        data = gzip_reader.read()
      end
      return data
    end
    def utf8?(string) # comes from Rails
      # unpack is a little bit faster than regular expressions
      string.unpack('U*')
      true
    rescue ArgumentError
      false
    end
  end
end
