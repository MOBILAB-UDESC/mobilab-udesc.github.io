const fs = require("fs");
const path = require("path");

function walk(directory) {
  return fs.readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(filePath) : [filePath];
  });
}

module.exports = function englishLanguagePlugin() {
  return {
    name: "english-language-metadata",
    postBuild({outDir}) {
      for (const filePath of walk(outDir).filter((file) => file.endsWith(".html"))) {
        const relativePath = path.relative(outDir, filePath);
        const isEnglishPage = relativePath === "en.html" || relativePath.startsWith(`en${path.sep}`);
        const route = (`/${relativePath
          .replaceAll(path.sep, "/")
          .replace(/\.html$/, "")
          .replace(/\/index$/, "")}`) || "/";
        const englishRoute = isEnglishPage ? route : `/en${route}`;
        const portugueseRoute = isEnglishPage ? route.replace(/^\/en$/, "") || "/" : route;
        const englishUrl = `https://mobilab.joinville.udesc.br${englishRoute}`;
        const portugueseUrl = `https://mobilab.joinville.udesc.br${portugueseRoute}`;
        const hasEnglishTranslation = ["/", "/mobilab", "/mobilab/projetos", "/mobilab/noticias"].includes(portugueseRoute);
        let html = fs.readFileSync(filePath, "utf8");

        if (isEnglishPage) {
          html = html
            .replace('<html lang="pt-BR"', '<html lang="en"')
            .replace(/content="pt-BR"/g, 'content="en"')
            .replace('content="pt_BR"', 'content="en_US"')
            .replaceAll(' | MobiLab UDESC | MobiLab UDESC', ' | MobiLab UDESC')
            .replace(/<link data-rh="true" rel="alternate" href="[^"]+" hreflang="pt-BR">/, `<link data-rh="true" rel="alternate" href="${portugueseUrl}" hreflang="pt-BR">`)
          .replace(/<link data-rh="true" rel="alternate" href="[^"]+" hreflang="x-default">/, `<link data-rh="true" rel="alternate" href="${portugueseUrl}" hreflang="x-default"><link data-rh="true" rel="alternate" href="${englishUrl}" hreflang="en">`);
        } else if (hasEnglishTranslation) {
          html = html.replace(/<link data-rh="true" rel="alternate" href="[^"]+" hreflang="x-default">/, `$&<link data-rh="true" rel="alternate" href="${englishUrl}" hreflang="en">`);
        }

        html = html
          .replace(
            '<meta name="author" content="MobiLab UDESC">',
            isEnglishPage
              ? '<meta name="author" content="MobiLab UDESC"><meta http-equiv="content-language" content="en">'
              : '<meta name="author" content="MobiLab UDESC">',
          );
        fs.writeFileSync(filePath, html);
      }
    },
  };
};
