/*
Smugmug recent photos widget


Usage:

1. Build or reuse the yahoo pipe here [1]
2. Save the pipe, and grab the "Get as JSON" url
3. Plug into 'jsonp_url' variable below
4. Plop this html into your page:
    <div id="smugmug_photos"><script src="/photos.js" type="text/javascript"></script>
    <div class="loading">Loading Photos...</div></div>
5. Style to your hearts content

Example at: http://elusivetruth.net

Created: September 17, 2012
Author: Casey Link <unnamedrambler@gmail.com>
Based on JS from Alex Marandon's "How to build a web widget (using jQuery)" [2]

[1]: http://pipes.yahoo.com/pipes/pipe.info?_id=06c20c592c63684bf5315b9c9e534180
[2]: http://alexmarandon.com/articles/web_widget_jquery/
*/


(function() {
// Localize jQuery variable
var jQuery;

/******** Load jQuery if not present *********/
if (window.jQuery === undefined || window.jQuery.fn.jquery !== '1.4.2') {
    var script_tag = document.createElement('script');
    script_tag.setAttribute("type","text/javascript");
    script_tag.setAttribute("src",
        "http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js");
    if (script_tag.readyState) {
      script_tag.onreadystatechange = function () { // For old versions of IE
          if (this.readyState == 'complete' || this.readyState == 'loaded') {
              scriptLoadHandler();
          }
      };
    } else {
      script_tag.onload = scriptLoadHandler;
    }
    // Try to find the head, otherwise default to the documentElement
    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
} else {
    // The jQuery version on the window is the one we want to use
    jQuery = window.jQuery;
    main();
}

/******** Called once jQuery has loaded ******/
function scriptLoadHandler() {
    // Restore $ and window.jQuery to their previous values and store the
    // new jQuery in our local jQuery variable
    jQuery = window.jQuery.noConflict(true);
    // Call our main function
    main();
}

/******** Our main function ********/
function main() {
    jQuery(document).ready(function($) {
        var jsonp_url = "http://pipes.yahoo.com/pipes/pipe.run?_id=06c20c592c63684bf5315b9c9e534180&_render=json&limit=6&_callback=?";
        $.getJSON(jsonp_url, function(data) {
            $(data.value.items).each(function(index,item)
            {
                var item_html = '<div class="smugmug_image" id="smugmug_image1"><a href="'+item.link+'"><img src="'+item.id+'" alt="'+item.title+'" title="'+item.title+'" height="75" width="75"></a></div>';
                $('#smugmug_photos').append(item_html);
            });
            $('#smugmug_photos div.loading').fadeOut();
            //$('#smugmug_photos ul.rss-items').slideDown();
        });
    });
}

})(); // We call our anonymous function immediately
