---
title: Publications
description: Selected publications by MobiLab researchers on robotics, control, and autonomous systems.
hide_table_of_contents: true
---

import Publications from "@site/src/components/Publications";

export const publications = [
  {
    title: "Related Pairs Control (RPC): A 3D Position Controller for an Anthropomorphic Arm Using Two-Dimensional Images",
    authors: "Luca Rangel, Nilton Sare, Aureo Dobrikopf, and Douglas Bertol",
    year: 2026,
    type: "Conference paper",
    venue: "XXVI Congresso Brasileiro de Automática (CBA 2026)",
    reference: "São Paulo",
    doi: "10.29327/1989232.26-612",
    bibtex: String.raw`@inproceedings{Rangel2026,
  author = {Rangel, Luca and Sare, Nilton and Dobrikopf, Aureo and Bertol, Douglas},
  title = {{Related Pairs Control (RPC): A 3D Position Controller for an Anthropomorphic Arm Using Two-Dimensional Images}},
  booktitle = {Anais do XXVI Congresso Brasileiro de Autom{\'a}tica},
  year = {2026},
  address = {S{\~a}o Paulo},
  publisher = {Even3},
  doi = {10.29327/1989232.26-612}
}`,
    note: "Douglas Bertol lists MobiLab at UDESC Joinville as his affiliation. The paper proposes a controller that positions an anthropomorphic arm in 3D from two-dimensional images.",
  },
  {
    title: "Immune sliding mode control for formation tracking and obstacle avoidance of uncertain wheeled mobile robots",
    authors: "Willy John Nakamura Goto, Douglas Wildgrube Bertol, and Nardênio Almeida Martins",
    year: 2026,
    type: "Journal article",
    venue: "Revista Facultad de Ingeniería Universidad de Antioquia",
    reference: "No. 119, e50882",
    doi: "10.17533/udea.redin.20250882",
    bibtex: String.raw`@article{Goto2026,
  author = {Goto, Willy John Nakamura and Bertol, Douglas Wildgrube and Martins, Nard{\^e}nio Almeida},
  title = {{Immune sliding mode control for formation tracking and obstacle avoidance of uncertain wheeled mobile robots}},
  journal = {Revista Facultad de Ingenier{\'i}a Universidad de Antioquia},
  year = {2026},
  number = {119},
  pages = {e50882},
  doi = {10.17533/udea.redin.20250882}
}`,
    note: "The byline lists UDESC and the State University of Maringá. The paper covers formation tracking and obstacle avoidance for uncertain wheeled mobile robots.",
  },
  {
    title: "DLS2: A distributed microcomponent-based robotic software architecture",
    authors: "Douglas Wildgrube Bertol, Geoff Fink, Marco Marchitto, Ylenia Nisticò, Michele Pestarino, and Claudio Semini",
    year: 2026,
    type: "Journal article",
    venue: "Results in Engineering",
    reference: "32, 112048",
    doi: "10.1016/j.rineng.2026.112048",
    bibtex: String.raw`@article{WildgrubeBertol2026,
  author = {Wildgrube Bertol, Douglas and Fink, Geoff and Marchitto, Marco and Nistic{\`o}, Ylenia and Pestarino, Michele and Semini, Claudio},
  title = {{DLS2: A distributed microcomponent-based robotic software architecture}},
  journal = {Results in Engineering},
  year = {2026},
  volume = {32},
  pages = {112048},
  doi = {10.1016/j.rineng.2026.112048}
}`,
    note: "A robotic software architecture developed with IIT's Dynamic Legged Systems lab, the group MobiLab cooperates with. The byline lists UDESC Joinville and IIT DLS rather than MobiLab.",
  },
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
    title: "Trajectory Tracking for a Differential Drive Dual-Wheeled Robot Using LMI-Based Controllers",
    authors: "Nilton Charlie Sare Vargas, Aureo Guilherme Dobrikopf, Leo Schirmer, and Douglas Wildgrube Bertol",
    year: 2025,
    type: "Conference paper",
    venue: "XVII Simpósio Brasileiro de Automação Inteligente (SBAI 2025) e XI Simpósio Brasileiro de Sistemas Elétricos (SBSE 2025)",
    reference: "São João del-Rei",
    doi: "10.29327/1842969.1-327",
    bibtex: String.raw`@inproceedings{Vargas2025,
  author = {Vargas, Nilton Charlie Sare and Dobrikopf, Aureo Guilherme and Schirmer, Leo and Bertol, Douglas Wildgrube},
  title = {{Trajectory Tracking for a Differential Drive Dual-Wheeled Robot Using LMI-Based Controllers}},
  booktitle = {Anais do XVII Simp{\'o}sio Brasileiro de Automa{\c{c}}{\~a}o Inteligente (SBAI 2025) e XI Simp{\'o}sio Brasileiro de Sistemas El{\'e}tricos (SBSE 2025)},
  year = {2025},
  publisher = {Even3},
  doi = {10.29327/1842969.1-327}
}`,
    note: "The authors are affiliated with UDESC. The paper applies LMI-based controllers to trajectory tracking of a dual-wheeled differential-drive robot.",
  },
  {
    title: "Adaptive immune fuzzy quasi-sliding mode control for leader–follower formation of wheeled mobile robots under uncertainties and disturbances with obstacle avoidance",
    authors: "Willy John Nakamura Goto, Douglas Wildgrube Bertol, and Nardênio Almeida Martins",
    year: 2024,
    type: "Journal article",
    venue: "Engineering Computations",
    reference: "41(7), 1697-1739",
    doi: "10.1108/ec-09-2023-0577",
    bibtex: String.raw`@article{Goto2024EC,
  author = {Goto, Willy John Nakamura and Wildgrube Bertol, Douglas and Martins, Nard{\^e}nio Almeida},
  title = {{Adaptive immune fuzzy quasi-sliding mode control for leader--follower formation of wheeled mobile robots under uncertainties and disturbances with obstacle avoidance}},
  journal = {Engineering Computations},
  year = {2024},
  volume = {41},
  number = {7},
  pages = {1697--1739},
  doi = {10.1108/ec-09-2023-0577}
}`,
    note: "The byline lists UDESC Joinville and the State University of Maringá. The paper addresses leader-follower formation control with obstacle avoidance.",
  },
  {
    title: "Formation and Trajectory Tracking of Mobile Robots with Uncertainties and Disturbances Using an Adaptive Immune Fuzzy Quasi-Sliding Mode Control",
    authors: "Willy John Nakamura Goto, Douglas Wildgrube Bertol, and Nardênio Almeida Martins",
    year: 2024,
    type: "Journal article",
    venue: "Journal of Control, Automation and Electrical Systems",
    reference: "35(3), 440-460",
    doi: "10.1007/s40313-024-01089-7",
    bibtex: String.raw`@article{Goto2024JCAES,
  author = {Goto, Willy John Nakamura and Bertol, Douglas Wildgrube and Martins, Nard{\^e}nio Almeida},
  title = {{Formation and Trajectory Tracking of Mobile Robots with Uncertainties and Disturbances Using an Adaptive Immune Fuzzy Quasi-Sliding Mode Control}},
  journal = {Journal of Control, Automation and Electrical Systems},
  year = {2024},
  volume = {35},
  number = {3},
  pages = {440--460},
  doi = {10.1007/s40313-024-01089-7}
}`,
    note: "The byline lists UDESC Joinville and the State University of Maringá. The paper covers formation and trajectory tracking of mobile robots under uncertainties and disturbances.",
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
