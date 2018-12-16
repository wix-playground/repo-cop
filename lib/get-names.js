const os = require('os');
const fs = require('fs');
const sh = require('shelljs');
const { join } = require('path');

module.exports = () => {
  const cwd = fs.mkdtempSync(join(os.tmpdir(), Date.now().toString()));
  const command = 'npm install --silent --progress=false --fetch-retries=0 --cache-min=0 @wix/scopes@latest';
  const result = sh.exec(command, { cwd, silent: true });
  if (result.code === 0) {
    return require(join(cwd, 'node_modules/@wix/scopes/package-names.json'));
  }
  return [];
};