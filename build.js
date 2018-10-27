const bodyParser = require('body-parser');
const fs = require('fs-extra');
const ejs = require('ejs');
const slugify = require('slugify')
const glob = require('glob');
const path = require('path');
const moment = require('moment');
const showdown  = require('showdown');

const pages = [
  {
    page: 'home',
    title: 'Home',
    data: {
      posts: []
    }
  },
  {
    page: 'about',
    title: 'About'
  },
  {
    page: 'pages',
    title: 'Older Posts'
  }
];


let file = path.join(__dirname, 'pages') + '/layout.ejs';
console.log('render', file);

if(fs.existsSync('build')) {
  fs.removeSync('build');
}
fs.ensureDirSync('build');

console.log('[PAGES]');
pages.forEach(p => {
  const { page, title, data } = p;
  if (typeof data === 'undefined') {
    p.data = null;
  }
  ejs.renderFile(file, p, function(err, str){
    if(err) {
      console.log(err);
    } else {
      let buildPath = `build/index.html`;
      if(page !== 'home') {
        fs.ensureDirSync(`build/${page}`);
        buildPath = `build/${page}/index.html`
      }
      console.log('building', buildPath);
      fs.writeFileSync(buildPath, str);
    }
  });
});

// Build posts

const srcPath = './posts';
const distPath = './build';
const converter = new showdown.Converter();
console.log('[POSTS]');

glob(`${srcPath}/**/*.json`, function (er, files) {
  files.forEach( f => {
    let { post } = fs.readJsonSync(f);
    let slug = post.slug;
    if(!slug) {
      slug = slugify(post.title, { lower: true });
    }
    let buildPath = path.join(__dirname, slug);
    let md = fs.readFileSync(`${srcPath}/${slug}/index.md`, 'utf8');
    let html = converter.makeHtml(md);
    fs.ensureDirSync(`${distPath}/${slug}`);
    console.log(`building ${slug}`);
    fs.writeFile(`${distPath}/${slug}/index.html`, html);
  });
})
