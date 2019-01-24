const fs = require('fs-extra');
const fm = require('front-matter');
const glob = require('globby');
const myMarked = require('marked');
const path = require('path');
const template = require('./template');
const utils = require('./utils');
const request = require('request-promise');
const azip = require('adm-zip');

require('dotenv').load();

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

const compile = async function(distDir) {
  utils.notice('compiling posts');
  const postData = [];
  const rssData = [];
  let postSource = process.env.POSTS_DIR || '~/posts';
  if (!process.env.LOCAL) {
    utils.notice('Getting remote posts');
    postSource = await getRemotePosts(postSource);
  }
  const postFiles = await getPosts(postSource);

  let postTags = {
    uncategorized: {
      posts: []
    }
  };

  postFiles.forEach( file => {
    let { meta, raw }= buildPost(file, distDir);
    postTags = buildTags(meta, postTags);
    postData.push(meta);
    rssData.push({meta, content: raw.body});
  });

  utils.notice('build posts complete');

  postData.sort(function(a,b){
    return new Date(b.date) - new Date(a.date);
  });

  rssData.sort(function(a, b) {
    return new Date(b.meta.date) - new Date(a.meta.date);
  });

  return { postData, rssData, postTags };
}

const getRemotePosts = async function() {
  const branch = process.env.BRANCH || false;
  const repo = process.env.REPO || false;
  if (!branch || ! repo) {
    utils.error('FAILED please provide a `REPO` and `BRACNH` for posts.');
    process.exit();
    return false;
  }
  const archive = repo.split("/").pop();
  const postURL = `${repo}/archive/${branch}.zip`;
  const postDataPath = './data';
  const zipFile = path.join(`${postDataPath}`, 'posts.zip');
  fs.ensureDirSync(`${postDataPath}`);
  const data = await request({url: postURL, encoding: null});
  fs.writeFileSync(zipFile, data);
  const zip = new azip(zipFile);
  zip.extractAllTo(`${postDataPath}`, true);
  fs.removeSync(zipFile);
  return path.join(postDataPath, `${archive}-${branch}`);
}

const getPosts = async function(postSource) {
  return await glob([
    `${postSource}/**/*.md`,
    `!${postSource}/template.md`,
    `!${postSource}/README.md`
  ]);
}

const buildPost = function(file, distDir) {
  const postDir = 'posts';
  const md = fs.readFileSync(file, 'utf8');
  const raw = fm(md);
  const html = myMarked(raw.body);
  const slug = path.parse(file).name;
  const postPath = path.join(distDir, postDir, slug);
  let meta = raw.attributes;

  utils.output(`build post ${slug}`);
  fs.ensureDirSync(`${postPath}`);
  const momentDate = utils.getMomentPostDate(meta.date);
  meta.pubDate = new Date(meta.date).toUTCString();
  meta.postDate = momentDate;
  meta.slug = slug;
  let data = {
    page: 'post',
    summary: meta.summary,
    slug: `${postDir}/${slug}`,
    title: meta.title,
    date: momentDate,
    data: html,
    tags: meta.tags
  };
  template.build(postPath, data);
  return { meta, raw };
}

const buildTags = function(meta, allTags) {
  meta.tags.forEach((t) => {
    let name = t.toLowerCase();
    tag = !allTags[name] ? { posts: [] } : allTags[name];
    tag.posts.push(meta);
    allTags[name] = tag;
  });
 return allTags;
}

module.exports = { compile };
