var map;
var map;
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


function main() {

  var options = {
    center: [-42.27730877423707, 172.63916015625],
    zoom: 6, 
    zoomControl: false,  // dont add the zoom overlay (it is added by default)
    loaderControl: false //dont show tiles loader
  };

  cartodb.createVis('map', 'http://saleiva.cartodb.com/api/v1/viz/thehobbit_filmingloc/viz.json', options)
    .done(function(vis, layers) {
      // there are two layers, base layer and points layer
      var layer = layers[1];
      layer.setInteractivity(['cartodb_id', 'name_to_display', 'description']);

      // Set the custom infowindow template defined on the html
      layer.infowindow.set('template', $('#infowindow_template').html());

      // add the tooltip show when hover on the point
      vis.addOverlay({
        type: 'tooltip',
        template: '<p>{{name_to_display}}</p>'
      });

      vis.addOverlay({
        type: 'infobox',
        template: '<h3>{{name_to_display}}</h3><p>{{description}}</p>',
        width: 200,
        position: 'bottom|right'
      });

    });

}

window.onload = main;
