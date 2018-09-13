# LidaCity, 2015-2016

import os
import logging

import osmapi
import pywikibot
import geojson


OSM = osmapi.OsmApi()

StreetsStyle = {
 'Нейтральные': "diagram00",
 'Не определена': "diagram01",
 'Ученые': "diagram02",
 'Писатели и поэты': "diagram03",
 'Музыканты': "diagram04",
 'Художники': "diagram05",
 'Коммунистические деятели и революционеры': "diagram06",
 'Повстанцы': "diagram07",
 'Полководцы и военачальники': "diagram08",
 'Герои': "diagram09",
 'Партизаны и подпольщики': "diagram10",
 'Участники боев за город': "diagram11",
 'Передовики производства': "diagram12",
 'Города': "diagram13",
 'Даты': "diagram14",
 'Животные и растения': "diagram15",
}


# вярнуць некаторыя параметры вуліцы
def GetStreet(ID):
 logging.info(f"GetStreet {ID}")
 #logging.info("GetStreet {}".format(ID))
 #
 Relation = OSM.RelationGet(ID)
 #
 Tag = Relation['tag']
 Member = Relation['member']
 #
 Result = {}
 Result['Relation'] = ID
 Result['Tag'] = Tag
 #
 Result['Ways'] = GetWays(Member)
 Result['StyleGroup'] = GetStyleGroup(Tag)
 #
 return Result


# вярнуць дадзеныя вікіпедыі на рускай і беларускай мове
def GetWikiData(Tag, Lang):
 Today = {'be': "з", 'ru': "с", }
 Result = {}
 if 'name:etymology:wikidata' in Tag:
  Site = pywikibot.Site("wikidata", "wikidata")
  Repo = Site.data_repository()
  Q = Tag['name:etymology:wikidata']
  Item = pywikibot.ItemPage(Repo, Q).get()
  #
  Labels = Item['labels']
  SiteLinks = Item['sitelinks']
 else:
  Labels = { Lang: Tag.get("description:" + Lang), }
  SiteLinks = {}
 #
 Result['Label'] = Labels.get(Lang)
 Result['SiteLink'] = SiteLinks.get(Lang + "wiki")
 Result['Name'] = Tag.get("name:" + Lang)
 Result['Description'] = Tag.get("description:category:" + Lang)
 #
 Result['Note'] = GetNote(Tag.get('old_name:' + Lang, ""), Tag.get('name:' + Lang), Tag.get('start_date'), Today[Lang])
 #
 return Result


# вярнуць спіс кропак вуліцы
def GetWays(Member):
 Result = []
 for Item in Member:
  if Item['type'] == 'way' and Item['role'] == 'street':
   Ref = Item['ref']
   Way = OSM.WayGet(Ref)
   #
   Ways = []
   for ND in Way['nd']:
    Node = OSM.NodeGet(ND)
    Ways.append([Node['lon'], Node['lat']])
   Result.append(Ways)
 return Result


# вярнуць карэктную нататку
def GetNote(Note, Street, StartDate, Today):
 Note = Note.replace(";", "<br />")
 if not StartDate:
  return Note
 elif Note == "":
  return f"{Street} ({Today} {StartDate})"
  #return "{} ({} – {})".format(Street, StartDate, Today)
 else:
  return f"{Note}<br />{Street} ({Today} {StartDate})"
  #return "{}<br />{} ({} – {})".format(Note, Street, StartDate, Today)


# вярнуць карэктны стыль
def GetStyleGroup(Tag):
 Diagram = Tag.get('description:category:ru')
 if Diagram:
  return StreetsStyle[Diagram]
 elif 'name:etymology:wikidata' in Tag:
  return "diagram01"
 else:
  return "diagram00"


# стварыць выніковы файл
def CreateGeoJson(Streets, Style=None):
 Features = []
 #
 for Street in Streets:
  if not Style or Style == Street['StyleGroup']:
   Relation = Street['Relation']
   logging.info(f"CreateGeoJson {Relation}")
   #logging.info("CreateGeoJson {}".format(Relation))
   Geometry = geojson.MultiLineString(Street['Ways'])
   Properties = {
    'popupContent': Street['Tag']['name'],
    'Relation': Street['Relation'],
    'Tag': Street['Tag'],
    #
    'be': GetWikiData(Street['Tag'], "be"),
    'ru': GetWikiData(Street['Tag'], "ru"),
    #'StyleGroup': GetStyle(Street['Tag'].get('decsription:category', "0")),
    'StyleGroup': Street['StyleGroup'],
   }
   #print(Properties)
   Feature = geojson.Feature(geometry=Geometry, id=Relation, properties=Properties)
   Features.append(Feature)
 #
 Collection = geojson.FeatureCollection(Features)
 return geojson.dumps(Collection, ensure_ascii=False)


# прачытаць файл спісу вуліц
def ReadFromFile(FileName):
 logging.info("Read from File")
 Result = []
 #
 f = open(FileName + ".csv", "r")
 #
 for s in f.readlines():
  _, Relation, _, _, _, _ = s.split(";")
  Street = GetStreet(Relation)
  #print(Street)
  if Street['Ways']:
   Result.append(Street)
 #
 f.close()
 #
 return Result


# прачытаць спіс вуліц
def ReadFromOSM(ID):
 logging.info("Read from OSM")
 Result = []
 #
 Relation = OSM.RelationGet(ID)
 for Member in Relation['member']:
  Street = GetStreet(Member['ref'])
  #print(Street)
  if Street['Ways']:
   Result.append(Street)
 #
 return Result


# захаваць js-geojson
def Write(GeoJson, FileName, Style=None):
 logging.info("Write to GeoJson")
 if Style:
  FileName1 = FileName + "." + Style
  Style1 = Style[-2:]
 else:
  FileName1 = FileName
  Style1 = ""
 #
 f = open(os.path.join("data.geojson", FileName1 + ".geojson"), "w")
 f.write(GeoJson)
 f.close()
 #
 f = open(os.path.join("data.js", FileName1 + ".js"), "w")
 f.write("var StreetsData" + Style1 + " = ")
 f.write(GeoJson)
 f.write(";")
 f.close()



logging.basicConfig(format='%(asctime)s %(levelname)s: %(message)s', level=logging.DEBUG, filename='street.log')
logging.info("Start")

FileName = "StreetsData"
#Streets = ReadFromFile(FileName)
Streets = ReadFromOSM(5708510)
#
GeoJson = CreateGeoJson(Streets)
Write(GeoJson, FileName)
#
for Style in StreetsStyle:
 GeoJson = CreateGeoJson(Streets, StreetsStyle[Style])
 Write(GeoJson, FileName, StreetsStyle[Style])

# GeoJson = CreateGeoJson(Streets, Style)
# Write(GeoJson, FileName, Style)

logging.info("Done")
