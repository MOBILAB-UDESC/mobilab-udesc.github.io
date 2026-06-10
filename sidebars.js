// @ts-check

const sidebars = {
  wikiSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Home',
    },
    {
      type: 'category',
      label: 'Sobre',
      link: {type: 'doc', id: 'mobilab/index'},
      items: [
        'mobilab/projetos',
        'mobilab/noticias',
      ],
    },
    {
      type: 'category',
      label: 'Documentação',
      link: {type: 'doc', id: 'guides/index'},
      items: [
        {
          type: 'category',
          label: 'Unitree G1',
          link: {type: 'doc', id: 'guides/unitree-g1/index'},
          items: [
            'guides/unitree-g1/ligando-o-robo',
            'guides/unitree-g1/conectando-ethernet',
            'guides/unitree-g1/ativando-wifi',
            'guides/unitree-g1/host-setup',
            'guides/unitree-g1/arquitetura',
            'guides/unitree-g1/controlando-pelo-sdk',
            'guides/unitree-g1/teleoperacao',
          ],
        },
      ],
    },
  ],
};

module.exports = sidebars;
