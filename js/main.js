// LidaCity, 2015-2016

var OptionLayer = {
 attribution: ' © <a href="http://www.openstreetmap.org/copyright">Openstreetmap</a> | © <a href="http://streets.lidacity.by/">LidaCity</a>',
 maxZoom: 18,
 minZoom: 11,
 maxBounds: [[53.80, 25.20], [54.00, 25.40]],
 noWrap: true,
}

var Lang = Translate();

var RU = L.tileLayer.grayscale('tiles.ru/{z}/{x}/{y}.png', OptionLayer);
var BE = L.tileLayer.grayscale('tiles.be/{z}/{x}/{y}.png', OptionLayer);

var BaseMaps = {
 "Русский язык": RU,
 "Беларуская мова": BE
};

switch (Lang)
{
 case 'ru':
  Layer = RU;
  break;
 case 'be':
  Layer = BE;
  break;
 default:
  Layer = RU;
}

var OptionMap = {
 center: [53.90, 25.30],
 zoom: 13,
 layers: [Layer],
 fadeAnimation: false,
}

var Map = L.map('map', OptionMap);

var Bounds = [[53.85, 25.2], [53.96, 25.4]];
Map.setMaxBounds(Bounds);
Map.on('drag', function() { Map.panInsideBounds(Bounds, { animate: false }); });

//

var AboutPopup = L.popup().setContent("<center><b>" + _('About') + "</b><br />" + _('Address') + "<br /><p><img src='favicon.png' /></p></center><br /><br />&copy; <a href='mailto:dzmitry@lidacity.by'>dzmitry@lidacity.by</a>, 2005, 2016");

L.easyButton("&starf;", function(btn, map){
 AboutPopup.setLatLng(map.getCenter()).openOn(map);
}).addTo(Map);

//

function GetStyle(feature)
{
  var Zoom = Map.getZoom();
  var StyleGroup = feature.properties.StyleGroup;
  var Style = StreetsStyle[StyleGroup];
  Style.fill = false;
  Style.lineCap = "butt";
  Style.lineJoin = "round";
  Style.weight = Zoom - 9;
  Style.opacity = (20 - Zoom) / 10;
  return Style;
}


function GetName(Properties)
{
 var Result = "";
 if (!!Properties.Description)
  Result = "<i>" + Properties.Description + "</i>:<br/ >";
 if (!!Properties.SiteLink)
  Result += "<a href='https://" + Lang + ".wikipedia.org/wiki/" + Properties.SiteLink + "' target='_blank' class='map-popup-link'>" + Properties.Label + "</a>";
 else if (!!Properties.Label)
  Result += "<u>" + Properties.Label + "</u>"; 
 else
  Result += "<font color='#DDD'><del>" + _('NotFound') + "</del></font>";
 Result += "<hr />";
 //
 return Result;
}

function GetNote(Properties)
{
 var Result = "";
 if (!!Properties.Note)
  Result = "<hr /><small>" + Properties.Note + "</small>";
 return Result;
}

