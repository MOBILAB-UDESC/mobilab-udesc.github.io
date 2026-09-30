const assert = require("node:assert/strict");
const {test} = require("node:test");
const path = require("node:path");
const {transformFileSync} = require("@babel/core");
const {runInNewContext} = require("node:vm");
const React = require("react");
const {renderToStaticMarkup} = require("react-dom/server");

const {code} = transformFileSync(path.join(__dirname, "../src/components/Publications.js"), {
  babelrc: false,
  configFile: false,
  presets: ["@babel/preset-react"],
  plugins: ["@babel/plugin-transform-modules-commonjs"],
});
const exportsFromComponent = {};
runInNewContext(code, {exports: exportsFromComponent, require});
const {default: Publications, selectPublications} = exportsFromComponent;

test("publication filters combine, sort newest first, and preserve citation links", () => {
  const publications = [
    {title: "Earlier article", authors: "First Author and Second Author", year: 2024, type: "Journal article", venue: "Journal", reference: "1(2), 3-4", doi: "10.1234/earlier", bibtex: String.raw`@article{Earlier2024,
  author = {Author, First and Author, Second},
  title = {Earlier article},
  journal = {Journal},
  year = {2024},
  pages = {3--4},
  note = {LaTeX accent: {\^e}},
  doi = {10.1234/earlier}
}`},
    {title: "Recent paper", authors: "Third Author", year: 2025, type: "Conference paper", venue: "Conference", reference: "5-6", doi: "10.1234/recent", code: "https://example.com/code"},
    {title: "Recent article", authors: "Fourth Author", year: 2025, type: "Journal article", venue: "Journal", reference: "2(1), 7-8", doi: "10.1234/article"},
  ];
  const titles = (type, year) => selectPublications(publications, type, year).map((publication) => publication.title);
  assert.deepEqual(titles("", ""), ["Recent paper", "Recent article", "Earlier article"]);
  assert.deepEqual(titles("Journal article", ""), ["Recent article", "Earlier article"]);
  assert.deepEqual(titles("", "2025"), ["Recent paper", "Recent article"]);
  assert.deepEqual(titles("Journal article", "2025"), ["Recent article"]);
  assert.deepEqual(titles("Conference paper", "2024"), []);
  assert.equal(publications[0].title, "Earlier article");

  const html = renderToStaticMarkup(React.createElement(Publications, {publications}));
  assert.ok(html.indexOf("Recent paper") < html.indexOf("Earlier article"));
  assert.match(html, /\[2024\] <a href="https:\/\/doi.org\/10.1234\/earlier">Earlier article<\/a>\. <em>Journal<\/em>, 1\(2\), 3-4\.<br\/>First Author and Second Author\./);
  assert.match(html, /href="https:\/\/doi.org\/10.1234\/earlier"/);
  assert.match(html, /href="https:\/\/example.com\/code"/);
  assert.match(html, /<summary aria-label="Cite Earlier article">Cite<\/summary>/);
  assert.ok(html.includes(`<pre><code>${publications[0].bibtex}</code></pre>`));
  assert.match(html, /role="status">3 of 3 publications/);
  const emptyHtml = renderToStaticMarkup(React.createElement(Publications, {publications: []}));
  assert.match(emptyHtml, /No publications match these filters/);
});
