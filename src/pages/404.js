import React from "react";
import Head from "@docusaurus/Head";
import NotFound from "@theme/NotFound";

export default function NotFoundPage() {
  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <NotFound />
    </>
  );
}
