// Packages the production build in www/ for a static Vercel deployment, without building anything on Vercel.
//
//   npx ng build --configuration production     (Node 14, see the project notes)
//   node scripts/prepare-vercel.js
//   vercel deploy --prebuilt                    (add --prod for the production deployment)
//
// It writes .vercel/output in Vercel's Build Output API v3 layout: the files of www/ under static/, and a config.json
// that serves real files first and answers every other app route with index.html. Only www/ is copied, so the source,
// node_modules, the old docs/ build and docs.zip are never part of a deployment.

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'www');
const output = path.join(root, '.vercel', 'output');
const target = path.join(output, 'static');

function fail(message) {
  console.error('prepare-vercel: ' + message);
  process.exit(1);
}

function remove(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }
  fs.readdirSync(dir).forEach(name => {
    const entry = path.join(dir, name);
    fs.lstatSync(entry).isDirectory() ? remove(entry) : fs.unlinkSync(entry);
  });
  fs.rmdirSync(dir);
}

function copy(from, to) {
  let files = 0;
  fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach(name => {
    const entry = path.join(from, name);
    if (fs.lstatSync(entry).isDirectory()) {
      files += copy(entry, path.join(to, name));
    } else {
      fs.copyFileSync(entry, path.join(to, name));
      files++;
    }
  });
  return files;
}

const index = path.join(source, 'index.html');
if (!fs.existsSync(index)) {
  fail('www/index.html not found. Run "npx ng build --configuration production" first.');
}
const html = fs.readFileSync(index, 'utf8');
if (!/<base href="\/"\s*\/?>/.test(html)) {
  fail('www/index.html does not use <base href="/">. Rebuild with the production configuration.');
}
if (!fs.readdirSync(source).some(name => /^main\..*\.js$/.test(name))) {
  fail('www/ has no hashed main bundle, so it is not a production build.');
}

// only the generated output is replaced: the project link Vercel keeps in .vercel/ stays
remove(output);
const files = copy(source, target);

const config = {
  version: 3,
  routes: [
    // a file that exists is always served as itself
    { handle: 'filesystem' },
    // any other path without a file extension is an app route; a missing file keeps its 404
    { src: '^/(?!.*\\.[A-Za-z0-9]+$).*$', dest: '/index.html' },
  ],
};
fs.writeFileSync(path.join(output, 'config.json'), JSON.stringify(config, null, 2) + '\n');

console.log('prepare-vercel: copied ' + files + ' files from www/ to .vercel/output/static');
console.log('prepare-vercel: www/ was built ' + fs.statSync(index).mtime.toISOString());
console.log('prepare-vercel: next, from this folder: vercel deploy --prebuilt');
