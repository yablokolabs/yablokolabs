import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import BackToTopButton from "../../components/BackToTopButton";
import Breadcrumbs from "../../components/Breadcrumbs";
import SiteFooter from "../../components/SiteFooter";
import SiteNavigation from "../../components/SiteNavigation";
import HermesProviderFallbacks from "../articles/hermes-provider-fallbacks";
import SearxngIndependentDiscovery from "../articles/searxng-independent-discovery";
import { blogPosts, formatPostDate, getPostBySlug } from "../posts";

const articles: Record<string, ComponentType> = {
  "hermes-provider-fallbacks": HermesProviderFallbacks,
  "searxng-independent-discovery": SearxngIndependentDiscovery,
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: "Post Not Found | Yabloko Labs" };
  }

  const url = `https://yablokolabs.com/blog/${post.slug}`;
  /** Skip the brand suffix when the article title alone would push the tag past ~60 chars. */
  const metaTitle = `${post.title} | Yabloko Labs`.length > 65 ? post.title : `${post.title} | Yabloko Labs`;

  return {
    title: metaTitle,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: post.author }],
    alternates: { canonical: url },
    openGraph: {
      title: metaTitle,
      description: post.excerpt,
      url,
      siteName: "Yabloko Labs",
      type: "article",
      publishedTime: post.date,
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const Article = articles[slug];

  if (!post || !Article) {
    notFound();
  }

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `https://yablokolabs.com/blog/${post.slug}#webpage`,
    url: `https://yablokolabs.com/blog/${post.slug}`,
    name: `${post.title} | Yabloko Labs`,
    description: post.excerpt,
    inLanguage: "en",
    isPartOf: { "@id": "https://yablokolabs.com/#website" },
    about: { "@id": "https://yablokolabs.com/#organization" },
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    keywords: post.tags.join(", "),
    articleSection: post.category,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://yablokolabs.com/blog/${post.slug}#webpage`,
    },
    author: { "@id": "https://yablokolabs.com/#organization" },
    publisher: { "@id": "https://yablokolabs.com/#organization" },
  };

  const faqJsonLd = post.faq?.length
    ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: post.faq.map((entry) => ({
        "@type": "Question",
        name: entry.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: entry.answer,
        },
      })),
    }
    : null;

  return (
    <>
      <SiteNavigation subpage />
      <Breadcrumbs
        trail={[
          { name: "Blog", url: "https://yablokolabs.com/blog" },
          { name: post.title, url: `https://yablokolabs.com/blog/${post.slug}` },
        ]}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <article className="blog-article">
        <div className="blog-article-inner">
          <Link href="/blog" className="blog-back-link">
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
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            All posts
          </Link>

          <header className="blog-article-header">
            <span className="section-badge">{post.category}</span>
            <h1 className="blog-article-title">{post.title}</h1>
            <p className="blog-article-subtitle">{post.subtitle}</p>
            <div className="blog-article-meta">
              <span>{post.author}</span>
              <time dateTime={post.date}>{formatPostDate(post.date)}</time>
              <span>{post.readTime}</span>
            </div>
            {post.testedAgainst && (
              <p className="blog-article-tested">
                <span>Tested against</span> {post.testedAgainst}
              </p>
            )}
          </header>

          <div className="blog-prose">
            <Article />
          </div>

          {post.faq && post.faq.length > 0 && (
            <section className="blog-faq" aria-labelledby="blog-faq-heading">
              <h2 id="blog-faq-heading">Frequently Asked Questions</h2>
              {post.faq.map((entry) => (
                <div key={entry.question} className="faq-item">
                  <h3>{entry.question}</h3>
                  <p>{entry.answer}</p>
                </div>
              ))}
            </section>
          )}

          <footer className="blog-article-footer">
            <div className="pill-cloud">
              {post.tags.map((tag) => <span key={tag} className="pill-chip">{tag}</span>)}
            </div>
            <div className="blog-article-cta">
              <h2>Running agents in production?</h2>
              <p>
                Yabloko Labs designs, deploys, and operates custom AI Agents — including the reliability engineering
                that keeps them answering when a provider does not.
              </p>
              <Link href="/ai-agents" className="btn btn-primary">
                Explore AI Agents
              </Link>
            </div>
          </footer>
        </div>
      </article>

      <SiteFooter />
      <BackToTopButton />
    </>
  );
}
