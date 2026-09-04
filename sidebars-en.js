// @ts-check

const sidebars = {
  englishSidebar: [
    {
      type: 'doc',
      id: 'index',
      label: 'Home',
    },
    {
      type: 'category',
      label: 'MobiLab',
      link: {type: 'doc', id: 'mobilab/index'},
      items: ['mobilab/projetos', 'mobilab/noticias'],
    },
  ],
};

module.exports = sidebars;
