module Jekyll
  AOP.around(Site, :site_payload) do |site_instance, args, proceed, abort|
    dailies_years = []
    dailies_archives = {}

    site_instance.collated_tags.each do |tag, hash|
        unless tag == "dailies"
            next
        end
        hash.each do |year, hash2|
            hash2.each do |month, days|

            if days.values.flatten.length > 0
              unless dailies_archives.key? year
                dailies_years << year
                dailies_archives[year] = []
              end
                dailies_archives[year] += [ {
                  'name' => "#{Date::MONTHNAMES[month]}",
                  'url' => "/#{year}/#{"%02d" % month}",
                  'posts' => days.values.flatten
                } ]
            end
        end
      end
    end

    result = proceed.call
    result['site']['dailies_archives'] = dailies_archives
    result['site']['dailies_years'] = dailies_years
    result
  end
end
