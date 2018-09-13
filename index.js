// LidaCity, 2015-2016

var OptionLayer = {
 attribution: ' © <a href="http://openstreetmap.org/copyright">Openstreetmap</a> | © <a href="http://streets.lidacity.by/">LidaCity</a>',
 maxZoom: 18,
 minZoom: 11,
 maxBounds: [[53.80, 25.20], [54.00, 25.40]],
 noWrap: true,
}

var Lang = Translate();

var Host = "http://tiles.lidacity.by/";
if (location.hostname == "localhost")
 Host = "tiles.";

var BaseMaps = {
 "Русский язык": L.tileLayer.grayscale(Host + 'ru/{z}/{x}/{y}.png', OptionLayer),
 "Беларуская мова": L.tileLayer.grayscale(Host + 'be/{z}/{x}/{y}.png', OptionLayer),
};

var OptionMap = {
 center: [53.90, 25.30],
 zoom: 13,
 layers: [BaseMaps[_('Language')]],
 fadeAnimation: false,
}

var Map = L.map('map', OptionMap);

var Bounds = [[53.85, 25.2], [53.96, 25.4]];
Map.setMaxBounds(Bounds);
Map.on('drag', function() { Map.panInsideBounds(Bounds, { animate: false }); });

//

var AboutPopup = L.popup().setContent("<center><b>" + _('About') + "</b><br />" + _('Address') + "<br /><p><img src='favicon.png' /></p></center><br /><br />&copy; <a href='mailto:dzmitry@lidacity.by'>dzmitry@lidacity.by</a>, 2005, 2016");
L.easyButton("&starf;", function(btn, map) { AboutPopup.setLatLng(map.getCenter()).openOn(map); }).addTo(Map);

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
 var Properties = feature.properties[Lang];
 //
 layer.bindPopup(
  "<b>" + Properties.Name + "</b>" +
  "<hr width='300' />" +
  GetName(Properties) +
  "<div id='wiki'></div>" +
  GetNote(Properties));
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
 var Properties = e.layer.feature.properties[Lang];
 //
 e.layer.bindPopup(
  "<b>" + Properties.Name + "</b>" +
  "<hr width='300' />" +
  GetName(Properties) +
  "<div id='wiki'></div>" +
  GetNote(Properties));
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
  setTimeout(function (Text) { document.getElementById('wiki').innerHTML = Text; }, 200, Text);
 });
}


var OptionStreetsLayer = {
 style: GetStyle,
 onEachFeature: JsonEachFeature,
}

var OverlayMaps = {};
var AllLayer = [];

for (var Diagram in StreetsStyle)
{
 var FileName = 'data/StreetsData.' + Diagram + '.geojson';
 var Layer = new L.GeoJSON.AJAX(FileName, OptionStreetsLayer);
 //fetch('data/StreetsData.' + Diagram + '.geojson').then(response => response.json()).then(json => SearchJson(json));
 AllLayer.push(Layer);
 OverlayMaps[StreetsStyle[Diagram].Description[Lang]] = L.layerGroup([Layer.on('popupopen', onPopupOpenClick)]).addTo(Map);
}

L.control.layers(BaseMaps, OverlayMaps).addTo(Map);

// дадаць зхаваны слой для пошуку
L.geoJson(StreetsData, { style: { "opacity": 0, }, onEachFeature: function (feature, layer) { feature.layer = layer; } }).addTo(Map);

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


// пры змене мовы прымусовы пераклад усяго
function Change(e)
{
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
 //
 document.getElementsByClassName('search-input')[0].placeholder = _('Find');
}

Map.on('baselayerchange', Change);


// пошук
function OptionShowResultFct(feature, container)
{
 var Properties = feature.properties[Lang];
 var Result = "<hr width='75%' align='left'>" + 
 "<small>" + Properties.Name + "</small><br />";
 if (!!Properties.Description)
  Result += "<small><i>" + Properties.Description + "</i></small><br />";
 if (!!Properties.Label)
  Result += "<b>" + Properties.Label + "</b><br />";
 L.DomUtil.create('div', 'result', container).innerHTML = Result;
}

var OptionsFuse = {
 position: 'topright',
 title: _('Search'),
 placeholder: _('Find'),
 maxResultLength: 7,
 threshold: 0.2,
 showInvisibleFeatures: false,
 showResultFct: OptionShowResultFct
};

var fuseSearchCtrl = L.control.fuseSearch(OptionsFuse);
fuseSearchCtrl.indexFeatures(StreetsData.features, ['ru.Label', 'ru.Name', 'ru.Description', 'be.Label', 'be.Name', 'be.Description']);
Map.addControl(fuseSearchCtrl);
