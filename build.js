const bodyParser = require('body-parser');
const fs = require('fs-extra');
const ejs = require('ejs');
const slugify = require('slugify')
const glob = require('glob');
const path = require('path');
const moment = require('moment');

const pages = [
  {
    page: 'index',
    title: 'home'
  },
  {
    page: 'about',
    title: 'about'
  }
];


let file = path.join(__dirname, 'pages') + '/layout.ejs';
console.log('render', file);

if(fs.existsSync('build')) {
  fs.removeSync('build');
}
fs.ensureDirSync('build');

pages.forEach(p => {
  const {page, title} = p;
  ejs.renderFile(file, p, function(err, str){
    fs.writeFileSync(`build/${page}.html`, str);
  });
});
