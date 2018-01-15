const { Pool, Client } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

/*
function printRes(result) {
  for (let row of result.rows) {
    console.log(JSON.stringify(row));
  }
}
function returnErr(err) {
  console.log(err);
  return false;
}*/


// function getImportantObservations() {
//   const text =
//     //lmao this was a bad idea and it does not even work
//     "WITH latest_temperatures AS ( " +
//     "SELECT temperatures.*, locations.name AS name " +
//     "FROM temperatures WHERE time > now() - interval '24 hours' " +
//     "INNER JOIN locations ON temperatures.location = locations.id  " +
//     ") SELECT * FROM latest_temperatures " +
//     "INNER JOIN ( " +
//     "SELECT id, time, MAX(temperature) AS temperature, name FROM latest_temperatures GROUP BY id " +
//     "UNION SELECT id, time, MIN(temperature) AS temperature, name FROM latest_temperatures GROUP BY id " +
//     "UNION SELECT id, MAX(time), temperature, name FROM latest_temperatures GROUP BY id) grouped " +
//     "ON latest_temperatures.id = grouped.id ";
//   return pool.query(text);
// }

function getMaxTemperatures() {
  const text =
  //"SELECT DISTINCT ON (location) id, temperature, location, time FROM temperatures ORDER BY location ASC, temperature DESC;";
  "SELECT DISTINCT ON (location) id, temperature, location, time FROM temperatures WHERE time > now() - interval '24 hours' ORDER BY location ASC, temperature DESC;";
  return pool.query(text);
}

function getMinTemperatures() {
  const text =
  //"SELECT DISTINCT ON (location) id, temperature, location, time FROM temperatures ORDER BY location ASC, temperature ASC;";
  "SELECT DISTINCT ON (location) id, temperature, location, time FROM temperatures WHERE time > now() - interval '24 hours' ORDER BY location ASC, temperature ASC;";
  return pool.query(text);
}

function getRecentTemperatures() {
  const text =
  "SELECT DISTINCT ON (location) id, temperature, location, time FROM temperatures ORDER BY location ASC, time DESC;";
  //"SELECT DISTINCT ON (location) id, temperature, location, time FROM temperatures WHERE time > now() - interval '24 hours' ORDER BY location ASC, time DESC;";
  return pool.query(text);
}

function getAllObservations(location) {
  const text =
    "SELECT * FROM temperatures where location = $1 ORDER BY time DESC;";
  const params = [location];
  return pool.query(text, params);
}

function getLocations() {
  const text = "SELECT name, id FROM locations ORDER BY name";
  return pool.query(text);
}

function getLocation(location) {
  const text = "SELECT * FROM locations where id = $1";
  const params = [location];
  return pool.query(text, params);
}
/*
//checks whether a location exists
//probably a bad decision
function isLocation(location) {
  const text = "SELECT id FROM locations WHERE id = $1";
  const params = [location];
  var ehhh = yield pool.query(text, params);, (err, result) => {
    if (err) return returnErr(err);
    for (let row of result.rows) {
      return true; //if anything is found, the location exists
    }
    return false;
  }
}
*/
function addObservation(location, temperature) {
  const text =
    "INSERT INTO temperatures (id, time, location, temperature) values(DEFAULT, now(), $1, $2)";
  const params = [location, temperature];
  return pool.query(text, params);
}

exports.getMaxTemperatures = getMaxTemperatures;
exports.getMinTemperatures = getMinTemperatures;
exports.getRecentTemperatures = getRecentTemperatures;
exports.getAllObservations = getAllObservations;
exports.getLocations = getLocations;
exports.addObservation = addObservation;
exports.getLocation = getLocation;
//http://www.javascriptpoint.com/nodejs-postgresql-tutorial-example/
