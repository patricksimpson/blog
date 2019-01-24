const fs = require('fs-extra');
const lunr = require('lunr');

const compile = (dist, rss) => {
  // Lunr Search Feed
  let store = {};
  let jsonFeed = rss.map((post) => {
    return {
      "title": post.meta.title,
      "slug": `${post.meta.slug}`,
      "href": `https://patricksimpson.me/posts/${post.meta.slug}`,
      "date": `${post.meta.pubDate}`,
      "postDate": `${post.meta.postDate}`,
      "summary": `${post.meta.summary}`,
      "body": `${post.content}`
    };
  });

  const searchIndex = lunr(function() {
    this.field('title', { boost: 10 });
    this.field('summary', { boost: 5 });
    this.field('body');
    this.ref('href');
    jsonFeed.forEach( doc => {
      store[doc.href] = {
        'title': doc.title,
        'date': doc.postDate
      };
      this.add(doc);
    });
  });

  fs.writeFileSync(`${dist}/lunr.json`, JSON.stringify({
    index: searchIndex.toJSON(),
    store: store
  }));

  fs.writeFileSync(`${dist}/index.json`, JSON.stringify(jsonFeed));
};

module.exports = { compile };
