const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const slugify = require('slugify')
const app = express();
const port = 3000;
const glob = require('glob');
const path = require('path');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('-_-'));

app.use('/admin/static', express.static('admin/static'))

app.get('/admin/add-post', (req, res) => {
  res.sendFile(path.join(__dirname + '/admin/add-post.html'));
});

app.get('/admin', (req, res) => {
    // options is optional
    let buffer = '';
    glob("posts/**/*.json", function (er, files) {
        buffer = '<ul>';
        files.forEach((f) => {
          let p = fs.readJsonSync(f);
          let { title, status, type, slug } = p.post;
            if (typeof slug === 'undefined') {
              slug = slugify(title, { lower: true});
            }
          buffer += `<li>${title} - ${status} - ${type} - <a href='/admin/delete-post?p=${slug}'>delete</a> | <a href='#'>edit</a></li>`;
        });
        buffer += '</ul>';
        buffer = '<div><a href="add-post">new post</a></div>' + buffer;
        buffer = '<h2> Admin - Index </h2>' + buffer;
        res.send(buffer);
    });
});

app.get('/admin/delete-post', (req, res) => {
    const p = req.query.p;
    let buffer = `deleting ${p}`;
    fs.removeSync(`./posts/${p}`)
    console.log(buffer);
    res.send(buffer);
});

app.post('/new-post', async (req, res) => {
    const {title, message, type, status } = req.body;
    console.log('Got post', title, message, type, status);
    const slug = slugify(title, { lower: true });
    const newPostDir = `./posts/${slug}`;
    const exists = await fs.pathExists(newPostDir);
    const post = {
        title,
        slug,
        type,
        status,
        summary,
        tags,
        createDate: new Date(),
        updateDate: new Date()
    };
    if (!exists) {
      let buffer = '<div><a href="/admin">admin</a></div>' + buffer;
      res.send(`${buffer}<div>Got post! ${slug}, created</div>`);
      try {
          await fs.ensureDir(newPostDir);
          fs.outputFile(`${newPostDir}/index.md`, message);
          fs.writeJSONSync(`${newPostDir}/index.json`, { post: post });
      } catch (err) {
        console.error(err)
      }
    } else {
      res.send(`${slug} already exists!`);
    }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
