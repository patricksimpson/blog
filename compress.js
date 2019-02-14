const fs = require('fs-extra');
const utils = require('./lib/utils');
const globby = require('globby');
const zlib = require('zlib');

const shrink = async () => {
  const dist = 'build';
  compress = await globby([`${dist}/**/*.html`, `${dist}/**/*.css`, `${dist}/**/*.js`, `${dist}/**/*.json`, `${dist}/**/*.xml`]);
  utils.output(`gzipping ${compress.length} files...`);
  compress.forEach(f => {
    compressFile(f);
  });

  function compressFile(filename, callback) {
    var compress = zlib.createGzip(),
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

shrink();
