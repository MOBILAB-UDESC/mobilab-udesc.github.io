const {readFile} = require("node:fs/promises");
const path = require("node:path");
const yaml = require("js-yaml");

module.exports = function peoplePlugin({siteDir}) {
  const file = path.join(siteDir, "src/data/people.yml");
  return {
    name: "mobilab-people",
    getPathsToWatch: () => [file],
    async loadContent() {
      return yaml.load(await readFile(file, "utf8"));
    },
    contentLoaded({content, actions}) {
      actions.setGlobalData(content);
    },
  };
};
