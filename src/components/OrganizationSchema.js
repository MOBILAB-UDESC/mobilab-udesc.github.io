import React from "react";
import Head from "@docusaurus/Head";

const schema = {
  "@context": "https://schema.org",
  "@type": "ResearchOrganization",
  "@id": "https://mobilab.joinville.udesc.br/#organization",
  name: "MobiLab UDESC",
  alternateName: "Laboratório de Sistemas Autônomos e Robótica Móvel",
  description:
    "Laboratório da UDESC Joinville dedicado à pesquisa aplicada em robótica móvel, sistemas autônomos e Physical AI.",
  url: "https://mobilab.joinville.udesc.br/",
  logo: "https://mobilab.joinville.udesc.br/img/mobilab/mobilab-logo-white-high.png",
  address: {
    "@type": "PostalAddress",
    streetAddress: "R. Paulo Malschitzki, 200 - Bloco I, 2º andar",
    addressLocality: "Joinville",
    addressRegion: "SC",
    postalCode: "89219-710",
    addressCountry: "BR",
  },
  parentOrganization: {
    "@type": "CollegeOrUniversity",
    name: "Universidade do Estado de Santa Catarina",
    alternateName: "UDESC",
    url: "https://www.udesc.br",
  },
  sameAs: [
    "https://github.com/MOBILAB-UDESC",
    "https://www.linkedin.com/showcase/mobilab-udesc/",
    "https://www.instagram.com/mobi.udesc/",
  ],
};

export default function OrganizationSchema() {
  return (
    <Head>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Head>
  );
}
