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
  plugins: ['./src/plugins/people'],

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
          {to: '/', position: 'left', label: 'Home', activeBaseRegex: '^/$'},
          {to: '/mobilab/noticias', position: 'left', label: 'News'},
          {to: '/mobilab/research', position: 'left', label: 'Research'},
          {to: '/mobilab/projetos', position: 'left', label: 'Projects'},
          {to: '/mobilab/people', position: 'left', label: 'People'},
          {to: '/mobilab/publications', position: 'left', label: 'Publications'},
          {to: '/mobilab/infrastructure', position: 'left', label: 'Infrastructure'},
          {to: '/mobilab/contact', position: 'left', label: 'Contact'},
          {to: '/mobilab/brand', position: 'left', label: 'Brand'},
          {
            to: '/guides',
            position: 'left',
            label: 'Guides',
          },
          ...[
            {
              label: 'GitHub',
              href: 'https://github.com/MOBILAB-UDESC',
              icon: '<path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.3c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.4c0 .3.2.7.8.6A12 12 0 0 0 12 .5Z"/>',
            },
            {
              label: 'LinkedIn',
              href: 'https://www.linkedin.com/showcase/mobilab-udesc/',
              icon: '<path d="M20.5 2h-17C2.7 2 2 2.7 2 3.5v17c0 .8.7 1.5 1.5 1.5h17c.8 0 1.5-.7 1.5-1.5v-17c0-.8-.7-1.5-1.5-1.5ZM8 19H5V9h3ZM6.5 7.7a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4ZM19 19h-3v-5c0-1.2 0-2.7-1.7-2.7S12.3 12.6 12.3 14v5h-3V9h2.9v1.4h.1a3.2 3.2 0 0 1 2.9-1.6c3.1 0 3.8 2 3.8 4.5Z"/>',
            },
            {
              label: 'Instagram',
              href: 'https://www.instagram.com/mobi.udesc/',
              icon: '<g fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/></g><circle cx="17.5" cy="6.5" r="1.2"/>',
            },
          ].map(({label, href, icon}) => ({
            type: 'html',
            className: 'navbar-social-item',
            position: 'right',
            value: `<a class="navbar-social" href="${href}" aria-label="MobiLab on ${label}" title="${label}"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true" focusable="false">${icon}</svg></a>`,
          })),
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