function JsonEachFeature(feature, layer)
{
 feature.layer = layer;
 var Properties = feature.properties[Lang];
 //
 var Name = GetName(Properties);
 var Note = GetNote(Properties);
 //
 layer.bindPopup(
  "<b>" + Properties.Name + "</b>" +
  "<hr width='300' />" +
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

function DivPopup(Text)
{
 var Wiki = document.getElementById('wiki');
 Wiki.innerHTML = Text;
}

function onPopupOpenClick(e)
{
 var Properties = e.layer.feature.properties[Lang];
 //
 var Name = GetName(Properties);
 var Note = GetNote(Properties);
 //
 e.layer.bindPopup(
  "<b>" + Properties.Name + "</b>" +
  "<hr width='300' />" +
  Name +
  "<div id='wiki'></div>" +
  Note);
 //
 var queryWikipediaOption = {
  action: 'query',
  format: 'json',
  prop: 'pageimages|extracts',
  pithumbsize: '200',
  exintro: '',
  explaintext: '',
  formatversion: '2',
  titles: e.layer.feature.properties[Lang].SiteLink
 };
 var queryWikipedia = mw.api.query('https://' + Lang + '.wikipedia.org/w/api.php', queryWikipediaOption);
 queryWikipedia(function (x) {
  var Result = x.query.pages[0];
  //console.log('mw', Result);
  if (!!Result.thumbnail)
   Img = "<img alt='" + Result.title + "' src='" + Result.thumbnail.source + "' />";
  else
   Img = "";
  //
  var Text;
  if (!!Result.extract)
   Text = Img + "<br />" + Slice(Result.extract);
  else
   Text = "<font color='#DDD'><del>" + _('NotWiki') + "</del></font>";
  setTimeout(DivPopup, 200, Text);
 });

}



var OptionStreetsLayer = {
 style: GetStyle,
 onEachFeature: JsonEachFeature,
}

var OverlayMaps = {};

AllLayer = [];

for (var Diagram in StreetsStyle)
{
 var Layer = new L.GeoJSON.AJAX('data/StreetsData.' + Diagram + '.geojson', OptionStreetsLayer);
 AllLayer.push(Layer);
 OverlayMaps[StreetsStyle[Diagram].Description[Lang]] = L.layerGroup([Layer.on('popupopen', onPopupOpenClick)]).addTo(Map);
}


//var List = L.layerGroup([StreetsLayer00, StreetsLayer01, StreetsLayer02]);

L.control.layers(BaseMaps, OverlayMaps).addTo(Map);

//var StreetsLayer = L.geoJson(StreetsData, OptionStreetsLayer);
//StreetsLayer.addTo(Map);

//

function ZoomEnd()
{
 for (Index in AllLayer)
  AllLayer[Index].setStyle(GetStyle);
}

Map.on('zoomend', ZoomEnd);


function Translate()
{
 document.getElementById('MapHeader').innerHTML = "<strong>" + _('City') + "</strong>. " + _('About');
 document.getElementById('MainHeader').innerHTML = _('City') + ". " + _('About');
 return _.defaultLocale;
}

function Change(e)
{
 //console.log(LLL._overlaysList);
 //var elements = document.getElementsByClassName('leaflet-control-layers-overlays');
 //console.log(elements[0].childNodes);
 //for (var Item in elements[0].childNodes)
 // console.log(elements[0].childNodes[Item].innerText);
 PreviousLocale = _.defaultLocale;
 _.defaultLocale = Language[e.name];
 Lang = Translate();
 //
 var Elements = document.getElementsByClassName('leaflet-control-layers-selector');
 for (var Item in Elements)
 {
  var Element = Elements[Item].nextSibling;
  if (!!Element)
  {
   var Text = Element.innerText.trim();
   for (var Diagram in StreetsStyle)
    if (StreetsStyle[Diagram].Description[PreviousLocale] == Text)
     Elements[Item].nextSibling.innerText = " " + StreetsStyle[Diagram].Description[Lang];
  }
 }
}

Map.on('baselayerchange', Change);

//

/*function OptionShowResultFct(feature, container)
{
 var LabelName = L.DomUtil.create('b', null, container);
 LabelName.innerHTML = feature.properties[Lang].Label;
 container.appendChild(L.DomUtil.create('br', null, container));
 container.appendChild(document.createTextNode(feature.properties[Lang].Description));
 container.appendChild(L.DomUtil.create('br', null, container));
 var StreetName = L.DomUtil.create('small', null, container);
 StreetName.innerHTML = '<i>' + feature.properties[Lang].Name + '</i>';
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
fuseSearchCtrl.indexFeatures(List, ['ru.Label', 'ru.Name', 'ru.Description']);
fuseSearchCtrl.indexFeatures(StreetsData.features, ['ru.Label', 'ru.Name', 'ru.Description']);
fuseSearchCtrl.indexFeatures(StreetsData.features, ['popupContent']);
*/
