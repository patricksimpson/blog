const path = require('path');
const posts = require('./lib/posts');
const pages = require('./lib/pages');
const tags = require('./lib/tags');
const rss = require('./lib/rss');
const search = require('./lib/search');
const assets = require('./lib/assets');
const utils = require('./lib/utils');

(async () => {
  const dist = utils.makeDist('build');
  const { postData, rssData, postTags } = await posts.compile(path.join(__dirname, dist));
  pages.compile(dist, postData);
  tags.compile(dist, postTags);
  rss.compile(dist, rssData);
  search.compile(dist, rssData);
  assets.compile(dist);
})();
