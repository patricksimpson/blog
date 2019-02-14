const shell = require('shelljs');
const fs = require('fs-extra');
const utils = require('./lib/utils');
const globby = require('globby');
const zlib = require('zlib');

require('dotenv').config();
const isDryRun = process.env.DRYRUN || false;
const dryRun = !!isDryRun ? '--dryrun' : '';
const dist = 'build';

const awsCommand = `aws s3 cp ${dryRun} ${dist}/`;
const awsBucket = `s3://patricksimpson.me/`
const awsOptions = `--recursive`;
const aws = `${awsCommand} ${awsBucket} ${awsOptions}`;

const deploy = async () => {
  const shrink = async () => {
    compress = await globby([`${dist}/**/*.html`, `${dist}/**/*.css`, `${dist}/**/*.js`, `${dist}/**/*.json`, `${dist}/**/*.xml`]);
    utils.output(`gzipping ${compress.length} files...`);
    let renameRemaining = compress.length;
    compress.forEach(filename => {
      const compress = zlib.createGzip(),
          input = fs.createReadStream(filename),
          output = fs.createWriteStream(filename + '.gz');

      input.pipe(compress).pipe(output);
      output.on('close', () => {
        fs.moveSync(`${filename}.gz`, `${filename}`, { overwrite: true });
        if (--renameRemaining <= 0) {
          initDeploy();
        }
      });
    });
  };

  await shrink();

  function initDeploy() {
    const seq = [uploadBase, expires, clearCache];
    deployStep(seq, 0);

    function deployStep(seq, i) {
      if (i < seq.length) {
        let cb = seq[i];
        cb();
        setTimeout(() => deployStep(seq, i + 1), 1000);
      }
    }
    utils.output(`Deployment Complete`);
  }

  // function uploadMeta() {
  //   utils.output(`Upload Meta Files`);
  //   let comm = `${aws} --include='*' --exclude='*.html' --exclude='*.css' --exclude='*.js' --exclude='*.json' --exclude='*.xml' --exclude='*.DS_Store'`
  //   shell.exec(comm);
  // }

  function uploadBase() {
    utils.output(`Upload Base Files`);
    let comm = `${aws} --content-encoding 'gzip' --exclude='*' --include='*.html' --include='*.json' --include='*.xml'`
    shell.exec(comm);
  }

  function expires() {
    utils.output(`Upload Static Content and Set Expires`);
    let comm = `${aws} --exclude='*' --include='*.css' --include='*.js' --acl public-read  --metadata-directive REPLACE --content-encoding 'gzip' --cache-control max-age=2592000`;
    let meta = `${aws} --exclude='*' --include='*.svg' --include='*.png' --include='*.webmanifest' --acl public-read  --metadata-directive REPLACE --cache-control max-age=2592000`
    shell.exec(comm);
    shell.exec(meta);
  }
  function clearCache() {
    utils.output(`Clearing CloudFront Cache`);
    if(!isDryRun) {
      shell.exec("aws cloudfront create-invalidation --distribution-id=EHEGKY5SSPRMA --paths '/*'");
    }
  }
}

deploy();
