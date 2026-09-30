---
title: Publications
description: Selected publications by MobiLab researchers on robotics, control, and autonomous systems.
hide_table_of_contents: true
---

import Publications from "@site/src/components/Publications";

export const publications = [
  {
    title: "Discovering Control Scheduler Policies Through Reinforcement Learning and Evolutionary Strategies",
    authors: "Aureo Guilherme Dobrikopf, Gabriel Abatti, and Douglas Wildgrube Bertol",
    year: 2025,
    type: "Journal article",
    venue: "Actuators",
    reference: "14(12), 604",
    doi: "10.3390/act14120604",
    bibtex: String.raw`@article{Dobrikopf2025,
  author = {Dobrikopf, Aureo Guilherme and Abatti, Gabriel and Bertol, Douglas Wildgrube},
  title = {{Discovering Control Scheduler Policies Through Reinforcement Learning and Evolutionary Strategies}},
  journal = {Actuators},
  year = {2025},
  volume = {14},
  number = {12},
  pages = {604},
  doi = {10.3390/act14120604}
}`,
    code: "https://github.com/AureoGD/control_scheduling",
    note: "The authors list MobiLab at UDESC Joinville as their affiliation. The paper compares reinforcement learning and evolutionary strategies for selecting controllers.",
  },
  {
    title: "Adaptive Imune Fuzzy Quasi-Sliding Mode Formation Tracking Control for Wheeled Mobile Robots with Obstacle Avoidance Under Incidence of Uncertainties and Disturbances: An Artificial Immune Systems Inspired Approach",
    authors: "Willy John Nakamura Goto, Douglas Wildgrube Bertol, and Nardênio Almeida Martins",
    year: 2024,
    type: "Journal article",
    venue: "Learning and Nonlinear Models",
    reference: "22(1), 61-95",
    doi: "10.21528/lnlm-vol22-no1-art5",
    bibtex: String.raw`@article{NakamuraGoto2024,
  author = {Nakamura Goto, Willy John and Bertol, Douglas Wildgrube and Martins, Nard{\^e}nio Almeida},
  title = {{Adaptive Imune Fuzzy Quasi-Sliding Mode Formation Tracking Control for Wheeled Mobile Robots with Obstacle Avoidance Under Incidence of Uncertainties and Disturbances: An Artificial Immune Systems Inspired Approach}},
  journal = {Learning and Nonlinear Models},
  year = {2024},
  volume = {22},
  number = {1},
  pages = {61--95},
  doi = {10.21528/lnlm-vol22-no1-art5}
}`,
    note: "The paper studies formation tracking and obstacle avoidance for differential-drive mobile robots under uncertainties and disturbances.",
  },
];

# Publications

Selected publications by MobiLab researchers.

<Publications publications={publications} />

## Research profiles

For additional publications, see Douglas Wildgrube Bertol's [Google Scholar](https://scholar.google.com/citations?hl=en&user=QlCC_IoAAAAJ), [ORCID](https://orcid.org/0000-0002-6980-7422), and [Lattes](http://lattes.cnpq.br/5099032394205654) profiles.
