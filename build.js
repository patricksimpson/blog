const bodyParser = require('body-parser');
const fs = require('fs-extra');
const ejs = require('ejs');
const slugify = require('slugify')
const glob = require('glob');
const path = require('path');
const moment = require('moment');
var myMarked = require('marked');
const date = require('date-and-time');
const fm = require('front-matter');

myMarked.setOptions({
  renderer: new myMarked.Renderer(),
  highlight: function(code) {
    return require('highlight.js').highlightAuto(code).value;
  },
  pedantic: false,
  gfm: true,
  tables: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false
});

const Typography = require('typography')
const oceanBeachTheme = require('typography-theme-ocean-beach')

oceanBeachTheme.overrideThemeStyles = options => ({
  a: {
    transition: 'all 0.5s ease',
  },
})

const typography = new Typography(oceanBeachTheme)

let postData = [];
let rss = [];
const layoutFile = path.join(__dirname, 'src/pages') + '/layout.ejs';

if(fs.existsSync('build')) {
  fs.removeSync('build');
}
fs.ensureDirSync('build');


const compilePages = async function() {

  // sort posts by date.
  postData.sort(function(a,b){
    // Turn your strings into dates, and then subtract them
    // to get a value that is either negative, positive, or zero.
    return new Date(b.date) - new Date(a.date);
  });

  rss.sort(function(a, b) {
    return new Date(b.meta.date) - new Date(a.meta.date);
  });

  // Take the top 6
  let latestPosts = postData.splice(0,6);

  const pages = [
    {
      page: 'home',
      title: 'Home',
      data: {
        posts: latestPosts
      }
    },
    {
      page: 'posts',
      title: 'Archive',
      data: {
        posts: postData
      }
    },
    {
      page: 'about',
      title: 'About'
    }
  ];

  console.log('[PAGES] ');

  pages.forEach(p => {
    const { page, title, data } = p;

    p.slug = page;
    if(page === 'home') {
      p.slug = '';
    }
    if (typeof data === 'undefined') {
      p.data = null;
    } else {
      if(p.data && p.data.posts) {
        console.log(`Compiling ${p.data.posts.length} posts`);
      }
    }
    p.typography = typography;
    ejs.renderFile(layoutFile, p, function(err, str){
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
  console.log('Building RSS...');
  let buildDate = new Date().toUTCString();
  ejs.renderFile('src/pages/rss.ejs', {data: rss, buildDate}, function(err, str) {
    fs.writeFileSync('build/rss.xml', str);
  });
}

const compilePosts = async function() {
  console.log('[POSTS]');

  const srcPath = '/Users/patrick/posts';
  const distPath = './build';

  await glob(`${srcPath}/**/*.md`, (er, files) => {
    files.forEach( f => {
      if (f.indexOf('template') > -1) { return; }
      let md = fs.readFileSync(f, 'utf8');
      let raw = fm(md);
      let meta = raw.attributes;
      let html = myMarked(raw.body);
      let slug = path.basename(f, '.md');
      let {
        title,
        summary,
        date: createDate,
        tags
      } = meta;
      let buildPath = path.join(__dirname, "build", "posts", slug);
      fs.ensureDirSync(`${buildPath}`);
      console.log(`building ${slug}`);
      const momentDate = moment(Date.parse(createDate)).format('MMMM Do YYYY');
      meta.pubDate = new Date(createDate).toUTCString();
      meta.postDate = momentDate;
      meta.slug = slug;
      postData.push(meta);
      rss.push({meta, content: html});
      ejs.renderFile(layoutFile, { typography: typography, page: 'post', slug: `posts/${slug}`, title, date: momentDate, data: html }, (err, str) => {
        if (err) { console.log(err); } else {
          fs.writeFileSync(`${buildPath}/index.html`, str, 'utf8');
        }
      });
    });
    compilePages();
  });
}

fs.copySync(path.join(__dirname, 'src/static'), path.join(__dirname, 'build', 'static'));

compilePosts();
