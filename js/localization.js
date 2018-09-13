// https://habr.com/sandbox/47210/
// LidaCity, 2018

function _(str, locale)
{
 locale = locale || _.defaultLocale;
 if (_.data.hasOwnProperty(locale) && typeof _.data[locale] == 'object')
  if (_.data[locale].hasOwnProperty(str))
   return _.data[locale][str];
 return str;
}

_.defaultLocale = 'ru';
_.data =
{
 ru: {}
};

_.registerLocale = function registerLocale(locale, data)
{
 if (!_.data.hasOwnProperty(locale))
  _.data[locale] = {};
 for (var str in data)
  if (data.hasOwnProperty(str))
   _.data[locale][str] = data[str];
}

var Language = { 'Русский язык': "ru", 'Беларуская мова': "be", }

_.registerLocale('ru',
{
 'Lang': "ru",
 'Language': "Русский язык",
 'City': "Город Лида",
 'About': "Их именами названы улицы",
 'Address': "г. Лида, Беларусь",
 'NotFound': "нет данных",
 'NotWiki': "в wiki отсутствует информация",
 'Find': "Найти улицу",
 'Search': "Поиск",
});

_.registerLocale('be',
{
 'Lang': "be",
 'Language': "Беларуская мова",
 'City': "Горад Ліда",
 'About': "Іх імёнамі названы вуліцы",
 'Address': "г. Ліда, Беларусь",
 'NotFound': "няма дадзеных",
 'NotWiki': "у wiki адсутнічае даведка",
 'Find': "Знайсці вуліцу",
 'Search': "Пошук",
});

_.defaultLocale = 'ru';
