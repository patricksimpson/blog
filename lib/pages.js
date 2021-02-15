const utils = require('./utils');
const template = require('./template');

const compile = function(dist, postData) {
  // Take the top 6, figure stuff out later for pagination, etc....
  let latestPosts = postData.splice(0,3);
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
      page: 'search',
      title: 'Search',
      summary: false
    },
    {
      page: 'about',
      title: 'About',
      summary: false
    }
  ];

  utils.notice('Build Pages');

  pages.forEach(p => {
    const { page, data } = p;

    p.slug = page;
    if(page === 'home') {
      p.slug = '';
    }
    if (typeof data === 'undefined') {
      p.data = null;
    } else {
      if (p.data && p.data.posts) {
        utils.output(`Compiling ${p.data.posts.length} posts`);
      }
    }

    let buildPath = dist;

    if(page !== 'home') {
      buildPath = `${dist}/${page}`
    }

    utils.output(`build page ${buildPath}`);
    template.build(buildPath, p);
  });
};

module.exports = { compile };
