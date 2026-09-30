import React from "react";
import Head from "@docusaurus/Head";

const schema = {
  "@context": "https://schema.org",
  "@type": "ResearchOrganization",
  "@id": "https://mobilab.joinville.udesc.br/#organization",
  name: "MobiLab UDESC",
  alternateName: "Laboratório de Sistemas Autônomos e Robótica Móvel",
  description:
    "UDESC Joinville laboratory dedicated to applied research in mobile robotics, autonomous systems, and Physical AI.",
  url: "https://mobilab.joinville.udesc.br/",
  logo: "https://mobilab.joinville.udesc.br/img/mobilab/mobilab-logo-white-high.png",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rua Paulo Malschitzki, 200 - Block I, 2nd floor",
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
