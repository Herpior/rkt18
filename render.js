var nunjucks = require('nunjucks');

nunjucks.configure('./pages', { autoescape: true });

function temperatureForm(locations, urls) {
  return nunjucks.render('form.njk', { title: 'Input temperature data', locations: locations, urls: urls });
}

function errorPage(code, msg, urls) {
  return nunjucks.render('error.njk', { title: 'Error '+code, code: code, error: msg, urls: urls });
}

function mainPage(msg, locations, urls) {
  // console.log(locations);
  // console.log(urls);
  return nunjucks.render('main.njk', { title: 'Temperature data website', msg: msg, locations: locations, urls: urls });
}

function locationData(data, city, urls) {
  return nunjucks.render('city.njk', { title: city.name + ' temperature data', city: city, data: data, urls: urls });
}

exports.temperatureForm = temperatureForm;
exports.errorPage = errorPage;
exports.mainPage = mainPage;
exports.locationData = locationData;
