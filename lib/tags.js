const utils = require('./utils');
const template = require('./template');

const compile = (distDir, tags) => {
  Object.keys(tags).forEach( t => {
    let p = {
     slug: t.toLowerCase(),
     page: 'tag',
     data: tags[t],
     title: `Posts tagged "${t}"`,
     summary: false
    };
    p.data.posts.reverse();
    utils.output(`Compiling tag: ${p.slug} with ${p.data.posts.length} posts`);
    template.build(`${distDir}/tag/${t}`, p);
  });
};

module.exports = { compile };
