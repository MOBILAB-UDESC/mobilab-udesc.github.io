// @ts-check

const siteUrl = 'https://mobilab.joinville.udesc.br';
const siteTitle = 'MobiLab UDESC';
const socialImage = `${siteUrl}/img/mobilab/mobilab-logo-white-high.png`;
const siteDescription =
  'MobiLab UDESC Joinville researches mobile robotics, autonomous systems, and Physical AI.';

const config = {
  title: siteTitle,
  themes: ['@docusaurus/theme-mermaid'],
  tagline: siteDescription,
  favicon: 'img/mobilab/mobilab-logo.png',
  url: siteUrl,
  baseUrl: '/',
  organizationName: 'mobilab-udesc',
  projectName: 'mobilab-udesc.github.io',
  trailingSlash: false,

  headTags: [
    {
      tagName: 'meta',
      attributes: {
        name: 'author',
        content: 'MobiLab UDESC',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'theme-color',
        content: '#1c1e21',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:type',
        content: 'website',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:site_name',
        content: siteTitle,
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:image:alt',
        content: 'MobiLab UDESC logo',
      },
    },
  ],

  onBrokenLinks: 'throw',
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/MOBILAB-UDESC/mobilab-udesc.github.io/tree/main/',
        },
        blog: false,
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      mermaid: {
        theme: { light: 'default', dark: 'dark' },
      },
      image: 'img/mobilab/mobilab-logo-white-high.png',
      navbar: {
        title: 'MobiLab UDESC',
        logo: {
          alt: 'MobiLab UDESC',
          src: 'img/mobilab/mobilab-logo.png',
        },
        items: [
          {
            to: '/mobilab',
            position: 'left',
            label: 'About',
          },
          {
            to: '/guides',
            position: 'left',
            label: 'Guides',
          },
          {
            href: 'https://github.com/MOBILAB-UDESC',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `<div class="footer-branding"><div class="footer-branding__logos"><a href="https://www.udesc.br" aria-label="UDESC"><img src="/img/mobilab/udesc-logo-footer.png" alt="UDESC - Universidade do Estado de Santa Catarina" class="footer-branding__logo footer-branding__logo--udesc" /></a><a href="https://github.com/MOBILAB-UDESC" aria-label="MobiLab UDESC no GitHub"><img src="/img/mobilab/mobilab-logo-footer.png" alt="MobiLab UDESC" class="footer-branding__logo footer-branding__logo--mobilab" /></a></div><div>Copyright © ${new Date().getFullYear()} MobiLab UDESC.</div></div>`,
      },
      prism: {
        theme: require('prism-react-renderer').themes.github,
        darkTheme: require('prism-react-renderer').themes.dracula,
      },
    }),
};

module.exports = config;
