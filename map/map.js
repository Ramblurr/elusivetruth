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
    zoomControl: true,  // dont add the zoom overlay (it is added by default)
    loaderControl: false, //dont show tiles loader
  };

  var travel_url = 'http://elusivetruth.cartodb.com/api/v2/viz/d8b9da38-0a4d-11e3-8c39-3085a9a956e8/viz.json';
  cartodb.createVis('map', travel_url, options)
    .done(function(vis, layers) {

      native_map = vis.getNativeMap()
      // there are two layers, base layer and points layer
      var route_layer= layers[1].getSubLayer(0);
      route_layer.setInteraction(true);
      route_layer.infowindow.set('template', $('#infowindow_template').html());
      route_layer.set({
          sql: 'select  *, ST_AsGeoJSON(the_geom) as geometry from journey',
          interactivity: 'cartodb_id,geometry,name,description,url,url_text'
      });

      var point_layer = layers[1].getSubLayer(1);
      point_layer.setInteraction(true);
      point_layer.infowindow.set('template', $('#infowindow_template').html());
      point_layer.set({ interactivity: 'cartodb_id,name,description'});
      point_layer.on('featureClick', function(e, pos, latlng, data) {
          // no-op
      });


       route_layer.on('featureOver', function(e, pos, latlng, data) {
           $('.leaflet-container').css('cursor','default')
           if( data.url != null ) {
                $('.leaflet-container').css('cursor','pointer')
            }
            if (data.cartodb_id != polyline.cartodb_id) {
                drawHoverLine(data);
            }
        });
        route_layer.on('featureOut', function(e, pos, latlng, data) {
                $('.leaflet-container').css('cursor','default')
                removeLine();
            });
        route_layer.on('featureClick', function(e, pos, latlng, data) {
            if( data.url != null ) {
                window.location = data.url;
            }
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
