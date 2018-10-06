const fse = require('fs-extra');
const path = require('path');
const ejs = require('ejs');
const glob = require('glob');

const srcPath = './pages';
const distPath = './dist';

// clear destination folder
fse.emptyDirSync(distPath);

glob(`${srcPath}/*.ejs`, function (er, files) {
  files.forEach( f => {
    ejs.renderFile(`${f}`, (e, content) => {
      const distFile = path.parse(f).name;
      fse.writeFile(`${distPath}/${distFile}.html`, content);
    });
  });
})
