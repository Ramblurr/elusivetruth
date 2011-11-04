# Code based on http://mikewest.org/2009/11/my-jekyll-fork

module Jekyll
  
  module Filters
    def to_month(input)
      return Date::MONTHNAMES[input.to_i]
    end

    def to_month_abbr(input)
      return Date::ABBR_MONTHNAMES[input.to_i]
    end
  end

  class Archive < Page
    include Jekyll::Filters
    # Initialize a new Archive.
    # +base+ is the String path to the <source>
    # +dir+ is the String path between <source> and the file
    #
    # Returns <Archive>
    def initialize(site, base, dir, type)
      @site = site
      @base = base
      @dir = dir
      @name = 'index.html'

      self.process(@name)

      self.read_yaml(File.join(base, '_layouts'), type + '.html')

      if type.match(/^tag_/)
          tag, year, month, day = dir.split('/')
      else
          year, month, day = dir.split('/')
      end

      self.data['year'] = year.to_i
      month and self.data['month'] = month.to_i
      day and self.data['day'] = day.to_i

      self.data['tag'] = tag if tag
      if month and tag
          self.data['next_link'] = self.next_month_link(year.to_i, month.to_i, tag)
          self.data['prev_link'] = self.previous_month_link(year.to_i, month.to_i, tag)
      elsif tag
          self.data['next_link'] = self.next_year_link(year.to_i, tag)
          self.data['prev_link'] = self.previous_year_link(year.to_i, tag)
      end
    end

    def previous_month_link(y,m,tag)
        if m == 1
            y -= 1
            m = 12
        else
            m -= 1
        end


        if self.site.collated_tags[tag][y][m]
            return "<a href=\"/#{tag}/#{y}/#{m}\">&larr; #{to_month(m)} #{y}</a>"
        end
        return ""
    end


    def next_month_link(y,m,tag)
        if m == 12
            y += 1
            m = 1
        else
            m += 1
        end

        if self.site.collated_tags[tag][y][m]
            return "<a href=\"/#{tag}/#{y}/#{m}\">#{to_month(m)} #{y} &rarr;</a>"
        end
        return ""
    end

    def previous_year_link(y,tag)
        y -= 1
        if self.site.collated_tags[tag][y]
            return "<a href=\"/#{tag}/#{y}\">&larr; #{y}</a>"
        end
        return ""
    end

    def next_year_link(y,tag)
        y += 1
        if self.site.collated_tags[tag][y]
            return "<a href=\"/#{tag}/#{y}\">#{y} &rarr;</a>"
        end
        return ""
    end
  end

  
  class Site
    attr_accessor :collated, :collated_tags
    
    # Write post archives to <dest>/<year>/, <dest>/<year>/<month>/,
    # <dest>/<year>/<month>/<day>/
    #
    # Returns nothing
    def write_archive( dir, type )
        archive = Archive.new( self, self.source, dir, type )
        archive.render( self.layouts, site_payload )
        archive.write( self.dest )
    end

    def write_archives
        self.collated.keys.each do |y|
            if self.layouts.key? 'archive_yearly'
                self.write_archive( y.to_s, 'archive_yearly' )
            end

            self.collated[ y ].keys.each do |m|
                if self.layouts.key? 'archive_monthly'
                    self.write_archive( "%04d/%02d" % [ y.to_s, m.to_s ], 'archive_monthly' )
                end

                self.collated[ y ][ m ].keys.each do |d|
                    if self.layouts.key? 'archive_daily'
                        self.write_archive( "%04d/%02d/%02d" % [ y.to_s, m.to_s, d.to_s ], 'archive_daily' )
                    end
                end
            end
        end
    end
    def write_tag_archives
        self.collated_tags.keys.each do |tag|
            self.collated_tags[tag].keys.each do |y|
                if self.layouts.key? 'tag_archive_yearly'
                    self.write_archive( "#{tag}/#{y.to_s}", 'tag_archive_yearly')
                end

                self.collated_tags[tag][ y ].keys.each do |m|
                    if self.layouts.key? 'tag_archive_monthly'
                        self.write_archive( "%s/%04d/%02d" % [ tag, y.to_s, m.to_s ], 'tag_archive_monthly' )
                    end

                    self.collated_tags[tag][ y ][ m ].keys.each do |d|
                        if self.layouts.key? 'archive_daily'
                            self.write_archive( "%s/%04d/%02d/%02d" % [ tag, y.to_s, m.to_s, d.to_s ], 'archive_daily' )
                        end
                    end
                end
            end
        end
    end
  end

  AOP.after(Site, :reset) do |site_instance, result, args|
    site_instance.collated = {}
    site_instance.collated_tags = {}
  end
  
  AOP.before(Site, :render) do |site_instance, result, args|
    site_instance.posts.reverse.each do |post|
      y, m, d = post.date.year, post.date.month, post.date.day

      post.tags.each do |tag|
          unless site_instance.collated_tags.key? tag
            site_instance.collated_tags[ tag ] = {}
          end
          unless site_instance.collated_tags[tag].key? y
            site_instance.collated_tags[ tag ][ y ] = {}
          end
          unless site_instance.collated_tags[tag][y].key? m
            site_instance.collated_tags[ tag ][ y ][ m ] = {}
          end
          unless site_instance.collated_tags[tag][y][m].key? d
            site_instance.collated_tags[ tag ][ y ][ m ][ d ] = []
          end
          site_instance.collated_tags[tag][ y ][ m ][ d ] += [ post ]
      end

      unless site_instance.collated.key? y
        site_instance.collated[ y ] = {}
      end
      unless site_instance.collated[y].key? m
        site_instance.collated[ y ][ m ] = {}
      end
      unless site_instance.collated[ y ][ m ].key? d
        site_instance.collated[ y ][ m ][ d ] = []
      end
      site_instance.collated[ y ][ m ][ d ] += [ post ]
    end
  end
  
  AOP.after(Site, :write) do |site_instance, result, args|
    site_instance.write_archives
    site_instance.write_tag_archives
  end
  
  AOP.around(Site, :site_payload) do |site_instance, args, proceed, abort|
    result = proceed.call
    result["site"]["collated_posts"] = site_instance.collated
    result["site"]["collated_tags"] = site_instance.collated_tags
    result
  end
end
