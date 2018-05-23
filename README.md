# Streets

Город Лида. Их именами названы улицы
Проект преобразован и оптимизирован для города Лиды, Беларусь.

###Использованы различные данные, а именно:
#### как первоисточник 
* http://habrahabr.ru/post/260893/
* https://kogor.github.io//Streets-of-Valour-and-Victory/
* https://github.com/KoGor/Streets-of-Valour-and-Victory
#### как изучение
* http://news.tut.by/society/398404.html
* https://leafletjs.com/
* https://www.mediawiki.org/wiki/API:Main_page/ru
* https://ru.wikipedia.org/wiki/Служебная:ApiSandbox#action=query&format=json&meta=siteinfo&siprop=namespaces
#### как основные данные
* Праект Карта горада Ліда. Частка "Іх імёнамі названы вуліцы", 2003-2005
* wikipedia.org
* wikidata.org
* josm.openstreetmap.de
* openstreetmap.org
* python3 + osmapi + geojson + pywikibot + mv
* Урбанонімы горада Ліды. В. Сліўкін "Лідскі летапісец" № 22, 23-2
* Улицы Лиды или лидские годонимы. Cтарший научный сотрудник Лидского музея Сливкин Валерий Васильевич. http://www.lida.info/ulicy-lidy-ili-lidskie-godonimy/
 и другие...

Увы, не все персоны представлены на wikidata, буду рад если про них создадут страницу на wikipedia, и я с удовольствием добавлю их в проект.

Если вы обнаружили ошибку, есть замечание, или что-нибудь ещё, свяжитесь dzmitry@lidacity.by

## Технические подробности
Для отрисовки карты используется библиотека [leaflet.js](http://leafletjs.com/) с рядом плагинов.
