import type { Metadata } from "next";
import Link from "next/link";
import BackToTopButton from "../components/BackToTopButton";
import Breadcrumbs from "../components/Breadcrumbs";
import SiteFooter from "../components/SiteFooter";
import SiteNavigation from "../components/SiteNavigation";
import { blogPosts, formatPostDate } from "./posts";

export const metadata: Metadata = {
  title: "Blog | Yabloko Labs",
  description:
    "Field notes from building and operating production AI Agents — reliability engineering, agent architecture, and the operational detail that only shows up in production.",
  keywords: [
    "AI Agents blog",
    "AI Agent reliability",
    "Hermes Agent",
    "OpenClaw",
    "LLM operations",
    "AI engineering",
  ],
  alternates: {
    canonical: "https://yablokolabs.com/blog",
  },
  openGraph: {
    title: "Blog | Yabloko Labs",
    description:
      "Field notes from building and operating production AI Agents — reliability engineering, agent architecture, and operational detail from real deployments.",
    url: "https://yablokolabs.com/blog",
    siteName: "Yabloko Labs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Yabloko Labs",
    description:
      "Field notes from building and operating production AI Agents, from the team that deploys and runs them.",
  },
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://yablokolabs.com/blog#webpage",
  url: "https://yablokolabs.com/blog",
  name: "Blog | Yabloko Labs",
  description:
    "Field notes from building and operating production AI Agents — reliability engineering, agent architecture, and operational detail from real deployments.",
  inLanguage: "en",
  isPartOf: { "@id": "https://yablokolabs.com/#website" },
  about: { "@id": "https://yablokolabs.com/#organization" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Yabloko Labs Blog",
  description:
    "Field notes from building and operating production AI Agents — reliability engineering, agent architecture, and operational detail from real deployments.",
  url: "https://yablokolabs.com/blog",
  publisher: { "@id": "https://yablokolabs.com/#organization" },
  blogPost: blogPosts.map((post) => ({
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    url: `https://yablokolabs.com/blog/${post.slug}`,
  })),
};

export default function BlogIndexPage() {
  return (
    <>
      <SiteNavigation subpage />
      <Breadcrumbs
        trail={[{ name: "Blog", url: "https://yablokolabs.com/blog" }]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="blog-hero">
        <div className="container">
          <div className="section-header blog-hero-header">
            <span className="section-badge">Blog</span>
            <h1 className="section-title">Notes From Production</h1>
            <p className="section-subtitle">
              What we learn building, deploying, and operating AI Agents for real workloads — written up while the
              detail is still fresh.
            </p>
          </div>
        </div>
      </section>

      <section className="blog-section">
        <div className="container">
          {blogPosts.length === 0
            ? <p className="blog-empty">No posts published yet. Check back shortly.</p>
            : (
              <div className="blog-grid">
                {blogPosts.map((post) => (
                  <article key={post.slug} className="blog-card">
                    <div className="blog-card-meta">
                      <span className="blog-card-category">{post.category}</span>
                      <span className="blog-card-readtime">{post.readTime}</span>
                    </div>
                    <h2 className="blog-card-title">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>
                    <p className="blog-card-subtitle">{post.subtitle}</p>
                    <p className="blog-card-excerpt">{post.excerpt}</p>
                    <div className="blog-card-footer">
                      <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                      <Link href={`/blog/${post.slug}`} className="blog-card-link">
                        Read the guide
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
        </div>
      </section>

      <SiteFooter />
      <BackToTopButton />
    </>
  );
}
