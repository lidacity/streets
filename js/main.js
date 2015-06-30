var map = L.map('map').setView([53.90, 25.30], 13);
 L.tileLayer.grayscale('http://tile.openstreetmap.org/{z}/{x}/{y}.png',
  { attribution: ' © <a href="http://www.openstreetmap.org/copyright">Openstreetmap</a> | © <a href="http://lidacity.by/street">LidaCity</a>',
    maxZoom: 18,
    minZoom: 11,
    maxBounds: [[53.80, 25.20], [54.00, 25.40]]
  }).addTo(map);

var streetsLayer = L.geoJson(streetsData.streets, {
 style: function (feature) {
  var zoom = map.getZoom(),
   style = streetsStyle[zoom];
  return style[feature.properties.stylegroup];
 },
 onEachFeature: function (feature, layer) {
  feature.layer = layer;
   layer.bindPopup(
    '<b>' + feature.properties.osm + '</b><hr />' +
    '<i>' + feature.properties.tag + '</i>:<br/ >' +
    '<a href="' + feature.properties.url + '" target="_blank" class="map-popup-link">' + feature.properties.name + '</a><hr />' +
    '');//feature.properties.wiki);
    
 }
});

map.on('zoomend', function() {
 streetsLayer.setStyle(function (feature) {
  var zoom = map.getZoom(),
   style = streetsStyle[zoom];
  return style[feature.properties.stylegroup];
 });
});

// Add fuse search control
var options = {
 position: 'topright',
 title: 'Chercher',
 placeholder: 'Найти улицу',
 maxResultLength: 7,
 threshold: 0.2,
 showInvisibleStreets: false,
 showResultFct: function(feature, container) {
  var props = feature.properties;
  var name = L.DomUtil.create('b', null, container);
  name.innerHTML = props.name;
  container.appendChild(L.DomUtil.create('br', null, container));
  container.appendChild(document.createTextNode(props.tag));
 }
};

var fuseSearchCtrl = L.control.fuseSearch(options);
map.addControl(fuseSearchCtrl);
fuseSearchCtrl.indexStreets(streetsData.streets, ['name', 'osm', 'tag']);

streetsLayer.addTo(map);
