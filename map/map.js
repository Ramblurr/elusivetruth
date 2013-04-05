var native_map;

function main() {

// Get url parameters
var params = {};
window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
  params[key] = value;
});

if (params.layers) {
  var activeLayers = params.layers.split(',').map(function(item) { // map function not supported in IE < 9
    return layers[item];
  });
}


  var options = {
    center: [params.lat || 20, params.lng || 0],
    zoom: params.zoom || 3,
    zoomControl: false,  // dont add the zoom overlay (it is added by default)
    loaderControl: false, //dont show tiles loader
    sql: 'select  *, ST_AsGeoJSON(the_geom) as geometry from {{table_name}}'
  };

  var journey_url = 'http://elusivetruth.cartodb.com/api/v1/viz/7031/viz.json'
  var points_url = 'http://elusivetruth.cartodb.com/api/v1/viz/7049/viz.json'
  cartodb.createVis('map', journey_url, options)
    .done(function(vis, layers) {

      native_map = vis.getNativeMap()
      // there are two layers, base layer and points layer
      var layer = layers[1];
      layer.setInteractivity('cartodb_id,geometry,name,description,url,url_text');

      // Set the custom infowindow template defined on the html
      layer.infowindow.set('template', $('#infowindow_template').html());

       layer.on('featureOver', function(e, pos, latlng, data) {
           $('.leaflet-container').css('cursor','default')
           if( data.url != null ) {
                $('.leaflet-container').css('cursor','pointer')
            }
            if (data.cartodb_id != polyline.cartodb_id) {
                drawHoverLine(data);
            }
        });
        layer.on('featureOut', function(e, pos, latlng, data) {
                $('.leaflet-container').css('cursor','default')
                removeLine();
            });
        layer.on('featureClick', function(e, pos, latlng, data) {
            if( data.url != null ) {
                window.location = data.url;
            }
            });
    cartodb.createLayer(native_map, points_url)
      .on('done', function(layer) {
          native_map.addLayer(layer)
          layer.infowindow.set('template', $('#infowindow_template').html());
          layer.setInteractivity('cartodb_id,name,description');
          layer.on('featureClick', function(e, pos, latlng, data) {
            console.log("clicked! " + data.img_small)
          });
      });

      // add the tooltip show when hover on the point
      vis.addOverlay({
        type: 'tooltip',
        template: '<p>{{name}}</p>'
      });

      vis.addOverlay({
        type: 'infobox',
        template: '<h3>{{name}}</h3><p>{{description}}</p>',
        width: 200,
        position: 'top|right'
      });

          });

}

var polyline = new L.GeoJSON(null)
// Hover polyline style
var polyline_style = {color:"#ffffff", weight: 5, opacity:0.8, fillOpacity: 0, clickable:false}
function drawHoverLine(data){
    removeLine();

    polyline = new L.GeoJSON(JSON.parse(data.geometry),{
        style: function (feature) {
            return polyline_style;
          }
    }).addTo(native_map);

}

function removeLine(){
    native_map.removeLayer(polyline);
    polyline.cartodb_id = null;
}


window.onload = main;
