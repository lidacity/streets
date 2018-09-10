# LidaCity, 2018

import os
import logging

import osmapi


OSM = osmapi.OsmApi()


# вярнуць некаторыя параметры вуліцы
def GetStreet(ID):
 logging.info("GetStreet {}".format(ID))
 #
 Relation = OSM.RelationGet(ID)
 #
 Tag = Relation['tag']
 #
 DescriptionBe = Tag.get('description:be', "")
 DescriptionRu = Tag.get('description:ru', "")

 if DescriptionRu == "":
  Description = DescriptionBe
 elif DescriptionBe == "":
  Description = DescriptionRu
 else:
  Description = DescriptionRu + "<br />" + DescriptionBe

 Result = {
  'name:ru': Tag['name:ru'],
  'name:be': Tag['name:be'],
  'name:etymology:wikidata': Tag.get('name:etymology:wikidata', ""),
  'relation': ID,
  'description': Description,
 }

 #
 return Tag['sorting_name:ru'], Result


# прачытаць спіс вуліц
def Read(ID):
 logging.info("Read from OSM")
 Result = {}
 #
 Relation = OSM.RelationGet(ID)
 for Member in Relation['member']:
  Key, Street = GetStreet(Member['ref'])
  #print(Key, Street)
  Result[Key] = Street
 #
 return Result


# захаваць wiki
def Write(Streets, ID, FileName):
 logging.info("Write to Wiki")
 #
 Keys = sorted(Streets.keys())
 #
 f = open(FileName, "w")
 f.write("на 01.12.2015 {{relation|{}}}\n".format(ID))
 f.write("\n".format())

 CurrentChar = ""
 for Key in Keys:
  Street = Streets[Key]
  Char = Key[0]
  if Char in "01234564789":
   Char = "1"
  #
  if CurrentChar != Char:
   if CurrentChar != "":
    f.write("|}\n")
    f.write("\n")
   CurrentChar = Char
   #
   f.write("={}=\n".format(Char))
   f.write("{| class='wikitable' border='1' cellspacing='0' cellpadding='2'\n")
   f.write("! Наименование (ru) || Наименование (be) || WikiData || Отношение || Описание\n")
  #
  f.write("|-\n")
  f.write("|{} || {} || {{{{wikidata|{}}}}} || {{{{relation|{}}}}} || {}\n".format(Street['name:ru'], Street['name:be'], Street['name:etymology:wikidata'], Street['relation'], Street['description']))
  #
 f.write("|}\n")
 f.write("\n")
 f.write("[[Category:Belarus]]")

 f.close()
 #


logging.basicConfig(format='%(asctime)s %(levelname)s: %(message)s', level=logging.DEBUG, filename='street.log')
logging.info("Start")

FileName = "StreetsData"
ID = 5708510
Streets = Read(ID)
Write(Streets, ID, FileName + ".wiki")

logging.info("Done")
