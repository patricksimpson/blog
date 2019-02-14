const shell = require('shelljs');
const fs = require('fs-extra');
const utils = require('./lib/utils');
const globby = require('globby');
const zlib = require('zlib');

const deploy = async () => {
  const shrink = async () => {
    const dist = 'build';
    compress = await globby([`${dist}/**/*.html`, `${dist}/**/*.css`, `${dist}/**/*.js`, `${dist}/**/*.json`, `${dist}/**/*.xml`]);
    utils.output(`gzipping ${compress.length} files...`);
    compress.forEach(f => {
      compressFile(f);
    });

    function compressFile(filename, callback) {
      const compress = zlib.createGzip(),
          input = fs.createReadStream(filename),
          output = fs.createWriteStream(filename + '.gz');

      input.pipe(compress).pipe(output);

      fs.moveSync(`${filename}.gz`, `${filename}`, { overwrite: true });

      if (callback) {
        output.on('end', callback);
      }
    }

    utils.output(`done gzipping`);
  };

  await shrink();

  utils.output(`Upload Meta Files`);
  shell.exec("aws s3 cp build/ s3://patricksimpson.me/ --recursive --include='*' --exclude='*.html' --exclude='*.css' --exclude='*.js' --exclude='*.json' --exclude='*.xml' --exclude='*.DS_Store'");
  utils.output(`Upload Base Files`);
  shell.exec("aws s3 cp build/ s3://patricksimpson.me/ --recursive --content-encoding 'gzip' --exclude='*' --include='*.html' --include='*.css' --include '*.js' --include='*.json' --include='*.xml'");
  utils.output(`Setting Expires`);
  shell.exec("aws s3 cp build/ s3://patricksimpson.me/ --recursive --exclude='*' --include='*.css' --include='*.js' --include='*.svg' --include='*.png' --include='*.webmanifest' --acl public-read  --metadata-directive REPLACE --cache-control max-age=2592000");
  utils.output(`Clearing CloudFront Cache`);
  shell.exec("aws cloudfront create-invalidation --distribution-id=EHEGKY5SSPRMA --paths '/*'");
}

deploy();
