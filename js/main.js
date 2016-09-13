// LidaCity, 2015-2016

var OptionMap = {
 attribution: ' © <a href="http://www.openstreetmap.org/copyright">Openstreetmap</a> | © <a href="http://streets.lidacity.by/">LidaCity</a>',
 maxZoom: 18,
 minZoom: 11,
 maxBounds: [[53.80, 25.20], [54.00, 25.40]]
}

var Map = L.map('map').setView([53.90, 25.30], 13);
//http://tile.openstreetmap.org/{z}/{x}/{y}.png
//http://wiki.openstreetmap.org/wiki/Tiles#Graphical_Map_Tiles
L.tileLayer('https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', OptionMap).addTo(Map);

//

function GetStyle(feature)
{
  var Zoom = Map.getZoom();
  var Style = StreetsStyle[Zoom];
  return Style[feature.properties.StyleGroup];
}

//

function JsonEachFeature(feature, layer)
{
 feature.layer = layer;
 layer.bindPopup(
  '<b>' + feature.properties.StreetRu + '</b><hr />' +
  '<i>' + feature.properties.Category + '</i>:<br/ >' +
  '<a href="https://ru.wikipedia.org/wiki/' + feature.properties.SiteLinkRu + '" target="_blank" class="map-popup-link">' + feature.properties.LabelRu + '</a><hr />' +
  '<small>' + feature.properties.Note + '</small>');
}

var OptionStreetsLayer = {
 style: GetStyle,
 onEachFeature: JsonEachFeature
}

var StreetsLayer = L.geoJson(StreetsData, OptionStreetsLayer);

//

function ZoomEnd()
{
 StreetsLayer.setStyle(GetStyle);
}

Map.on('zoomend', ZoomEnd);

//

function OptionShowResultFct(feature, container)
{
 var props = feature.properties;
 var LabelName = L.DomUtil.create('b', null, container);
 LabelName.innerHTML = props.LabelRu;
 container.appendChild(L.DomUtil.create('br', null, container));
 container.appendChild(document.createTextNode(props.Category));
 container.appendChild(L.DomUtil.create('br', null, container));
 var StreetName = L.DomUtil.create('small', null, container);
 StreetName.innerHTML = '<i>' + props.StreetRu + '</i>';
}

var OptionsFuse = {
 position: 'topright',
 title: 'Chercher',
 placeholder: 'Найти улицу',
 maxResultLength: 7,
 threshold: 0.2,
 showInvisibleStreets: false,
 showResultFct: OptionShowResultFct
};

var fuseSearchCtrl = L.control.fuseSearch(OptionsFuse);
Map.addControl(fuseSearchCtrl);
fuseSearchCtrl.indexStreets(StreetsData.features, ['LabelRu', 'StreetRu', 'Category']);

//

StreetsLayer.addTo(Map);
