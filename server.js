
const http = require('http');
const url = require('url');
const fs = require('fs');
const formidable = require('formidable');
const postgre = require('./postgremanager.js');
const renderer = require('./render.js');


http.createServer( (req, res) => {
  urlRouting(req, res);
}).listen(process.env.PORT || 8080);

const urls = {
  submit: 'submit-observation',
  main: '',
  apiPath: 'api',
  staticFiles: 'static',
  locations: 'cities'
};

function urlRouting(req, res) {
  //split url into pieces and process
  var path = url.parse(req.url, true).pathname.split('/');
  path.shift(); //get rid of the empty part
  switch (path.shift()) {
    case undefined: //backup if for some reason the pathname is empty, ie has no slash
    case urls.main:
    case 'index.html':
      writeMain(res, false);
      break;
    case urls.submit:
      if (req.method.toLowerCase() == 'get') {
        writeTempForm(res);
      } else if (req.method.toLowerCase() == 'post') {
          processObservationForm(req, res);
      }
      break;
    case urls.staticFiles:
      displayFile('./static/'+path.join('/'), res);
      break;
    case urls.locations:
      writeLocationData(path.shift(), res);
      break;
    case urls.apiPath:
      apiRouting(path, req, res);
      break;
    default:
  }
}

function apiRouting(path, req, res) {
  switch (path.shift()) {
    case 'add-observation':
      processObservationForm(req, res);
  }
}

function displayFile(filename, res) {
  fs.readFile(filename, (err, data) => {
    if (err) return writeError(res, "", 404, "File not found");
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    return res.end();
  });
}

function processObservationForm (req, res) {
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {

    const temp = fields.temperature;
    const loc = fields.location;
    if(!isNumeric(temp) || temp > 100 || temp < -100){ // check if temperature change to previous temperatures is too fast instead?
      return writeError(res, "", 400, "Failed to receive data, temperature not valid");
    }
    else {
      const resultPromise = postgre.addObservation(fields.location, fields.temperature);
      resultPromise.then(function (result) {
        writeMain(res, "Observation successfully added");
      }, function (err) {
        writeError(res, err, 500, "Failed to receive data, internal error");
      });
    }
  });
}

function writeTempForm(res) {
  const locationPromise = postgre.getLocations();
  locationPromise.then(function (locations) {
    res.writeHead(200, {'content-type': 'text/html'});
    const content = renderer.temperatureForm(locations.rows, urls);
    res.end(content);
  }, function (err) {
    writeError(res, err, 500, "Internal error");
  });
}

function writeLocationData(location, res) {
  const dataPromise = postgre.getAllObservations(location);
  const locationPromise = postgre.getLocation(location);
  var allPromise = Promise.all([locationPromise, dataPromise]);
  allPromise.then(function (all) {
    let [location, data] = all;
    let city = location.rows.shift();
    if (city == undefined) return writeError(res, "", 404, "Not found");
    res.writeHead(200, {'content-type': 'text/html'});
    const content = renderer.locationData(data.rows, city, urls);
    res.end(content);
  }, function (err) {
    writeError(res, err, 500, "Internal error");
  });
}

function writeMain(res, msg) {
  const locationPromise = postgre.getLocations();
  const maxPromise = postgre.getMaxTemperatures();
  const minPromise = postgre.getMinTemperatures();
  const recentPromise = postgre.getRecentTemperatures();
  var allPromise = Promise.all([locationPromise, maxPromise, minPromise, recentPromise]);

  allPromise.then( function(all) {
    let locations = [];
    let [location, max, min, recent] = all;
    for (let row of location.rows) {
      locations[row.id] = {
        name: row.name,
        location: row.id
      };
    }
    for (let row of max.rows) {
      locations[row.location].max = row.temperature;
    }
    for (let row of min.rows) {
      locations[row.location].min = row.temperature;
    }
    for (let row of recent.rows) {
      locations[row.location].recentTemp = row.temperature;
        locations[row.location].recentTime = row.time;
    }
    const content = renderer.mainPage(msg, locations, urls);
    res.writeHead(200, {'Content-Type': 'text/html'});
    return res.end(content);
  }, function (err) {
    return writeError(res, err, 500, "Internal error");
  });
}

function writeError(res, err, code, msg) {
  if (err) console.log(err);
  res.writeHead(code, {'content-type': 'text/html'});
  const content = renderer.errorPage(code, msg, urls);
  res.end(content);
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
