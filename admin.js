const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const ejs = require('ejs');
const slugify = require('slugify')
const glob = require('glob');
const path = require('path');
const moment = require('moment');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('-_-'));

app.use('/admin/static', express.static('admin/static'))

app.get('/admin/new-post', (req, res) => {
  res.sendFile(path.join(__dirname + '/admin/new-post.html'));
});

app.get('/admin/edit-post', (req, res) => {
  const slug = req.query.p;
  if (!slug || slug === 'undefined') {
    res.send(`Post not found!`);
  } else {
    const jd = `posts/${slug}/index.json`;
    const md = `posts/${slug}/index.md`;
    let p = fs.readJsonSync(jd);
    let body = fs.readFileSync(md);
    ejs.renderFile(path.join(__dirname + '/admin/post.ejs'), { state: 'edit', post: p.post, body }, function(err, str){
      res.send(str);
    });
  }
});

app.get('/admin', (req, res) => {
    glob("posts/**/*.json", function (er, files) {
      let posts = [];

      files.forEach((f) => {
        let p = fs.readJsonSync(f);
        let { title, status, type, slug, createDate } = p.post;
        if (typeof slug === 'undefined') {
          slug = slugify(title, { lower: true});
        }
        posts.push({ title, status, type, slug, date: moment(createDate).format('MMMM Do YYYY, h:mm:ss a')});
      });
      ejs.renderFile(path.join(__dirname + '/admin/index.ejs'), {posts}, function(err, str){
        res.send(str);
      });
    });
});

app.get('/admin/delete-post', (req, res) => {
    const p = req.query.p;
    let buffer = `deleting ${p}`;
    fs.removeSync(`./posts/${p}`)
    console.log(buffer);
    res.send(buffer);
});

app.post('/update-post', async (req, res) => {
    const {title, message, type, status, summary, tags } = req.body;
    console.log('Got post', req.body);
    let buffer = '';
    const slug = slugify(title, { lower: true });
    const postDir = `./posts/${slug}`;
    const exists = await fs.pathExists(postDir);
    const post = {
        title,
        slug,
        type,
        status,
        summary,
        tags,
        updateDate: new Date()
    };
    if (exists) {
      let p = fs.readJsonSync(`${postDir}/index.json`);
      post['createDate'] = p.createDate;
      res.send(`${buffer}<div>updating post! ${slug}</div>`);
      buffer = `<div><a href="/admin">admin</a></div>${buffer}`;
      try {
        fs.outputFile(`${postDir}/index.md`, message);
        fs.writeJSONSync(`${postDir}/index.json`, { post: post });
        res.redirect('/admin');
      } catch (err) {
        console.error(err)
      }
    } else {
      res.send(`${slug} doesn't exist!`);
      res.send(`${buffer}<div>updated post! ${slug}</div>`);
      buffer = `<div><a href="/admin">admin</a></div>${buffer}`;
    }
});

app.post('/add-post', async (req, res) => {
    const {title, message, type, status, summary, tags } = req.body;
    console.log('Got post', req.body);
    let buffer = '';
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
      buffer = `<div><a href="/admin">admin</a></div>${buffer}`;
      res.send(`${buffer}<div>Got post! ${slug}, created</div>`);
      res.redirect('/admin');
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
