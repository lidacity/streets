// LidaCity, 2015-2016

var OptionLayer = {
 attribution: ' © <a href="http://www.openstreetmap.org/copyright">Openstreetmap</a> | © <a href="http://streets.lidacity.by/">LidaCity</a>',
 maxZoom: 18,
 minZoom: 11,
 maxBounds: [[53.80, 25.20], [54.00, 25.40]]
}

//var Map = L.map('map').setView([53.90, 25.30], 13);
//http://tile.openstreetmap.org/{z}/{x}/{y}.png
//http://wiki.openstreetmap.org/wiki/Tiles#Graphical_Map_Tiles
//L.tileLayer('https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', OptionLayer).addTo(Map);

var RU = L.tileLayer('https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', OptionLayer);
var BE = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', OptionLayer);

var BaseMaps = {
 "Русский язык": RU,
 "Беларуская мова": BE
};

var OptionMap = {
 center: [53.90, 25.30],
 zoom: 13,
 layers: [RU]
}

var Map = L.map('map', OptionMap);

//

function GetStyle(feature)
{
  var Zoom = Map.getZoom();
  var StyleGroup = feature.properties['StyleGroup'];
  var Style = StreetsStyle[StyleGroup];
  Style["fill"] = false;
  Style["lineCap"] = "butt";
  Style["lineJoin"] = "round";
  Style["weight"] = Zoom - 9;
  Style["opacity"] = (20 - Zoom) / 10;
  return Style;
}


function JsonEachFeature(feature, layer)
{
 feature.layer = layer;
 //
 var Name = "";
 if (feature.properties['ru']['Description'] != null)
 {
  Name = "<i>" + feature.properties['ru']['Description'] + "</i>:<br/ >";
  if (feature.properties['ru']['SiteLink'] == null)
   Name += "<font color='#DDD'><del>нет данных</del></font>";
  else
   Name += "<a href='https://ru.wikipedia.org/wiki/" + feature.properties['ru']['SiteLink'] + "' target='_blank' class='map-popup-link'>" + feature.properties['ru']['Label'] + "</a>";
  Name += "<hr width='300' />";
 }
 //
 var Note;
 if (feature.properties['Note'] == null)
  Note = "";
 else
  Note = "<hr /><small>" + feature.properties['Note'] + "</small>";
 //
 layer.bindPopup(
  "<b>" + feature.properties['ru']['Name'] + "</b><hr />" +
  Name +
  "<div id='wiki'></div>" +
  Note);
}


function Slice(Text)
{
 var Length = 256;
 if (Text.length > Length)
  return Text.slice(0, Length) + "…";
 else
  return Text;
}

function onPopupOpenClick(e)
{
 var queryWikipediaOption = {
  action: 'query',
  format: 'json',
  prop: 'pageimages|extracts',
  pithumbsize: '200',
  //exsentences: '2',
  exintro: '',
  explaintext: '',
  formatversion: '2',
  titles: e.layer.feature.properties['ru']['SiteLink']
 };
 var queryWikipedia = mw.api.query('https://ru.wikipedia.org/w/api.php', queryWikipediaOption);
 queryWikipedia(function (x) {
  var Result = x.query.pages[0];
  //console.log('mw', Result);
  var Text = document.getElementById('wiki');
  if (Result.thumbnail != null)
   Img = "<img alt='" + Result.title + "' src='" + Result.thumbnail.source + "' />";
  else
   Img = "";
  if (Result.extract != "")
   Text.innerHTML = Img + "<br />" + Slice(Result.extract);
  else
   Text.innerHTML = "<font color='#DDD'><del>в wiki отсутствует информация</del></font>";
 });

}



var OptionStreetsLayer = {
 style: GetStyle,
 onEachFeature: JsonEachFeature
}

var StreetsLayer = L.geoJson(StreetsData, OptionStreetsLayer);
StreetsLayer.on('popupopen', onPopupOpenClick);

var List = L.layerGroup([StreetsLayer]).addTo(Map);

var OverlayMaps = {
    "Их именами названы улицы": List
};

L.control.layers(BaseMaps, OverlayMaps).addTo(Map);

//StreetsLayer.addTo(Map);

//

function ZoomEnd()
{
 StreetsLayer.setStyle(GetStyle);
}

Map.on('zoomend', ZoomEnd);

//

function OptionShowResultFct(feature, container)
{
 var LabelName = L.DomUtil.create('b', null, container);
 LabelName.innerHTML = feature.properties['ru']['Label'];
 container.appendChild(L.DomUtil.create('br', null, container));
 container.appendChild(document.createTextNode(feature.properties['ru']['Description']));
 container.appendChild(L.DomUtil.create('br', null, container));
 var StreetName = L.DomUtil.create('small', null, container);
 StreetName.innerHTML = '<i>' + feature.properties['ru']['Name'] + '</i>';
}

var OptionsFuse = {
 position: 'topright',
 title: 'Chercher',
 placeholder: 'Найти улицу',
 maxResultLength: 7,
 threshold: 0.2,
 showInvisibleFeatures: false,
 showResultFct: OptionShowResultFct
};

var fuseSearchCtrl = L.control.fuseSearch(OptionsFuse);
Map.addControl(fuseSearchCtrl);
//fuseSearchCtrl.indexFeatures(StreetsData.features, ['ru.Label', 'ru.Name', 'ru.Description']);
fuseSearchCtrl.indexFeatures(StreetsData.features, ['popupContent']);
