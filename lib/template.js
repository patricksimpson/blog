const ejs = require('ejs');
const fs = require('fs-extra');
const path = require('path');
const utils = require('./utils');

const build = function(templatePath, data) {
  const layoutFile = path.join(__dirname, '../src/pages', 'layout.ejs');
  fs.ensureDirSync(`${templatePath}`);
  ejs.renderFile(layoutFile, data, (err, str) => {
    if (err) {
      utils.error(err);
    } else {
      fs.writeFileSync(`${templatePath}/index.html`, str, 'utf8');
    }
  });
};

module.exports = { build };
