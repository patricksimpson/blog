const moment = require('moment');
const hush = false;
const fs = require('fs-extra');

const error = function(msg) {
  console.error(`* ERROR: ${msg}`);
}

const output = function(msg) {
  if (!hush) {
    console.log(`** [${msg}]`);
  }
}

const notice = function(msg) {
  console.log(`* [${msg}]`);
}

const warning = function(msg) {
  if (!hush) {
    console.log(`** WARN: [${msg}]`);
  }
}

const getMomentPostDate = function(date) {
  return moment(Date.parse(date)).format('MMMM Do YYYY')
}

const makeDist = (dist) => {
  if(fs.existsSync(dist)) {
    fs.removeSync(dist);
  }
  fs.ensureDirSync(dist);
  return dist;
};

module.exports = {
  error,
  output,
  notice,
  warning,
  getMomentPostDate,
  makeDist
};
