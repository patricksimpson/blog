# Blog

Welcome to my blog generator. 

This is my attempt at becoming completely serverless and "static". Using JavaScript, AWS and some linux magic.

Please keep in mind, this work is incomplete and still requires some configuration/variablization.  

## Design

For now, all of the functionality is located in the `lib` directory.

`node index.js`

- Kicks off the post generator.
- Provides data to the page, tag, rss, search generators.

## Posts

Posts are in markdown format, located in the repo: https://github.com/patricksimpson/posts

Deployments, will only read from the remote repository, local builds can be either remote or local directory builds (this allows for drafting).


## Deploy

Using AWS to push the entire `build` directory after the generators are completed. All the deploy commands are located in the `package.json` file.
