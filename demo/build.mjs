// Builds demo/index.html: the demo page with the card and the made-up house baked in, so the one file
// works wherever it is opened (downloaded on its own, from GitHub Pages, or straight from disk).
// Run after changing the card or the demo:  node demo/build.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'demo/template.html'), 'utf8').replace(/<script>\/\*INLINE:([^*]+)\*\/<\/script>/g, (_, file) => {
  const js = readFileSync(join(root, file), 'utf8');
  if (/<\/script/i.test(js)) throw new Error(file + ' contains </script>, which would end the inline script early');
  return `<script>\n/* ${file} */\n${js}\n</script>`;
});
if (html.includes('INLINE:')) throw new Error('an INLINE marker was not replaced');
// the note goes after the doctype: anything before it would put the page in quirks mode
const out = html.replace(/^<!doctype html>\r?\n/i, m => m + '<!-- Built by demo/build.mjs from demo/template.html. Edit those, not this file. -->\n');
if (out === html) throw new Error('template.html must start with <!doctype html>');
writeFileSync(join(root, 'demo/index.html'), out);
console.log('demo/index.html', (out.length / 1024).toFixed(0) + ' KB');
