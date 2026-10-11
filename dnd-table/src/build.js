// Builds the deployed pages from src/: the JSX is compiled once here, so browsers do not compile it on every page load.
const fs = require('fs'), path = require('path');
const babel = require('/home/claude/dnd/t/node_modules/@babel/standalone');
for (const name of process.argv.slice(2).length ? process.argv.slice(2) : ['resolver.html', 'builder.html']) {
  const src = fs.readFileSync(path.join(__dirname, 'src', name), 'utf8');
  const m = /<script type="text\/babel">([\s\S]*?)<\/script>/.exec(src);
  if (!m) throw new Error(name + ': no text/babel script');
  const t0 = Date.now();
  const out = babel.transform(m[1], {presets: ['env', ['react', {runtime: 'classic'}]], sourceType: 'script', compact: false, retainLines: false, comments: true}).code;
  let html = src.slice(0, m.index) + '<script>\n' + out.replace(/<\/script/gi, '<\\/script') + '\n</script>' + src.slice(m.index + m[0].length);
  html = html.replace(/\s*<script src="https:\/\/unpkg\.com\/@babel\/standalone\/babel\.min\.js"><\/script>/, '');
  fs.writeFileSync(path.join(__dirname, name), html);
  console.log(name, 'built in', Date.now() - t0, 'ms,', Math.round(html.length / 1024), 'KB');
}
