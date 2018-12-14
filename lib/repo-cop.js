#!/usr/bin/env node

const { promisify } = require('util');
const { resolve, dirname, join } = require('path');
const fs = require('fs');
const program = require('commander');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const cwd = process.cwd();
const wellKnownFilters = ['.', 'node_modules', 'bower_components', 'vendor'];

program
  .version('0.0.1')
  .option('-f, --filter [filter]', 'Filter the projects by folder name')
  .option(
    '-d, --dependency [dependency]',
    'Filter projects having specified dependency'
  )
  .option('-g, --group', 'Group output where applicable')
  .parse(process.argv);

scan(cwd, wellKnownFilters)
  .then(files => {
    return files
      .filter(_ => _.endsWith('package.json'))
      .sort()
      .map(_ => {
        const pkgJson = require(_);
        const dir = dirname(_);
        const deps = {
          ...(pkgJson.peerDependencies || {}),
          ...(pkgJson.dependencies || {}),
          ...(pkgJson.devDependencies || {})
        };
        return {
          pkg: _,
          pkgJson,
          deps,
          dir,
          relativeDir: dir.replace(`${cwd}/`, '')
        };
      })
      .filter(_ =>
        program.filter ? _.relativeDir.includes(program.filter) : true
      )
      .filter(_ => (program.dependency ? _.deps[program.dependency] : true));
  })
  .then(_ => {
    console.log(`TOTAL: ${_.length}`);
    console.log('-'.repeat(40));
    if (program.dependency) {
      if (program.group) {
        const mapped = _.reduce((acc, curr) => {
          acc[curr.deps[program.dependency]] =
            acc[curr.deps[program.dependency]] || [];
          acc[curr.deps[program.dependency]].push(curr);
          return acc;
        }, {});
        console.log(program.dependency);
        Object.keys(mapped).forEach(version => {
          console.log(version);
          mapped[version].forEach(_ => {
            console.log(`  ${_.relativeDir}`);
          });;
        });
      } else {
        _.forEach(_ => {
          console.log(
            program.dependency,
            _.deps[program.dependency],
            _.relativeDir
          );
        });
      }
    } else {
      _.forEach(_ => console.log(_.relativeDir));
    }
    console.log('-'.repeat(40));
    console.log(`TOTAL: ${_.length}`);
  });

async function scan(dir, filter) {
  const subdirs = (await readdir(dir)).filter(file => include(file, filter));
  const files = await Promise.all(
    subdirs.map(async subdir => {
      const res = resolve(dir, subdir);
      return (await stat(res)).isDirectory() ? scan(res, filter) : res;
    })
  );
  return files.reduce((a, f) => a.concat(f), []);
}

function include(name, filter) {
  return !filter.some(rule => name.startsWith(rule));
}
