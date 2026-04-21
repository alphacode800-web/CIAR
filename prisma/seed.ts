import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function seed() {
  const projects = [
    {
      name: "CloudSync",
      slug: "cloudsync",
      tagline: "Seamless cloud storage for modern teams",
      description: "CloudSync is a next-generation cloud storage platform built for distributed teams. With real-time collaboration, advanced encryption, and AI-powered file organization, it transforms how teams manage and share their digital assets. Featuring end-to-end encryption, smart search across all file types, and seamless integration with 200+ productivity tools.",
      imageUrl: "/projects/cloudsync.svg",
      category: "Infrastructure",
      url: "https://cloudsync.dev",
      technologies: JSON.stringify(["Rust", "React", "PostgreSQL", "AWS S3", "WebRTC", "gRPC"]),
      featured: true,
      views: 12450,
      order: 1,
    },
    {
      name: "DataPulse",
      slug: "datapulse",
      tagline: "Real-time analytics that drive decisions",
      description: "DataPulse provides enterprise-grade real-time analytics with sub-second query performance. Built on a columnar storage engine, it handles billions of events daily while offering beautiful, interactive dashboards. Features include anomaly detection, predictive forecasting, and custom alerting with Slack and PagerDuty integrations.",
      imageUrl: "/projects/datapulse.svg",
      category: "Analytics",
      url: "https://datapulse.io",
      technologies: JSON.stringify(["Go", "ClickHouse", "Apache Kafka", "React", "D3.js", "GraphQL"]),
      featured: true,
      views: 9830,
      order: 2,
    },
    {
      name: "CodeForge",
      slug: "codeforge",
      tagline: "The developer workspace of the future",
      description: "CodeForge is an AI-augmented development environment that lives in the cloud. Pair programming with AI, instant environment provisioning, and collaborative coding sessions make it the ultimate tool for engineering teams. Supports 40+ languages with intelligent code completion, refactoring suggestions, and automated code review.",
      imageUrl: "/projects/codeforge.svg",
      category: "Developer Tools",
      url: "https://codeforge.dev",
      technologies: JSON.stringify(["TypeScript", "WebAssembly", "LSP", "Docker", "Kubernetes", "WebSocket"]),
      featured: true,
      views: 18720,
      order: 3,
    },
    {
      name: "PixelCraft",
      slug: "pixelcraft",
      tagline: "Design at the speed of thought",
      description: "PixelCraft is a browser-based design tool that combines the power of desktop applications with the accessibility of web tools. Featuring a node-based design system, real-time multiplayer editing, and AI-generated design suggestions, it's built for teams that refuse to compromise on creative quality.",
      imageUrl: "/projects/pixelcraft.svg",
      category: "Design",
      url: "https://pixelcraft.app",
      technologies: JSON.stringify(["TypeScript", "Canvas API", "WebGL", "CRDT", "Figma API", "AI/ML"]),
      featured: true,
      views: 15600,
      order: 4,
    },
    {
      name: "StreamWave",
      slug: "streamwave",
      tagline: "Live streaming, reimagined",
      description: "StreamWave is a next-generation live streaming platform with ultra-low latency and cinematic quality. Featuring adaptive bitrate streaming, real-time audience interaction, and built-in monetization tools. Supports 4K HDR streaming with end-to-end encryption and a developer-friendly API for custom integrations.",
      imageUrl: "/projects/streamwave.svg",
      category: "Media",
      url: "https://streamwave.tv",
      technologies: JSON.stringify(["Swift", "Rust", "WebRTC", "FFmpeg", "Redis", "CDN"]),
      featured: false,
      views: 7340,
      order: 5,
    },
    {
      name: "SecureVault",
      slug: "securevault",
      tagline: "Zero-knowledge security infrastructure",
      description: "SecureVault provides enterprise-grade password management and secrets infrastructure with zero-knowledge architecture. Features include team vaults with granular permissions, automated credential rotation, breach detection, and compliance reporting for SOC2, HIPAA, and GDPR requirements.",
      imageUrl: "/projects/securevault.svg",
      category: "Security",
      url: "https://securevault.io",
      technologies: JSON.stringify(["Rust", "Argon2", "XChaCha20", "React Native", "Node.js", "HSM"]),
      featured: false,
      views: 8920,
      order: 6,
    },
    {
      name: "NovaMind",
      slug: "novamind",
      tagline: "AI assistant that truly understands you",
      description: "NovaMind is an advanced AI assistant that learns your work patterns and preferences to provide hyper-personalized assistance. Features include context-aware responses, multi-modal understanding (text, images, voice), workflow automation, and enterprise-grade privacy controls with on-premise deployment options.",
      imageUrl: "/projects/novamind.svg",
      category: "AI",
      url: "https://novamind.ai",
      technologies: JSON.stringify(["Python", "PyTorch", "Transformers", "Next.js", "PostgreSQL", "Redis"]),
      featured: true,
      views: 21300,
      order: 7,
    },
    {
      name: "TaskFlow",
      slug: "taskflow",
      tagline: "Project management, beautifully simplified",
      description: "TaskFlow redefines project management with its intuitive interface and powerful automation engine. Features include AI-powered task estimation, automated sprint planning, time tracking with intelligent insights, and seamless integrations with GitHub, Jira, and Slack. Built for teams from 2 to 2000.",
      imageUrl: "/projects/taskflow.svg",
      category: "Productivity",
      url: "https://taskflow.app",
      technologies: JSON.stringify(["Next.js", "TypeScript", "Prisma", "tRPC", "Tailwind CSS", "Playwright"]),
      featured: false,
      views: 6540,
      order: 8,
    },
    {
      name: "FormBuilder",
      slug: "formbuilder",
      tagline: "Build forms that convert, not frustrate",
      description: "FormBuilder is a drag-and-drop form builder with advanced conditional logic, payment integration, and real-time analytics. Features include A/B testing for form layouts, smart field validation, file uploads with virus scanning, and webhook integrations with 500+ services. Used by 50,000+ businesses worldwide.",
      imageUrl: "/projects/formbuilder.svg",
      category: "Developer Tools",
      url: "https://formbuilder.dev",
      technologies: JSON.stringify(["React", "TypeScript", "Serverless", "Stripe", "AWS Lambda", "DynamoDB"]),
      featured: false,
      views: 5120,
      order: 9,
    },
  ]

  for (const project of projects) {
    await db.project.upsert({
      where: { slug: project.slug },
      update: project,
      create: project,
    })
  }

  console.log(`✅ Seeded ${projects.length} projects`)
}

seed()
  .catch(console.error)
  .finally(() => db.$disconnect())
