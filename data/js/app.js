// create base map
var base_map = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?access_token=' + config.api_key);

// path to json
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// marker size
function radius(magnitude) {
  return magnitude * 5;
}

// color scale
function color(magnitude) {
  return magnitude > 5 ? '#900000' :
    magnitude > 4 ? '#ff0000' :
      magnitude > 3 ? '#ff6600' :
        magnitude > 2 ? '#ff9900' :
          magnitude > 1 ? '#ffcc00' :
            '#ffff00';
}

// load json with features
d3.json(url, d => {
  get_features(d, d.features);
});

// getting features and build markers
function get_features(quake_data) {
  function pointToLayer(feature, latlng) {
    var marker_style = {
      stroke: true,
      weight: 1,
      fillOpacity: 0.5,
      fillColor: color(feature.properties.mag),
      color: "white",
      radius: radius(feature.properties.mag)
    };
    return new L.circleMarker(latlng, marker_style);
  }

  // add pop ups to each marker
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + new Date(feature.properties.time) + "<br> Magnitude: " + feature.properties.mag + "</p>");
  }

  // load quake coordinates
  var quakes = L.geoJSON(quake_data, {
    pointToLayer: pointToLayer,
    onEachFeature: onEachFeature
  });

  build_map(quakes);
}

// build map
function build_map(quakes) {
  var myMap = L.map("map", {
    center: [14.5995, 120.9842],
    zoom: 3,
    layers: [base_map, quakes]
  });

  // add legend
  var legend = L.control({ position: "topright" });

  legend.onAdd = function () {
    var div = L.DomUtil.create("div", "info legend"),
      grades = [0, 1, 2, 3, 4, 5];
    grades.forEach(d => {
      div.innerHTML += '<i style="background: ' + color(d + 1) + '"></i>' + d + (d + 1 ? '&ndash;' + (d + 1) + '<br>' : '+');
    })
    return div;
  };

  legend.addTo(myMap);
}
