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
          link: {type: 'doc', id: 'guides/G1/index'},
          items: [
            {
              type: 'category',
              label: 'Configuração Inicial',
              link: {type: 'doc', id: 'guides/G1/configuracao-inicial/index'},
              items: [
                'guides/G1/configuracao-inicial/introducao',
                'guides/G1/configuracao-inicial/conectando-ethernet',
                'guides/G1/configuracao-inicial/ativando-wifi',
                'guides/G1/configuracao-inicial/host-setup',
                'guides/G1/configuracao-inicial/controlando-pelo-sdk',
              ],
            },
            {
              type: 'category',
              label: 'Teleoperação',
              link: {type: 'doc', id: 'guides/G1/teleoperacao/index'},
              items: [
                {
                  type: 'category',
                  label: 'Configuração',
                  items: [
                    'guides/G1/teleoperacao/configuracao/configuracao-quest',
                    'guides/G1/teleoperacao/configuracao/configuracao-host',
                    'guides/G1/teleoperacao/configuracao/configuracao-pc2',
                    'guides/G1/teleoperacao/configuracao/checklist',
                  ],
                },
                {
                  type: 'category',
                  label: 'Execução',
                  items: [
                    'guides/G1/teleoperacao/execucao/via-wifi',
                    'guides/G1/teleoperacao/execucao/cabeada',
                    'guides/G1/teleoperacao/execucao/host-unificado',
                  ],
                },
              ],
            },
            'guides/G1/referencias',
          ],
        },
        {
          type: 'category',
          label: 'NVIDIA Jetson',
          link: {type: 'doc', id: 'guides/nvidia/index'},
          items: [
            {
              type: 'category',
              label: 'Thor',
              items: [
                'guides/nvidia/jetson-thor/hardware',
                'guides/nvidia/jetson-thor/install',
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Ferramentas',
          link: {type: 'doc', id: 'guides/Ferramentas/index'},
          items: [
            'guides/Ferramentas/extensao-ssh',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'CAD models',
      link: {type: 'doc', id: 'cad/index'},
      items: [],
    },
  ],
};

module.exports = sidebars;
