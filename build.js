const fs = require('fs-extra');
const ejs = require('ejs');
const glob = require('glob');
const path = require('path');
const moment = require('moment');
const myMarked = require('marked');
const fm = require('front-matter');

/* Config Settings */

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

/* CSS IN JS BECAUSE LOL */
const Typography = require('typography');
const oceanBeachTheme = require('typography-theme-ocean-beach');

/* STRUCT */
/*
  [
    name: 'programming': {
      posts: ['']
    }
  ]
*/
let postTags = [];
postTags['uncategorized'] = {
  posts: []
};

oceanBeachTheme.overrideThemeStyles = options => ({
  a: {
    transition: 'all 0.5s ease',
  },
})

const typography = new Typography(oceanBeachTheme)

/* setup variables */
const layoutFile = path.join(__dirname, 'src/pages') + '/layout.ejs';
let postData = [];
let rss = [];

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

  // Take the top 6, figure stuff out later for pagination, etc....
  let latestPosts = postData.splice(0,6);

  const pages = [
    {
      page: 'home',
      title: 'Home',
      summary: false,
      data: {
        posts: latestPosts
      }
    },
    {
      page: 'posts',
      title: 'Archive',
      summary: false,
      data: {
        posts: postData
      }
    },
    {
      page: 'about',
      title: 'About',
      summary: false
    }
  ];

  console.log('[PAGES] ');

  pages.forEach(p => {
    const { page, data } = p;

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

  console.log('[TAGS]');
  fs.ensureDirSync(`build/tag`);
  Object.keys(postTags).forEach( t => {
    // const { page, data } = p;
    p = {};
    p.slug = t;
    p.page = 'tag';
    p.data = postTags[t];
    p.data.posts.reverse();
    p.title = `Posts tagged "${t}"`;
    p.summary = false;
    console.log(`Compiling tag: ${p.slug} with ${p.data.posts.length} posts`);
    p.typography = typography;
    ejs.renderFile(layoutFile, p, function(err, str){
      if(err) {
        console.log(err);
      } else {
        let buildPath = `build/tag/${t}/index.html`
        fs.ensureDirSync(`build/tag/${t}`);
        fs.writeFileSync(buildPath, str);
      }
    });
  });
  console.log('[RSS]');

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
      if(meta.tags) {
        meta.tags.forEach((t) => {
          t = t.toLowerCase();
          if (postTags[t]) {
            tag = postTags[t];
          } else {
            tag = {
              posts: []
            }
          }
          tag.posts.push(meta);
          postTags[t] = tag;
        });
      } else {
        postTags['uncategorized'].posts.push(meta);
      }
      postData.push(meta);
      rss.push({meta, content: html});
      ejs.renderFile(layoutFile, { typography: typography, page: 'post', summary,  slug: `posts/${slug}`, title, date: momentDate, data: html, tags }, (err, str) => {
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
