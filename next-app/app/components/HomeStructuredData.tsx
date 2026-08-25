export const homeFaqs = [
  {
    question: "What does Yabloko Labs do?",
    answer:
      "Yabloko Labs is a UK-based technology company, founded in 2025, that designs, deploys, and operates custom AI agents and hybrid quantum-AI software for businesses. We build production AI agent systems, publish open-source MCP servers, and develop a portfolio of quantum-AI products: Q-Router, Q-AdMix, Q-Porter, and Q-Consent.",
  },
  {
    question: "Where is Yabloko Labs based?",
    answer:
      "Yabloko Labs Ltd is registered in the United Kingdom at 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ. We work with clients remotely worldwide.",
  },
  {
    question: "What are Yabloko Labs' quantum-AI products?",
    answer:
      "Q-Router optimises delivery routes using quantum-enhanced optimisation and AI traffic prediction. Q-AdMix optimises advertising spend to improve ROAS. Q-Porter optimises port and airport logistics for throughput and delay reduction. Q-Consent manages consent and regulatory compliance for GDPR, HIPAA, and similar regimes.",
  },
  {
    question: "What open-source MCP servers does Yabloko Labs publish?",
    answer:
      "We publish five open-source Model Context Protocol servers: Jnaapakam for persistent long-term agent memory, TruthLens for local trust scoring and hallucination-risk analysis, NexaCore for high-dimensional holographic hypervector computing, AI Consent for automated EU AI Act compliance classification, and CallLens for automated conversation quality assurance.",
  },
  {
    question: "How do I hire Yabloko Labs to build an AI agent?",
    answer:
      "Start on the AI Agents page at https://yablokolabs.com/ai-agents and submit a consultation request, or email support@yablokolabs.com. Engagements begin with a discovery phase that scopes outcomes, integrations, and operational constraints before delivery.",
  },
  {
    question: "What standards does Yabloko Labs engineer against?",
    answer:
      "We engineer against recognised AI governance standards, including AI management systems, AI risk management, AI system life cycle processes, and security and privacy practices such as sandboxed execution, least-privilege access, risk registers, reliability testing, audit trails, and data minimisation.",
  },
];

const products = [
  {
    name: "Q-Router",
    url: "https://router.yablokolabs.com",
    logo: "https://yablokolabs.com/assets/images/logo_q-router.png",
    category: "BusinessApplication",
    description:
      "Quantum-enhanced delivery route optimization with AI traffic prediction to find the fastest, most cost-efficient paths, reducing CPA for logistics and 10-minute delivery apps.",
  },
  {
    name: "Q-AdMix",
    url: "https://admix.yablokolabs.com",
    logo: "https://yablokolabs.com/assets/images/logo_q-admix-logo.png",
    category: "BusinessApplication",
    description:
      "Hybrid quantum-classical AI for ad spend optimization, blending quantum algorithms with AI to boost ROAS through precision targeting, peak efficiency, and measurable growth.",
  },
  {
    name: "Q-Porter",
    url: "https://porter.yablokolabs.com",
    logo: "https://yablokolabs.com/assets/images/logo_q-port-logo.png",
    category: "BusinessApplication",
    description:
      "Hybrid quantum-classical AI for port and airport logistics optimization, blending quantum algorithms with AI to boost throughput, reduce delays, and deliver measurable efficiency gains.",
  },
  {
    name: "Q-Consent",
    url: "https://consent.yablokolabs.com",
    logo: "https://yablokolabs.com/assets/images/logo_q-consent.png",
    category: "BusinessApplication",
    description:
      "Quantum-AI consent and compliance management, blending quantum algorithms with AI to optimize GDPR and HIPAA rules, ensure verifiable permissions, cut regulatory risk, and streamline global data flows.",
  },
];

const mcpServers = [
  {
    name: "Jnaapakam",
    url: "https://mcpize.com/mcp/jnaapakam",
    description: "An open-source Model Context Protocol server providing persistent long-term memory for AI agents.",
  },
  {
    name: "TruthLens",
    url: "https://mcpize.com/mcp/truthlens",
    description:
      "An open-source Model Context Protocol server for local trust scoring and hallucination-risk analysis of LLM outputs.",
  },
  {
    name: "NexaCore",
    url: "https://mcpize.com/mcp/nexa-core",
    description:
      "An open-source Model Context Protocol runtime for high-dimensional holographic hypervector computing.",
  },
  {
    name: "AI Consent",
    url: "https://mcpize.com/mcp/ai-consent",
    description:
      "An open-source Model Context Protocol server for automated EU AI Act compliance classification and remediation planning for AI agents.",
  },
  {
    name: "CallLens",
    url: "https://mcpize.com/mcp/calllens",
    description:
      "An open-source Model Context Protocol server for automated conversation quality assurance using behavioral rubrics and LangGraph-powered evaluation.",
  },
];

const graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://yablokolabs.com/#webpage",
      url: "https://yablokolabs.com/",
      name: "Yabloko Labs - Custom AI Agents & Quantum-AI Software",
      inLanguage: "en",
      isPartOf: { "@id": "https://yablokolabs.com/#website" },
      about: { "@id": "https://yablokolabs.com/#organization" },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: "https://yablokolabs.com/assets/images/yablokolabs-logo-symbol.png",
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
        ],
      },
    },
    {
      "@type": "ItemList",
      "@id": "https://yablokolabs.com/#products",
      name: "Yabloko Labs quantum-AI products",
      itemListOrder: "https://schema.org/ItemListUnordered",
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "SoftwareApplication",
          "@id": `${product.url}#software`,
          name: product.name,
          url: product.url,
          image: product.logo,
          description: product.description,
          applicationCategory: product.category,
          operatingSystem: "Web",
          publisher: { "@id": "https://yablokolabs.com/#organization" },
        },
      })),
    },
    {
      "@type": "ItemList",
      "@id": "https://yablokolabs.com/#mcp-servers",
      name: "Yabloko Labs open-source MCP servers",
      itemListOrder: "https://schema.org/ItemListUnordered",
      numberOfItems: mcpServers.length,
      itemListElement: mcpServers.map((server, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "SoftwareSourceCode",
          "@id": `${server.url}#software`,
          name: server.name,
          url: server.url,
          description: server.description,
          codeRepository: "https://github.com/yablokolabs",
          author: { "@id": "https://yablokolabs.com/#organization" },
        },
      })),
    },
    {
      "@type": "FAQPage",
      "@id": "https://yablokolabs.com/#faq",
      mainEntity: homeFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ],
};

export default function HomeStructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
