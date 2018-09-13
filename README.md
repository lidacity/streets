# Streets

Сайт проекта [Город Лида. Их именами названы улицы](http://streets.lidacity.by/)

Проект преобразован и оптимизирован для города Лиды, Беларусь.

##Использованые данные:
* Праект Карта горада Ліда. Частка "Іх імёнамі названы вуліцы", 2003-2005
* Урбанонімы горада Ліды. В. Сліўкін "Лідскі летапісец" № 22, 23-2
* [Улицы Лиды или лидские годонимы](http://www.lida.info/ulicy-lidy-ili-lidskie-godonimy/). Cтарший научный сотрудник Лидского музея Сливкин Валерий Васильевич.
* и другие...

Увы, не все персоны представлены на wikidata, буду рад если про них создадут страницу на wikipedia, и я с удовольствием добавлю их в проект.

Если вы обнаружили ошибку, есть замечание, или что-нибудь ещё, свяжитесь dzmitry@lidacity.by

## Технические подробности
Исходные данные:
* [Streets-of-Valour-and-Victory](https://github.com/KoGor/Streets-of-Valour-and-Victory), http://habrahabr.ru/post/260893/
* [wikidata.org](https://www.mediawiki.org/wiki/API:Main_page/ru)
* [wikipedia.org](https://ru.wikipedia.org/wiki/Служебная:ApiSandbox#action=query&format=json&meta=siteinfo&siprop=namespaces)
Для отрисовки карты используется библиотека [leaflet.js](http://leafletjs.com/) с рядом плагинов:
* модифицированный [leaflet-fusesearch](https://github.com/naomap/leaflet-fusesearch/)
* [TileLayer.Grayscale](https://github.com/Zverik/leaflet-grayscale/)
* [L.EasyButton](https://github.com/CliffCloud/Leaflet.EasyButton/)
Применяемые технологии:
* openstreetmap.org (josm)
* python3 (osmapi, geojson, pywikibot)
* javascript (leafletjs, ajax, juery, fuse, mv)
