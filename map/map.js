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

    if(params.place) {
        if(params.place == "europe") {
            params.lat = 48;
            params.lng = 14;
            params.zoom = 5;
        } else if(params.place == "south-america") {
            params.lat = -3;
            params.lng = -49;
            params.zoom = 4;
        } else if(params.place == "balkans") {
            params.lat = 43;
            params.lng = 19;
            params.zoom = 6;
       }
    }

    var options = {
        center: [params.lat || 20, params.lng || 0],
        zoom: params.zoom || 3,
        zoomControl: true,
        loaderControl: false,
    };

    var travel_url = 'http://elusivetruth.cartodb.com/api/v2/viz/d8b9da38-0a4d-11e3-8c39-3085a9a956e8/viz.json';
    cartodb.createVis('map', travel_url, options).done(function(vis, layers) {

        native_map = vis.getNativeMap();
        // there are two layers, base layer and points layer
        var route_layer = layers[1].getSubLayer(0);
        var point_layer = layers[1].getSubLayer(1);
        route_layer.setInteraction(true);
        route_layer.infowindow.set('template', $('#infowindow_template').html());
        route_layer.set({
            sql: 'select  *, ST_AsGeoJSON(the_geom) as geometry from journey',
            interactivity: 'cartodb_id,geometry,name,description,url,url_text'
        });

        // add the tooltip show when hover on the point
        vis.addOverlay({
            type: 'tooltip',
            template: '<p>{{name}}</p>'
        });

        // HACK - manually add overlay to attach it to your route layer
        // re: https://github.com/CartoDB/cartodb.js/issues/64
        /*
        vis.addOverlay({
            type: 'infobox',
            template: '<h3>{{name}}</h3><p>{{description}}</p>',
            width: 200,
            position: 'top|right'
        });
        */
        var infobox = new cdb.geo.ui.InfoBox({ template: '<h3>{{name}}</h3><p>{{description}}</p>', layer: route_layer, position: 'top|right', width: 200 });
        vis.container.append(infobox.render().el);

        route_layer.on('featureOver', function(e, pos, latlng, data) {
            if (data.cartodb_id != polyline.cartodb_id) {
                drawHoverLine(data);
            }
        });
        route_layer.on('featureOut', function(e, pos, latlng, data) {
            removeLine();
        });
        route_layer.on('featureClick', function(e, pos, latlng, data) {
            // no-op
        });

        point_layer.setInteraction(true);
        point_layer.infowindow.set('template', $('#infowindow_template').html());
        point_layer.set({
            interactivity: 'cartodb_id,name,description'
        });
        point_layer.on('featureOver', function(e, pos, latlng, data) {
            $('.leaflet-container').css('cursor', 'pointer');
        });
        point_layer.on('featureOut', function(e, pos, latlng, data) {
            $('.leaflet-container').css('cursor', 'default');
        });
        point_layer.on('featureClick', function(e, pos, latlng, data) {
            // no-op
        });
    });
}

var polyline = new L.GeoJSON(null);
// Hover polyline style
var polyline_style = {
    color: "#ffffff",
    weight: 5,
    opacity: 0.8,
    fillOpacity: 0,
    clickable: false
};

function drawHoverLine(data) {
    removeLine();

    polyline = new L.GeoJSON(JSON.parse(data.geometry), {
        style: function(feature) {
            return polyline_style;
        }
    }).addTo(native_map);

}

function removeLine() {
    native_map.removeLayer(polyline);
    polyline.cartodb_id = null;
}


window.onload = main;
