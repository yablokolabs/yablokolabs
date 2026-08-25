import type { Metadata } from "next";

const title = "Gender Equality Plan | Yabloko Labs";
const description =
  "Yabloko Labs' published Gender Equality Plan: our commitments, governance, measures, and monitoring for gender equality and inclusion across the company.";
const url = "https://yablokolabs.com/gender-equality-plan";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: {
    type: "article",
    url,
    siteName: "Yabloko Labs",
    title,
    description,
    images: ["/assets/images/yablokolabs-logo-symbol.png"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/assets/images/yablokolabs-logo-symbol.png"],
  },
};

export default function GenderEqualityPlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": `${url}#webpage`,
            url,
            name: title,
            description,
            inLanguage: "en",
            isPartOf: { "@id": "https://yablokolabs.com/#website" },
            publisher: { "@id": "https://yablokolabs.com/#organization" },
            about: {
              "@type": "Thing",
              name: "Gender Equality Plan",
            },
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://yablokolabs.com/",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Gender Equality Plan",
                  item: url,
                },
              ],
            },
          }),
        }}
      />
      {children}
    </>
  );
}
