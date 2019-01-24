const utils = require('./utils');
const ejs = require('ejs');
const fs = require('fs-extra');

const compile = (distDir, rss) => {
  const buildDate = new Date().toUTCString();
  ejs.renderFile('src/pages/rss.ejs', { data: rss, buildDate }, (err, str) => {
    fs.writeFileSync(`${distDir}/rss.xml`, str);
    if(!err) {
      utils.notice('rss build complete');
    } else {
      utils.error(`${err}`);
    }
  });
};

module.exports = { compile };
