const bodyParser = require('body-parser');
const fs = require('fs-extra');
const ejs = require('ejs');
const slugify = require('slugify')
const glob = require('glob');
const path = require('path');
const moment = require('moment');
const showdown  = require('showdown');

const Typography = require('typography')
const oceanBeachTheme = require('typography-theme-ocean-beach')
oceanBeachTheme.overrideThemeStyles = options => ({
  a: {
    transition: 'all 0.5s ease',
  },
})

const typography = new Typography(oceanBeachTheme)

let postData = [];
const layoutFile = path.join(__dirname, 'src/pages') + '/layout.ejs';

if(fs.existsSync('build')) {
  fs.removeSync('build');
}
fs.ensureDirSync('build');


const compilePages = async function() {
  const pages = [
    {
      page: 'home',
      title: 'Home',
      data: {
        posts: postData
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

  console.log('[PAGES] ');

  pages.forEach(p => {
    const { page, title, data } = p;
    if (typeof data === 'undefined') {
      p.data = null;
    } else {
      if(p.data && p.data.posts) {
        console.log(p.data.posts);
        // sort posts by date.
        p.data.posts.sort(function(a,b){
          // Turn your strings into dates, and then subtract them
          // to get a value that is either negative, positive, or zero.
          return new Date(b.createDate) - new Date(a.createDate);
        });
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
}

const compilePosts = async function() {
  console.log('[POSTS]');

  const srcPath = './posts';
  const distPath = './build';
  const converter = new showdown.Converter();

  await glob(`${srcPath}/**/*.json`, (er, files) => {
    files.forEach( f => {
      let { post } = fs.readJsonSync(f);
      let { title, slug, summary, createDate, updatedAt } = post;
      const date = moment(createDate).format('MMMM Do YYYY');
      post.date = date;

      if(!slug) {
        slug = slugify(post.title, { lower: true });
        post.slug = slug;
      }

      postData.push(post);
      let buildPath = path.join(__dirname, slug);
      let md = fs.readFileSync(`${srcPath}/${slug}/index.md`, 'utf8');
      let html = converter.makeHtml(md);
      fs.ensureDirSync(`${distPath}/${slug}`);
      console.log(`building ${slug}`);
      ejs.renderFile(layoutFile, { typography: typography, page: 'post', title, date, data: html}, (err, str) => {
        if (err) { console.log(err); } else {
          fs.writeFile(`${distPath}/${slug}/index.html`, str);
        }
      });
    });
    compilePages();
  });
}

fs.copySync(path.join(__dirname, 'src/static'), path.join(__dirname, 'build', 'static'));

compilePosts();
