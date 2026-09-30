const assert = require("node:assert/strict");
const {test} = require("node:test");
const path = require("node:path");
const {existsSync} = require("node:fs");
const peoplePlugin = require("../src/plugins/people");

test("people data loads into Docusaurus with valid profiles and local portraits", async () => {
  const siteDir = path.resolve(__dirname, "..");
  const plugin = peoplePlugin({siteDir});
  const people = await plugin.loadContent();
  assert.ok(Array.isArray(people) && people.length > 0);
  assert.equal(new Set(people.map((person) => person.name)).size, people.length);
  for (const person of people) {
    for (const field of ["name", "role", "group"]) {
      assert.ok(typeof person[field] === "string" && person[field].trim(), field);
    }
    for (const field of ["linkedin", "lattes", "github", "website", "google_scholar", "orcid"]) {
      assert.ok(Object.hasOwn(person, field), field);
      if (person[field] !== null) assert.match(person[field], /^https?:\/\//, field);
    }
    assert.ok(Object.hasOwn(person, "image"));
    if (person.image !== null) {
      assert.match(person.image, /^\/img\/people\//);
      assert.ok(existsSync(path.join(siteDir, "static", person.image)));
    }
  }
  let globalData;
  plugin.contentLoaded({content: people, actions: {setGlobalData: (data) => { globalData = data; }}});
  assert.deepEqual(globalData, people);
  assert.deepEqual(plugin.getPathsToWatch(), [path.join(siteDir, "src/data/people.yml")]);
});
