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
const shell = require('shelljs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use(express.static('build'))

app.use('/admin/static', express.static('admin/static'))

app.get('/admin/new-post', (req, res) => {
  res.sendFile(path.join(__dirname + '/admin/new-post.html'));
});

app.get('/admin/build-posts', (req, res) => {
  shell.exec('node build');
  res.redirect('/admin?refreshed=true');
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
    res.redirect('/admin?deleted=true');
});

app.post('/update-post', async (req, res) => {
    const {title, message, type, status, summary, tags, oldTitle, createDate } = req.body;
    console.log('Got post', req.body);
    let buffer = '';

    const slug = slugify(title, { lower: true });
    const oldSlug = slugify(oldTitle, { lower: true });

    let postDir = `./posts/${oldSlug}`;
    let newPostDir = `./posts/${slug}`;

    let exists = await fs.pathExists(path.join(__dirname, newPostDir));
    if (!exists && slug !== oldSlug) {
      console.log('RENAMING POST!');
      fs.moveSync(path.join(__dirname, postDir), path.join(__dirname, newPostDir));
      postDir = newPostDir;
      exists = await fs.pathExists(path.join(__dirname, postDir));
    }
    const post = {
        title,
        slug,
        type,
        status,
        summary,
        tags,
        createDate: createDate,
        updateDate: new Date()
    };
    if (exists) {
      let p = fs.readJsonSync(`${postDir}/index.json`);
      console.log('SAVING DATA!');
      try {
        fs.outputFile(`${postDir}/index.md`, message);
        fs.writeJSONSync(`${postDir}/index.json`, { post: post });
        res.redirect('/admin/build-posts?success=true&updated=true');
      } catch (err) {
        console.error(err);
      }
    } else {
      res.send(`${slug} doesn't exist!`);
      buffer = `<div><a href="/admin">admin</a></div>${buffer}`;
      return;
    }
    res.redirect('/admin');
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
      buffer = `<div><a href="/admin">admin</a></div>${buffer}<br/>`;
      buffer = `${buffer}<br /><a href="${slug}">view post</a>/></div>`;
      res.redirect('/admin/build-posts?success=true&newpost=true');
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
