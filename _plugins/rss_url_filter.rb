require 'liquid'

module RSSURLFilter

    def relative_urls_to_absolute(content)
      # set your site's url
      url = "http://elusivetruth.net/"

      # rewrite all src and href attributes that begin with /
      content.gsub(Regexp.quote("src='/"), "src='" + url).gsub(Regexp.quote("src=\"/"), "src=\"" + url).gsub(Regexp.quote("href='/"), "href='" + url).gsub(Regexp.quote("href=\"/"), "href=\"" + url)
    end

end

Liquid::Template.register_filter(RSSURLFilter)
