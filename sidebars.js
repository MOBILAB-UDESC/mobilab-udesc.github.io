// @ts-check

const sidebars = {
  wikiSidebar: [
    {
      type: 'doc',
      id: 'index',
      label: 'Home',
    },
    {
      type: 'category',
      label: 'MobiLab',
      link: {type: 'doc', id: 'mobilab/index'},
      items: [
        'mobilab/projetos',
        'mobilab/noticias',
        'mobilab/brand/index',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      link: {type: 'doc', id: 'guides/index'},
      items: [
        {
          type: 'category',
          label: 'Unitree G1',
          link: {type: 'doc', id: 'guides/G1/index'},
          items: [
            {
              type: 'category',
              label: 'Initial setup',
              link: {type: 'doc', id: 'guides/G1/configuracao-inicial/index'},
              items: [
                {type: 'doc', id: 'guides/G1/configuracao-inicial/introducao', label: 'Introduction'},
                {type: 'doc', id: 'guides/G1/configuracao-inicial/conectando-ethernet', label: 'Connecting via Ethernet'},
                {type: 'doc', id: 'guides/G1/configuracao-inicial/ativando-wifi', label: 'Enabling Wi-Fi'},
                {type: 'doc', id: 'guides/G1/configuracao-inicial/host-setup', label: 'Host setup'},
                {type: 'doc', id: 'guides/G1/configuracao-inicial/controlando-pelo-sdk', label: 'Controlling with the SDK'},
              ],
            },
            {
              type: 'category',
              label: 'Teleoperation',
              link: {type: 'doc', id: 'guides/G1/teleoperacao/index'},
              items: [
                {
                  type: 'category',
                  label: 'Setup',
                  items: [
                    {type: 'doc', id: 'guides/G1/teleoperacao/configuracao/configuracao-quest', label: 'Quest setup'},
                    {type: 'doc', id: 'guides/G1/teleoperacao/configuracao/configuracao-host', label: 'Host setup'},
                    {type: 'doc', id: 'guides/G1/teleoperacao/configuracao/configuracao-pc2', label: 'PC2 setup'},
                    {type: 'doc', id: 'guides/G1/teleoperacao/configuracao/checklist', label: 'Checklist'},
                  ],
                },
                {
                  type: 'category',
                  label: 'Operation',
                  items: [
                    {type: 'doc', id: 'guides/G1/teleoperacao/execucao/via-wifi', label: 'Wi-Fi operation'},
                    {type: 'doc', id: 'guides/G1/teleoperacao/execucao/cabeada', label: 'Wired operation'},
                    {type: 'doc', id: 'guides/G1/teleoperacao/execucao/host-unificado', label: 'Unified host'},
                  ],
                },
              ],
            },
            {type: 'doc', id: 'guides/G1/referencias', label: 'References'},
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
                {type: 'doc', id: 'guides/nvidia/jetson-thor/hardware', label: 'Hardware'},
                {type: 'doc', id: 'guides/nvidia/jetson-thor/install', label: 'Installation'},
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Tools',
          link: {type: 'doc', id: 'guides/ferramentas/index'},
          items: [
            {type: 'doc', id: 'guides/ferramentas/extensao-ssh', label: 'SSH extension'},
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
