const ejs = require('ejs');
const fs = require('fs-extra');
const Typography = require('typography');
const oceanBeachTheme = require('typography-theme-ocean-beach');
const path = require('path');
const utils = require('./utils');

oceanBeachTheme.overrideThemeStyles = () => ({
  a: {
    transition: 'all 0.5s ease',
  },
});

const build = function(templatePath, data) {
  const layoutFile = path.join(__dirname, '../src/pages', 'layout.ejs');
  data.typography = new Typography(oceanBeachTheme)
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
