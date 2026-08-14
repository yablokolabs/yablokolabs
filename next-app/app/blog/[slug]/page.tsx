import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import BackToTopButton from "../../components/BackToTopButton";
import SiteFooter from "../../components/SiteFooter";
import SiteNavigation from "../../components/SiteNavigation";
import HermesProviderFallbacks from "../articles/hermes-provider-fallbacks";
import { blogPosts, formatPostDate, getPostBySlug } from "../posts";

const articles: Record<string, ComponentType> = {
  "hermes-provider-fallbacks": HermesProviderFallbacks,
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

  return {
    title: `${post.title} | Yabloko Labs`,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: post.author }],
    alternates: { canonical: url },
    openGraph: {
      title: `${post.title} | Yabloko Labs`,
      description: post.excerpt,
      url,
      siteName: "Yabloko Labs",
      type: "article",
      publishedTime: post.date,
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | Yabloko Labs`,
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
      "@id": `https://yablokolabs.com/blog/${post.slug}`,
    },
    author: {
      "@type": "Organization",
      name: post.author,
      url: "https://yablokolabs.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Yabloko Labs Ltd",
      url: "https://yablokolabs.com",
      logo: {
        "@type": "ImageObject",
        url: "https://yablokolabs.com/assets/images/yablokolabs-logo-symbol.png",
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: "71-75 Shelton Street, Covent Garden",
        addressLocality: "London",
        postalCode: "WC2H 9JQ",
        addressCountry: "GB",
      },
    },
  };

  return (
    <>
      <SiteNavigation subpage />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

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
