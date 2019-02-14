const fs = require('fs-extra');
const path = require('path');
const utils = require('./utils');

const compile = (dist) => {
  utils.output('building static assets');
  fs.copySync('./src/static', path.join(dist, 'static'));
  fs.copySync('./bower_components/lunr/lunr.js', path.join(dist, 'static', 'js', 'lunr.js'));
  fs.copySync('./src/meta', dist);
  utils.output('static assets complete');
}

module.exports = { compile };
