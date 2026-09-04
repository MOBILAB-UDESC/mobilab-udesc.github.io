// @ts-check

const siteUrl = 'https://mobilab.joinville.udesc.br';
const siteTitle = 'MobiLab UDESC';
const socialImage = `${siteUrl}/img/mobilab/mobilab-logo-white-high.png`;
const siteDescription =
  'O MobiLab, Laboratório de Sistemas Autônomos e Robótica Móvel da UDESC Joinville, desenvolve pesquisa aplicada em robótica móvel, sistemas autônomos e interação humano-robô.';

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
        name: 'description',
        content: siteDescription,
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'robots',
        content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      },
    },
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
        content: 'Logotipo do MobiLab UDESC',
      },
    },
    {
      tagName: 'script',
      attributes: { type: 'application/ld+json' },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': ['ResearchOrganization', 'LocalBusiness'],
        name: 'MobiLab - Laboratório de Sistemas Autônomos e Robótica Móvel (UDESC Joinville)',
        alternateName: [
          siteTitle,
          'Mobile Robots and Autonomous Systems Lab (UDESC Joinville)',
        ],
        description: siteDescription,
        disambiguatingDescription:
          'The Mobile Robots and Autonomous Systems Lab at UDESC Joinville conducts applied research in mobile robotics, autonomous systems, and human-robot interaction.',
        url: siteUrl,
        image: socialImage,
        logo: socialImage,
        foundingDate: '2023-01',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'R. Paulo Malschitzki, 200 - Bloco I, 2º andar',
          addressLocality: 'Joinville',
          addressRegion: 'SC',
          postalCode: '89219-710',
          addressCountry: 'BR',
        },
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
          ],
          opens: '09:00',
          closes: '17:00',
        },
        hasMap: 'https://share.google/9krEcFIKE6VJD0NYm',
        knowsAbout: [
          'Robótica móvel',
          'Sistemas autônomos',
          'Robôs humanoides e quadrúpedes',
          'Physical AI',
          'Teleoperação robótica',
          'Inteligência artificial aplicada à robótica',
          'Mobile robotics',
          'Autonomous systems',
          'Humanoid and quadruped robots',
          'Robotic teleoperation',
          'Artificial intelligence applied to robotics',
        ],
        parentOrganization: {
          '@type': 'CollegeOrUniversity',
          name: 'Universidade do Estado de Santa Catarina',
          alternateName: 'UDESC',
          url: 'https://www.udesc.br',
        },
        sameAs: [
          'https://share.google/9krEcFIKE6VJD0NYm',
          'https://github.com/MOBILAB-UDESC',
          'https://www.linkedin.com/showcase/mobilab-udesc/',
          'https://www.instagram.com/mobi.udesc/',
        ],
      }),
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
    defaultLocale: 'pt-BR',
    locales: ['pt-BR'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/mobilab-udesc/wiki/tree/main/',
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
            label: 'Sobre',
          },
          {
            to: '/guides',
            position: 'left',
            label: 'Documentações',
          },
          {
            href: 'https://github.com/mobilab-udesc/wiki',
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
