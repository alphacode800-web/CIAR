import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const locales = ['en', 'ar', 'fr', 'es', 'de'] as const

const projects = [
  { slug: 'cloudsync', category: 'Infrastructure', imageUrl: '/projects/cloudsync.svg', url: 'https://cloudsync.dev', tags: '["Rust","React","PostgreSQL","AWS S3","WebRTC","gRPC"]', featured: true, order: 1, views: 12450 },
  { slug: 'datapulse', category: 'Analytics', imageUrl: '/projects/datapulse.svg', url: 'https://datapulse.io', tags: '["Go","ClickHouse","Apache Kafka","React","D3.js","GraphQL"]', featured: true, order: 2, views: 9830 },
  { slug: 'codeforge', category: 'Developer Tools', imageUrl: '/projects/codeforge.svg', url: 'https://codeforge.dev', tags: '["TypeScript","WebAssembly","LSP","Docker","Kubernetes","WebSocket"]', featured: true, order: 3, views: 18720 },
  { slug: 'pixelcraft', category: 'Design', imageUrl: '/projects/pixelcraft.svg', url: 'https://pixelcraft.app', tags: '["TypeScript","Canvas API","WebGL","CRDT","Figma API","AI/ML"]', featured: true, order: 4, views: 15600 },
  { slug: 'streamwave', category: 'Media', imageUrl: '/projects/streamwave.svg', url: 'https://streamwave.tv', tags: '["Swift","Rust","WebRTC","FFmpeg","Redis","CDN"]', featured: false, order: 5, views: 7340 },
  { slug: 'securevault', category: 'Security', imageUrl: '/projects/securevault.svg', url: 'https://securevault.io', tags: '["Rust","Argon2","XChaCha20","React Native","Node.js","HSM"]', featured: false, order: 6, views: 8920 },
  { slug: 'novamind', category: 'AI', imageUrl: '/projects/novamind.svg', url: 'https://novamind.ai', tags: '["Python","PyTorch","Transformers","Next.js","PostgreSQL","Redis"]', featured: true, order: 7, views: 21300 },
  { slug: 'taskflow', category: 'Productivity', imageUrl: '/projects/taskflow.svg', tags: '["Next.js","TypeScript","Prisma","tRPC","Tailwind CSS","Playwright"]', featured: false, order: 8, views: 6540 },
  { slug: 'formbuilder', category: 'Developer Tools', imageUrl: '/projects/formbuilder.svg', url: 'https://formbuilder.dev', tags: '["React","TypeScript","Serverless","Stripe","AWS Lambda","DynamoDB"]', featured: false, order: 9, views: 5120 },
]

const projectTranslations: Record<string, Record<string, { name: string; tagline: string; description: string }>> = {
  cloudsync: {
    en: { name: 'CloudSync', tagline: 'Seamless cloud storage for modern teams', description: 'CloudSync is a next-generation cloud storage platform built for distributed teams. With real-time collaboration, advanced encryption, and AI-powered file organization, it transforms how teams manage and share their digital assets.' },
    ar: { name: 'كلاود سينك', tagline: 'تخزين سحابي سلس للفرق العصرية', description: 'كلاود سينك هي منصة تخزين سحابي من الجيل التالي مصممة للفرق الموزعة. مع التعاون في الوقت الفعلي والتشفير المتقدم وتنظيم الملفات بالذكاء الاصطناعي.' },
    fr: { name: 'CloudSync', tagline: 'Stockage cloud fluide pour les équipes modernes', description: 'CloudSync est une plateforme de stockage cloud nouvelle génération conçue pour les équipes distribuées. Avec la collaboration en temps réel et le chiffrement avancé.' },
    es: { name: 'CloudSync', tagline: 'Almacenamiento en la nube fluido para equipos modernos', description: 'CloudSync es una plataforma de almacenamiento en la nube de nueva generación diseñada para equipos distribuidos. Con colaboración en tiempo real y cifrado avanzado.' },
    de: { name: 'CloudSync', tagline: 'Nahtloses Cloud-Speichern für moderne Teams', description: 'CloudSync ist eine Cloud-Speicherplattform der nächsten Generation für verteilte Teams. Mit Echtzeit-Zusammenarbeit und fortschrittlicher Verschlüsselung.' },
  },
  datapulse: {
    en: { name: 'DataPulse', tagline: 'Real-time analytics that drive decisions', description: 'DataPulse provides enterprise-grade real-time analytics with sub-second query performance. Features include anomaly detection, predictive forecasting, and custom alerting with Slack and PagerDuty integrations.' },
    ar: { name: 'داتا بولس', tagline: 'تحليلات فورية تقود القرارات', description: 'داتا بولس توفر تحليلات فورية بمستوى المؤسسات مع أداء استعلام في أقل من ثانية. تشمل اكتشاف الحالات الشاذة والتنبؤ المسبق.' },
    fr: { name: 'DataPulse', tagline: 'Analyses en temps réel qui guident les décisions', description: 'DataPulse fournit des analyses en temps réel de niveau entreprise avec des performances de requête inférieures à la seconde.' },
    es: { name: 'DataPulse', tagline: 'Analíticas en tiempo real que impulsan decisiones', description: 'DataPulse proporciona analíticas en tiempo real de nivel empresarial con rendimiento de consultas en menos de un segundo.' },
    de: { name: 'DataPulse', tagline: 'Echtzeit-Analytik, die Entscheidungen lenkt', description: 'DataPulse bietet Enterprise-Echtzeit-Analytik mit Abfrageleistungen unter einer Sekunde.' },
  },
  codeforge: {
    en: { name: 'CodeForge', tagline: 'The developer workspace of the future', description: 'CodeForge is an AI-augmented development environment that lives in the cloud. Pair programming with AI, instant environment provisioning, and collaborative coding sessions make it the ultimate tool for engineering teams.' },
    ar: { name: 'كود فورج', tagline: 'بيئة تطوير المطورين للمستقبل', description: 'كود فورج هي بيئة تطوير معززة بالذكاء الاصطناعي تعمل في السحابة. البرمجة الزوجية مع الذكاء الاصطناعي وتوفير البيئة الفوري.' },
    fr: { name: 'CodeForge', tagline: "L'espace de travail développeur du futur", description: "CodeForge est un environnement de développement augmenté par l'IA dans le cloud. Programmation en binôme avec l'IA et provisionnement instantané." },
    es: { name: 'CodeForge', tagline: 'El espacio de trabajo del desarrollador del futuro', description: 'CodeForge es un entorno de desarrollo aumentado por IA en la nube. Programación en pareja con IA y aprovisionamiento instantáneo.' },
    de: { name: 'CodeForge', tagline: 'Der Entwicklungsarbeitsplatz der Zukunft', description: 'CodeForge ist eine KI-gestützte Entwicklungsumgebung in der Cloud. Pair-Programming mit KI und sofortige Bereitstellung.' },
  },
  pixelcraft: {
    en: { name: 'PixelCraft', tagline: 'Design at the speed of thought', description: 'PixelCraft is a browser-based design tool combining desktop application power with web accessibility. Features a node-based design system, real-time multiplayer editing, and AI-generated design suggestions.' },
    ar: { name: 'بيكسل كرافت', tagline: 'التصميم بسرعة الفكر', description: 'بيكسل كرافت هي أداة تصميم مبنية على المتصفح تجمع بين قوة تطبيقات سطح المكتب وسهولة الوصول عبر الويب.' },
    fr: { name: 'PixelCraft', tagline: 'Le design à la vitesse de la pensée', description: 'PixelCraft est un outil de design basé sur navigateur combinant la puissance des applications de bureau avec l\'accessibilité web.' },
    es: { name: 'PixelCraft', tagline: 'Diseño a la velocidad del pensamiento', description: 'PixelCraft es una herramienta de diseño basada en navegador que combina la potencia de las aplicaciones de escritorio.' },
    de: { name: 'PixelCraft', tagline: 'Design in Gedankengeschwindigkeit', description: 'PixelCraft ist ein browserbasiertes Design-Tool, das Desktop-Anwendungskraft mit Web-Zugänglichkeit kombiniert.' },
  },
  streamwave: {
    en: { name: 'StreamWave', tagline: 'Live streaming, reimagined', description: 'StreamWave is a next-generation live streaming platform with ultra-low latency and cinematic quality. Supports 4K HDR streaming with end-to-end encryption and a developer-friendly API.' },
    ar: { name: 'ستريم ويف', tagline: 'البث المباشر بإعادة تخيل', description: 'ستريم ويف هي منصة بث مباشر من الجيل التالي مع زمن استجابة منخفض جداً وجودة سينمائية.' },
    fr: { name: 'StreamWave', tagline: 'Le streaming en direct, réinventé', description: 'StreamWave est une plateforme de streaming en direct nouvelle génération avec une latence ultra-faible et une qualité cinématographique.' },
    es: { name: 'StreamWave', tagline: 'Streaming en vivo, reimaginado', description: 'StreamWave es una plataforma de streaming en vivo de nueva generación con latencia ultra baja y calidad cinematográfica.' },
    de: { name: 'StreamWave', tagline: 'Live-Streaming, neu gedacht', description: 'StreamWave ist eine Live-Streaming-Plattform der nächsten Generation mit ultra-niedriger Latenz und kinoreifer Qualität.' },
  },
  securevault: {
    en: { name: 'SecureVault', tagline: 'Zero-knowledge security infrastructure', description: 'SecureVault provides enterprise-grade password management and secrets infrastructure with zero-knowledge architecture. Features team vaults with granular permissions and automated credential rotation.' },
    ar: { name: 'سيكيور فولت', tagline: 'بنية أمنية بدون معرفة', description: 'سيكيور فولت توفر إدارة كلمات المرور بمستوى المؤسسات مع بنية بدون معرفة. تشمل خزائن الفريق مع صلاحيات دقيقة.' },
    fr: { name: 'SecureVault', tagline: 'Infrastructure de sécurité à connaissance zéro', description: 'SecureVault fournit une gestion de mots de passe de niveau entreprise avec une architecture à connaissance zéro.' },
    es: { name: 'SecureVault', tagline: 'Infraestructura de seguridad de conocimiento cero', description: 'SecureVault proporciona gestión de contraseñas a nivel empresarial con arquitectura de conocimiento cero.' },
    de: { name: 'SecureVault', tagline: 'Zero-Knowledge-Sicherheitsinfrastruktur', description: 'SecureVault bietet Enterprise-Passwortverwaltung mit Zero-Knowledge-Architektur und automatischer Anmeldeinformation-Rotation.' },
  },
  novamind: {
    en: { name: 'NovaMind', tagline: 'AI assistant that truly understands you', description: 'NovaMind is an advanced AI assistant that learns your work patterns to provide hyper-personalized assistance. Features include context-aware responses, multi-modal understanding, and workflow automation.' },
    ar: { name: 'نوفا مايند', tagline: 'مساعد ذكاء اصطناعي يفهمك حقاً', description: 'نوفا مايند هو مساعد ذكاء اصطناعي متقدم يتعلم أنماط عملك لتقديم مساعدة مخصصة للغاية. يشمل استجابات واعية بالسياق.' },
    fr: { name: 'NovaMind', tagline: "L'assistant IA qui vous comprend vraiment", description: 'NovaMind est un assistant IA avancé qui apprend vos habitudes de travail pour fournir une assistance hyper-personnalisée.' },
    es: { name: 'NovaMind', tagline: 'El asistente de IA que realmente te entiende', description: 'NovaMind es un asistente de IA avanzado que aprende tus patrones de trabajo para proporcionar asistencia hiperpersonalizada.' },
    de: { name: 'NovaMind', tagline: 'KI-Assistent, der Sie wirklich versteht', description: 'NovaMind ist ein fortschrittlicher KI-Assistent, der Ihre Arbeitsmuster lernt und hyper-personalisierte Unterstützung bietet.' },
  },
  taskflow: {
    en: { name: 'TaskFlow', tagline: 'Project management, beautifully simplified', description: 'TaskFlow redefines project management with its intuitive interface and powerful automation engine. Features include AI-powered task estimation, automated sprint planning, and seamless integrations with GitHub and Slack.' },
    ar: { name: 'تاسك فلو', tagline: 'إدارة المشاريع بتبسيط جميل', description: 'تاسك فلو تعيد تعريف إدارة المشاريع بواجهتها البديهية ومحرك الأتمتة القوي. تشمل تقدير المهام بالذكاء الاصطناعي.' },
    fr: { name: 'TaskFlow', tagline: 'Gestion de projet, élégamment simplifiée', description: 'TaskFlow redéfinit la gestion de projet avec une interface intuitive et un moteur d\'automatisation puissant.' },
    es: { name: 'TaskFlow', tagline: 'Gestión de proyectos, hermosamente simplificada', description: 'TaskFlow redefine la gestión de proyectos con su interfaz intuitiva y su potente motor de automatización.' },
    de: { name: 'TaskFlow', tagline: 'Projektmanagement, elegant vereinfacht', description: 'TaskFlow definiert Projektmanagement mit seiner intuitiven Oberfläche und der leistungsstarken Automatisierungs-Engine neu.' },
  },
  formbuilder: {
    en: { name: 'FormBuilder', tagline: 'Build forms that convert, not frustrate', description: 'FormBuilder is a drag-and-drop form builder with advanced conditional logic, payment integration, and real-time analytics. Used by 50,000+ businesses worldwide with 500+ webhook integrations.' },
    ar: { name: 'فورم بيلدر', tagline: 'ابنِ نماذج تحوّل، لا تُحبط', description: 'فورم بيلدر هي أداة بناء نماذج بالسحب والإفلات مع منطق مشروط متقدم وتكامل الدفع والتحليلات الفورية.' },
    fr: { name: 'FormBuilder', tagline: 'Créez des formulaires qui convertissent', description: 'FormBuilder est un constructeur de formulaires glisser-déposer avec une logique conditionnelle avancée et l\'intégration de paiements.' },
    es: { name: 'FormBuilder', tagline: 'Crea formularios que convierten, no frustran', description: 'FormBuilder es un constructor de formularios de arrastrar y soltar con lógica condicional avanzada e integración de pagos.' },
    de: { name: 'FormBuilder', tagline: 'Formulare bauen, die konvertieren', description: 'FormBuilder ist ein Drag-and-Drop-Formular-Builder mit erweiterter bedingter Logik und Zahlungsintegration.' },
  },
}

const translations: Record<string, Record<string, string>> = {
  'nav.home': { en: 'Home', ar: 'الرئيسية', fr: 'Accueil', es: 'Inicio', de: 'Startseite' },
  'nav.projects': { en: 'Projects', ar: 'المشاريع', fr: 'Projets', es: 'Proyectos', de: 'Projekte' },
  'nav.about': { en: 'About', ar: 'عن الشركة', fr: 'À propos', es: 'Acerca de', de: 'Über uns' },
  'nav.contact': { en: 'Contact', ar: 'تواصل', fr: 'Contact', es: 'Contacto', de: 'Kontakt' },
  'nav.admin': { en: 'Admin', ar: 'الإدارة', fr: 'Admin', es: 'Admin', de: 'Admin' },
  'hero.badge': { en: '🚀 Building the future', ar: '🚀 نبني المستقبل', fr: '🚀 Construire l\'avenir', es: '🚀 Construyendo el futuro', de: '🚀 Die Zukunft gestalten' },
  'hero.title_1': { en: 'We build digital', ar: 'نبني منتجات', fr: 'Nous créons des produits', es: 'Construimos productos', de: 'Wir bauen digitale' },
  'hero.title_2': { en: 'products that matter', ar: 'رقمية تهم', fr: 'numériques qui comptent', es: 'digitales que importan', de: 'Produkte, die zählen' },
  'hero.subtitle': { en: 'NexusLabs creates world-class tools for developers, designers, and teams. From cloud infrastructure to AI assistants — we ship products that push technology forward.', ar: 'نكسوس لابس تصنع أدوات عالمية المستوى للمطورين والمصممين والفرق. من البنية التحتية السحابية إلى مساعدي الذكاء الاصطناعي.', fr: 'NexusLabs crée des outils de classe mondiale pour les développeurs, designers et équipes. De l\'infrastructure cloud aux assistants IA.', es: 'NexusLabs crea herramientas de clase mundial para desarrolladores, diseñadores y equipos. Desde infraestructura en la nube hasta asistentes de IA.', de: 'NexusLabs erstellt erstklassige Tools für Entwickler, Designer und Teams. Von Cloud-Infrastruktur bis KI-Assistenten.' },
  'hero.cta': { en: 'Explore Projects', ar: 'استكشف المشاريع', fr: 'Explorer les projets', es: 'Explorar proyectos', de: 'Projekte entdecken' },
  'hero.cta2': { en: 'Learn More', ar: 'اعرف المزيد', fr: 'En savoir plus', es: 'Saber más', de: 'Mehr erfahren' },
  'hero.stat_products': { en: 'Products', ar: 'منتجات', fr: 'Produits', es: 'Productos', de: 'Produkte' },
  'hero.stat_views': { en: 'Total Views', ar: 'إجمالي المشاهدات', fr: 'Vues totales', es: 'Vistas totales', de: 'Gesamtansichten' },
  'hero.stat_categories': { en: 'Categories', ar: 'فئات', fr: 'Catégories', es: 'Categorías', de: 'Kategorien' },
  'projects.title': { en: 'All Projects', ar: 'جميع المشاريع', fr: 'Tous les projets', es: 'Todos los proyectos', de: 'Alle Projekte' },
  'projects.subtitle': { en: 'Explore our complete portfolio of digital products and tools.', ar: 'استكشف محفظتنا الكاملة من المنتجات والأدوات الرقمية.', fr: 'Explorez notre portefeuille complet de produits et outils numériques.', es: 'Explora nuestro portafolio completo de productos y herramientas digitales.', de: 'Entdecken Sie unser vollständiges Portfolio an digitalen Produkten und Tools.' },
  'projects.featured': { en: 'Featured', ar: 'مميز', fr: 'En vedette', es: 'Destacados', de: 'Empfohlen' },
  'projects.featured_title': { en: 'Spotlight Projects', ar: 'مشاريع مميزة', fr: 'Projets phares', es: 'Proyectos destacados', de: 'Spotlight-Projekte' },
  'projects.featured_subtitle': { en: 'Our most impactful products driving innovation across industries.', ar: 'منتجاتنا الأكثر تأثيراً التي تقود الابتكار عبر الصناعات.', fr: 'Nos produits les plus impactants qui stimulent l\'innovation.', es: 'Nuestros productos más impactantes que impulsan la innovación.', de: 'Unsere wirkungsvollsten Produkte, die Innovation vorantreiben.' },
  'projects.search_placeholder': { en: 'Search projects...', ar: 'ابحث عن مشاريع...', fr: 'Rechercher des projets...', es: 'Buscar proyectos...', de: 'Projekte suchen...' },
  'projects.all': { en: 'All', ar: 'الكل', fr: 'Tous', es: 'Todos', de: 'Alle' },
  'projects.no_results': { en: 'No projects found', ar: 'لم يتم العثور على مشاريع', fr: 'Aucun projet trouvé', es: 'No se encontraron proyectos', de: 'Keine Projekte gefunden' },
  'projects.visit': { en: 'Visit', ar: 'زيارة', fr: 'Visiter', es: 'Visitar', de: 'Besuchen' },
  'projects.views': { en: 'views', ar: 'مشاهدة', fr: 'vues', es: 'vistas', de: 'Aufrufe' },
  'projects.view_details': { en: 'View Details', ar: 'عرض التفاصيل', fr: 'Voir les détails', es: 'Ver detalles', de: 'Details ansehen' },
  'projects.project_count': { en: '{count} projects', ar: '{count} مشاريع', fr: '{count} projets', es: '{count} proyectos', de: '{count} Projekte' },
  'projects.project_count_single': { en: '1 project', ar: 'مشروع واحد', fr: '1 projet', es: '1 proyecto', de: '1 Projekt' },
  'projects.refresh': { en: 'Refresh', ar: 'تحديث', fr: 'Actualiser', es: 'Actualizar', de: 'Aktualisieren' },
  'project.details': { en: 'Project Details', ar: 'تفاصيل المشروع', fr: 'Détails du projet', es: 'Detalles del proyecto', de: 'Projektdetails' },
  'project.about': { en: 'About', ar: 'حول المشروع', fr: 'À propos', es: 'Acerca de', de: 'Über' },
  'project.no_description': { en: 'No description available', ar: 'لا يوجد وصف متاح', fr: 'Aucune description disponible', es: 'No hay descripción disponible', de: 'Keine Beschreibung verfügbar' },
  'project.technologies': { en: 'Technologies', ar: 'التقنيات', fr: 'Technologies', es: 'Tecnologías', de: 'Technologien' },
  'project.visit_website': { en: 'Visit Website', ar: 'زيارة الموقع', fr: 'Visiter le site', es: 'Visitar sitio web', de: 'Website besuchen' },
  'project.back': { en: 'Back to Projects', ar: 'العودة للمشاريع', fr: 'Retour aux projets', es: 'Volver a proyectos', de: 'Zurück zu Projekten' },
  'project.featured': { en: 'Featured', ar: 'مميز', fr: 'En vedette', es: 'Destacado', de: 'Empfohlen' },
  'about.badge': { en: 'About NexusLabs', ar: 'عن نكسوس لابس', fr: 'À propos de NexusLabs', es: 'Acerca de NexusLabs', de: 'Über NexusLabs' },
  'about.title_1': { en: "We're building the", ar: 'نبني', fr: 'Nous construisons le', es: 'Construimos el', de: 'Wir gestalten die' },
  'about.title_2': { en: 'future of tech', ar: 'مستقبل التقنية', fr: 'futur de la tech', es: 'futuro de la tecnología', de: 'Zukunft der Technik' },
  'about.subtitle': { en: 'NexusLabs was founded with a singular mission: create digital products that empower teams and individuals to do their best work.', ar: 'تأسست نكسوس لابس بمهمة واحدة: إنشاء منتجات رقمية تمكّن الفرق والأفراد من أداء أفضل عملهم.', fr: 'NexusLabs a été fondée avec une mission : créer des produits numériques qui permettent aux équipes de donner le meilleur d\'eux-mêmes.', es: 'NexusLabs fue fundada con una misión: crear productos digitales que empoderen a equipos e individuos.', de: 'NexusLabs wurde mit einer Mission gegründet: Digitale Produkte schaffen, die Teams befähigen.' },
  'about.mission_title': { en: 'Our Mission', ar: 'مهمتنا', fr: 'Notre mission', es: 'Nuestra misión', de: 'Unsere Mission' },
  'about.mission_text': { en: 'To democratize access to powerful technology. We believe that world-class tools should be available to everyone — from solo developers to enterprise teams.', ar: 'ت democratize الوصول للتقنية القوية. نؤمن أن الأدوات عالمية المستوى يجب أن تكون متاحة للجميع.', fr: 'Démocratiser l\'accès à la technologie puissante. Nous croyons que les outils de classe mondiale doivent être accessibles à tous.', es: 'Democratizar el acceso a tecnología poderosa. Creemos que herramientas de clase mundial deben estar disponibles para todos.', de: 'Den Zugang zu leistungsstarker Technologie demokratisieren. Weltklasse-Tools für alle zugänglich machen.' },
  'about.vision_title': { en: 'Our Vision', ar: 'رؤيتنا', fr: 'Notre vision', es: 'Nuestra visión', de: 'Unsere Vision' },
  'about.vision_text': { en: 'A world where technology seamlessly enhances human potential. We envision a future where our products form the invisible infrastructure behind millions of successful projects.', ar: 'عالم حيث تعزز التقنية إمكانات الإنسان بسلاسة. نتصور مستقبلاً حيث تشكل منتجاتنا البنية التحتية غير المرئية.', fr: 'Un monde où la technologie améliore naturellement le potentiel humain. Nous envisageons un avenir où nos produits forment l\'infrastructure invisible.', es: 'Un mundo donde la tecnología mejora perfectamente el potencial humano. Visualizamos un futuro donde nuestros productos formen la infraestructura invisible.', de: 'Eine Welt, in der Technologie das menschliche Potenzial nahtlos verstärkt. Unsere Produkte als unsichtbare Infrastruktur.' },
  'about.values_title': { en: 'Our Values', ar: 'قيمنا', fr: 'Nos valeurs', es: 'Nuestros valores', de: 'Unsere Werte' },
  'about.value_innovation': { en: 'Innovation First', ar: 'الابتكار أولاً', fr: 'Innovation d\'abord', es: 'Innovación primero', de: 'Innovation zuerst' },
  'about.value_innovation_desc': { en: 'We push boundaries with every product. Innovation isn\'t a department — it\'s our DNA.', ar: 'نتجاوز الحدود مع كل منتج. الابتكار ليس قسماً — إنه حمضنا النووي.', fr: 'Nous repoussons les limites avec chaque produit. L\'innovation n\'est pas un département — c\'est notre ADN.', es: 'Impulsamos los límites con cada producto. La innovación no es un departamento — es nuestro ADN.', de: 'Wir verschieben Grenzen mit jedem Produkt. Innovation ist keine Abteilung — sie ist unsere DNA.' },
  'about.value_users': { en: 'User Obsessed', ar: 'مهتمون بالمستخدم', fr: 'Obsédés par l\'utilisateur', es: 'Obsesionados por el usuario', de: 'Nutzerfokus' },
  'about.value_users_desc': { en: 'Every pixel, every interaction is designed with the end user in mind. We build what people love.', ar: 'كل بكسل وكل تفاعل مصمم مع وضع المستخدم النهائي في الاعتبار.', fr: 'Chaque pixel, chaque interaction est conçu avec l\'utilisateur final en tête. Nous construisons ce que les gens aiment.', es: 'Cada píxel, cada interacción está diseñado pensando en el usuario final. Construimos lo que la gente ama.', de: 'Jeder Pixel, jede Interaktion ist mit dem Endnutzer im Sinn gestaltet. Wir bauen, was Menschen lieben.' },
  'about.value_security': { en: 'Trust & Security', ar: 'الثقة والأمان', fr: 'Confiance et sécurité', es: 'Confianza y seguridad', de: 'Vertrauen & Sicherheit' },
  'about.value_security_desc': { en: 'Security is embedded in our architecture, not bolted on. Your data is sacred.', ar: 'الأمان مدمج في بنيتنا، وليس مضافاً. بياناتك مقدسة.', fr: 'La sécurité est intégrée dans notre architecture, pas ajoutée. Vos données sont sacrées.', es: 'La seguridad está integrada en nuestra arquitectura, no añadida. Tus datos son sagrados.', de: 'Sicherheit ist in unsere Architektur eingebettet, nicht aufgeschraubt. Ihre Daten sind heilig.' },
  'about.value_speed': { en: 'Ship Fast, Ship Often', ar: 'أطلق بسرعة، أطلق كثيراً', fr: 'Livrer vite, livrer souvent', es: 'Lanzar rápido, lanzar a menudo', de: 'Schnell ausliefern, oft ausliefern' },
  'about.value_speed_desc': { en: 'We believe in rapid iteration. Small releases, quick feedback loops, continuous improvement.', ar: 'نؤمن بالتكرار السريع. إصدارات صغيرة وحلقات تغذية راجعة سريعة وتحسين مستمر.', fr: 'Nous croyons en l\'itération rapide. Petites versions, boucles de feedback rapides.', es: 'Creemos en la iteración rápida. Lanzamientos pequeños, ciclos de retroalimentación rápidos.', de: 'Wir glauben an schnelle Iterationen. Kleine Releases, schnelle Feedback-Schleifen.' },
  'about.value_team': { en: 'Team Excellence', ar: 'تميز الفريق', fr: 'Excellence d\'équipe', es: 'Excelencia de equipo', de: 'Team-Exzellenz' },
  'about.value_team_desc': { en: 'We hire the best and invest in their growth. Great products come from great teams.', ar: 'نوظف الأفضل ونستثمر في نموهم. المنتجات العظيمة تأتي من فرق عظيمة.', fr: 'Nous recrutons les meilleurs et investissons dans leur croissance. Les grands produits viennent des grandes équipes.', es: 'Contratamos a los mejores e invertimos en su crecimiento. Los grandes productos vienen de grandes equipos.', de: 'Wir stellen die Besten ein und investieren in ihr Wachstum. Große Produkte kommen von großen Teams.' },
  'about.value_global': { en: 'Global Impact', ar: 'تأثير عالمي', fr: 'Impact mondial', es: 'Impacto global', de: 'Globale Wirkung' },
  'about.value_global_desc': { en: 'Our tools serve millions of users worldwide. We build for scale from day one.', ar: 'أدواتنا تخدم ملايين المستخدمين حول العالم. نبني للتوسع من اليوم الأول.', fr: 'Nos outils servent des millions d\'utilisateurs dans le monde. Nous construisons pour l\'échelle dès le premier jour.', es: 'Nuestras herramientas sirven a millones de usuarios en todo el mundo. Construimos para escalar desde el día uno.', de: 'Unsere Tools bedienen Millionen von Nutzern weltweit. Wir bauen von Tag 1 für Skalierbarkeit.' },
  'about.stat_products': { en: 'Products', ar: 'منتجات', fr: 'Produits', es: 'Productos', de: 'Produkte' },
  'about.stat_users': { en: 'Users', ar: 'مستخدمون', fr: 'Utilisateurs', es: 'Usuarios', de: 'Nutzer' },
  'about.stat_uptime': { en: 'Uptime', ar: 'وقت التشغيل', fr: 'Disponibilité', es: 'Disponibilidad', de: 'Verfügbarkeit' },
  'about.stat_support': { en: 'Support', ar: 'الدعم', fr: 'Support', es: 'Soporte', de: 'Support' },
  'about.stat_products_value': { en: '9+', ar: '9+', fr: '9+', es: '9+', de: '9+' },
  'about.stat_users_value': { en: '500K+', ar: '+500 ألف', fr: '500K+', es: '500K+', de: '500K+' },
  'about.stat_uptime_value': { en: '99.9%', ar: '99.9%', fr: '99.9%', es: '99.9%', de: '99.9%' },
  'about.stat_support_value': { en: '24/7', ar: '24/7', fr: '24/7', es: '24/7', de: '24/7' },
  'contact.badge': { en: 'Get in Touch', ar: 'تواصل معنا', fr: 'Contactez-nous', es: 'Contáctenos', de: 'Kontaktieren Sie uns' },
  'contact.title_1': { en: "Let's", ar: 'دعنا', fr: 'Travaillons', es: 'Trabajemos', de: 'Lassen Sie uns' },
  'contact.title_2': { en: 'work together', ar: 'نتعاون معاً', fr: 'ensemble', es: 'juntos', de: 'zusammenarbeiten' },
  'contact.subtitle': { en: 'Have a question, partnership idea, or just want to say hello? We\'d love to hear from you.', ar: 'لديك سؤال أو فكرة شراكة أو تريد فقط أن تقول مرحباً؟ يسعدنا أن نسمع منك.', fr: 'Vous avez une question, une idée de partenariat, ou voulez simplement dire bonjour ? Nous serions ravis de vous entendre.', es: '¿Tiene una pregunta, idea de asociación, o solo quiere saludar? Nos encantaría saber de usted.', de: 'Haben Sie eine Frage, Partnerschaftsidee oder möchten einfach Hallo sagen? Wir freuen uns von Ihnen zu hören.' },
  'contact.info_title': { en: 'Contact Info', ar: 'معلومات الاتصال', fr: 'Informations de contact', es: 'Info de contacto', de: 'Kontaktinfo' },
  'contact.email_label': { en: 'Email', ar: 'البريد الإلكتروني', fr: 'Email', es: 'Correo', de: 'E-Mail' },
  'contact.email': { en: 'hello@nexuslabs.dev', ar: 'hello@nexuslabs.dev', fr: 'hello@nexuslabs.dev', es: 'hello@nexuslabs.dev', de: 'hello@nexuslabs.dev' },
  'contact.office_label': { en: 'Office', ar: 'المكتب', fr: 'Bureau', es: 'Oficina', de: 'Büro' },
  'contact.office': { en: 'San Francisco, CA', ar: 'سان فرانسيسكو، كاليفورنيا', fr: 'San Francisco, CA', es: 'San Francisco, CA', de: 'San Francisco, CA' },
  'contact.response_title': { en: 'Quick Response', ar: 'رد سريع', fr: 'Réponse rapide', es: 'Respuesta rápida', de: 'Schnelle Antwort' },
  'contact.response_text': { en: 'We typically respond within 24 hours on business days.', ar: 'نرد عادة خلال 24 ساعة في أيام العمل.', fr: 'Nous répondons généralement sous 24 heures les jours ouvrables.', es: 'Normalmente respondemos en 24 horas los días laborables.', de: 'Wir antworten in der Regel innerhalb von 24 Stunden an Werktagen.' },
  'contact.name_label': { en: 'Name', ar: 'الاسم', fr: 'Nom', es: 'Nombre', de: 'Name' },
  'contact.name_placeholder': { en: 'John Doe', ar: 'محمد أحمد', fr: 'Jean Dupont', es: 'Juan Pérez', de: 'Max Mustermann' },
  'contact.email_label2': { en: 'Email', ar: 'البريد الإلكتروني', fr: 'Email', es: 'Correo electrónico', de: 'E-Mail' },
  'contact.email_placeholder': { en: 'john@example.com', ar: 'john@example.com', fr: 'jean@exemple.com', es: 'juan@ejemplo.com', de: 'max@beispiel.de' },
  'contact.subject_label': { en: 'Subject', ar: 'الموضوع', fr: 'Sujet', es: 'Asunto', de: 'Betreff' },
  'contact.subject_placeholder': { en: 'Partnership Inquiry', ar: 'استفسار شراكة', fr: 'Demande de partenariat', es: 'Consulta de asociación', de: 'Partnerschaftsanfrage' },
  'contact.message_label': { en: 'Message', ar: 'الرسالة', fr: 'Message', es: 'Mensaje', de: 'Nachricht' },
  'contact.message_placeholder': { en: 'Tell us about your project...', ar: 'أخبرنا عن مشروعك...', fr: 'Parlez-nous de votre projet...', es: 'Cuéntenos sobre su proyecto...', de: 'Erzählen Sie uns von Ihrem Projekt...' },
  'contact.send': { en: 'Send Message', ar: 'إرسال الرسالة', fr: 'Envoyer', es: 'Enviar mensaje', de: 'Nachricht senden' },
  'contact.sending': { en: 'Sending...', ar: 'جار الإرسال...', fr: 'Envoi...', es: 'Enviando...', de: 'Wird gesendet...' },
  'contact.success': { en: 'Message sent! We\'ll get back to you soon.', ar: 'تم الإرسال! سنتواصل معك قريباً.', fr: 'Message envoyé ! Nous vous répondrons bientôt.', es: '¡Mensaje enviado! Le responderemos pronto.', de: 'Nachricht gesendet! Wir melden uns bald.' },
  'contact.error': { en: 'Failed to send. Please try again.', ar: 'فشل الإرسال. حاول مجدداً.', fr: 'Échec de l\'envoi. Veuillez réessayer.', es: 'Error al enviar. Intente de nuevo.', de: 'Senden fehlgeschlagen. Bitte erneut versuchen.' },
  'contact.validation_error': { en: 'This field is required', ar: 'هذا الحقل مطلوب', fr: 'Ce champ est requis', es: 'Este campo es obligatorio', de: 'Dieses Feld ist erforderlich' },
  'footer.brand': { en: 'NexusLabs', ar: 'نكسوس لابس', fr: 'NexusLabs', es: 'NexusLabs', de: 'NexusLabs' },
  'footer.products': { en: 'Products', ar: 'المنتجات', fr: 'Produits', es: 'Productos', de: 'Produkte' },
  'footer.company': { en: 'Company', ar: 'الشركة', fr: 'Entreprise', es: 'Empresa', de: 'Unternehmen' },
  'footer.legal': { en: 'Legal', ar: 'قانوني', fr: 'Légal', es: 'Legal', de: 'Rechtliches' },
  'footer.copyright': { en: 'All rights reserved.', ar: 'جميع الحقوق محفوظة.', fr: 'Tous droits réservés.', es: 'Todos los derechos reservados.', de: 'Alle Rechte vorbehalten.' },
  'footer.privacy': { en: 'Privacy', ar: 'الخصوصية', fr: 'Confidentialité', es: 'Privacidad', de: 'Datenschutz' },
  'footer.terms': { en: 'Terms', ar: 'الشروط', fr: 'Conditions', es: 'Términos', de: 'AGB' },
  'footer.blog': { en: 'Blog', ar: 'المدونة', fr: 'Blog', es: 'Blog', de: 'Blog' },
  'footer.careers': { en: 'Careers', ar: 'وظائف', fr: 'Carrières', es: 'Carreras', de: 'Karriere' },
  'footer.built_with': { en: 'Built with ❤️ for developers', ar: 'بُني بحب ❤️ للمطورين', fr: 'Construit avec ❤️ pour les développeurs', es: 'Construido con ❤️ para desarrolladores', de: 'Mit ❤️ für Entwickler gebaut' },
  'footer.product_1': { en: 'CloudSync', ar: 'كلاود سينك', fr: 'CloudSync', es: 'CloudSync', de: 'CloudSync' },
  'footer.product_2': { en: 'DataPulse', ar: 'داتا بولس', fr: 'DataPulse', es: 'DataPulse', de: 'DataPulse' },
  'footer.product_3': { en: 'CodeForge', ar: 'كود فورج', fr: 'CodeForge', es: 'CodeForge', de: 'CodeForge' },
  'footer.product_4': { en: 'PixelCraft', ar: 'بيكسل كرافت', fr: 'PixelCraft', es: 'PixelCraft', de: 'PixelCraft' },
  'footer.product_5': { en: 'NovaMind', ar: 'نوفا مايند', fr: 'NovaMind', es: 'NovaMind', de: 'NovaMind' },
  'common.loading': { en: 'Loading...', ar: 'جار التحميل...', fr: 'Chargement...', es: 'Cargando...', de: 'Laden...' },
  'common.error': { en: 'Something went wrong', ar: 'حدث خطأ ما', fr: 'Une erreur est survenue', es: 'Algo salió mal', de: 'Etwas ist schiefgelaufen' },
  'common.save': { en: 'Save', ar: 'حفظ', fr: 'Enregistrer', es: 'Guardar', de: 'Speichern' },
  'common.cancel': { en: 'Cancel', ar: 'إلغاء', fr: 'Annuler', es: 'Cancelar', de: 'Abbrechen' },
  'common.delete': { en: 'Delete', ar: 'حذف', fr: 'Supprimer', es: 'Eliminar', de: 'Löschen' },
  'common.edit': { en: 'Edit', ar: 'تعديل', fr: 'Modifier', es: 'Editar', de: 'Bearbeiten' },
  'common.create': { en: 'Create', ar: 'إنشاء', fr: 'Créer', es: 'Crear', de: 'Erstellen' },
  'common.search': { en: 'Search', ar: 'بحث', fr: 'Rechercher', es: 'Buscar', de: 'Suchen' },
  'common.back': { en: 'Back', ar: 'رجوع', fr: 'Retour', es: 'Volver', de: 'Zurück' },
  'admin.title': { en: 'Admin Dashboard', ar: 'لوحة الإدارة', fr: 'Tableau de bord admin', es: 'Panel de administración', de: 'Admin-Dashboard' },
  'admin.dashboard': { en: 'Dashboard', ar: 'لوحة القيادة', fr: 'Tableau de bord', es: 'Panel', de: 'Dashboard' },
  'admin.projects': { en: 'Projects', ar: 'المشاريع', fr: 'Projets', es: 'Proyectos', de: 'Projekte' },
  'admin.translations': { en: 'Translations', ar: 'الترجمات', fr: 'Traductions', es: 'Traducciones', de: 'Übersetzungen' },
  'admin.settings': { en: 'Settings', ar: 'الإعدادات', fr: 'Paramètres', es: 'Configuración', de: 'Einstellungen' },
  'admin.add_project': { en: 'Add Project', ar: 'إضافة مشروع', fr: 'Ajouter un projet', es: 'Añadir proyecto', de: 'Projekt hinzufügen' },
  'admin.edit_project': { en: 'Edit Project', ar: 'تعديل مشروع', fr: 'Modifier le projet', es: 'Editar proyecto', de: 'Projekt bearbeiten' },
  'admin.total_projects': { en: 'Total Projects', ar: 'إجمالي المشاريع', fr: 'Total projets', es: 'Total proyectos', de: 'Gesamtprojekte' },
  'admin.total_views': { en: 'Total Views', ar: 'إجمالي المشاهدات', fr: 'Vues totales', es: 'Vistas totales', de: 'Gesamtansichten' },
  'admin.total_translations': { en: 'Translations', ar: 'الترجمات', fr: 'Traductions', es: 'Traducciones', de: 'Übersetzungen' },
  'admin.project_published': { en: 'Published', ar: 'منشور', fr: 'Publié', es: 'Publicado', de: 'Veröffentlicht' },
  'admin.project_featured': { en: 'Featured', ar: 'مميز', fr: 'En vedette', es: 'Destacado', de: 'Empfohlen' },
}

const settings = [
  { key: 'site_name', value: 'NexusLabs', type: 'string' },
  { key: 'default_locale', value: 'en', type: 'string' },
  { key: 'available_locales', value: '["en","ar","fr","es","de"]', type: 'json' },
]

// =============================================================================
// CMS Pages Seed Data
// =============================================================================

const pages = [
  { slug: 'home', published: true, order: 0 },
  { slug: 'about', published: true, order: 1 },
  { slug: 'services', published: true, order: 2 },
  { slug: 'careers', published: true, order: 3 },
  { slug: 'privacy-policy', published: true, order: 4 },
]

const pageTranslations: Record<string, Record<string, { title: string; subtitle: string }>> = {
  home: {
    en: { title: 'Home', subtitle: 'Welcome to NexusLabs' },
    ar: { title: 'الرئيسية', subtitle: 'مرحباً بكم في نكسوس لابس' },
    fr: { title: 'Accueil', subtitle: 'Bienvenue chez NexusLabs' },
    es: { title: 'Inicio', subtitle: 'Bienvenido a NexusLabs' },
    de: { title: 'Startseite', subtitle: 'Willkommen bei NexusLabs' },
  },
  about: {
    en: { title: 'About Us', subtitle: 'Learn about our mission and values' },
    ar: { title: 'عن الشركة', subtitle: 'تعرف على مهمتنا وقيمنا' },
    fr: { title: 'À propos', subtitle: 'Découvrez notre mission et nos valeurs' },
    es: { title: 'Acerca de', subtitle: 'Conoce nuestra misión y valores' },
    de: { title: 'Über uns', subtitle: 'Erfahren Sie mehr über unsere Mission und Werte' },
  },
  services: {
    en: { title: 'Services', subtitle: 'What we offer' },
    ar: { title: 'الخدمات', subtitle: 'ما نقدمه' },
    fr: { title: 'Services', subtitle: 'Ce que nous offrons' },
    es: { title: 'Servicios', subtitle: 'Lo que ofrecemos' },
    de: { title: 'Leistungen', subtitle: 'Was wir anbieten' },
  },
  careers: {
    en: { title: 'Careers', subtitle: 'Join our team' },
    ar: { title: 'وظائف', subtitle: 'انضم لفريقنا' },
    fr: { title: 'Carrières', subtitle: 'Rejoignez notre équipe' },
    es: { title: 'Carreras', subtitle: 'Únete a nuestro equipo' },
    de: { title: 'Karriere', subtitle: 'Treten Sie unserem Team bei' },
  },
  'privacy-policy': {
    en: { title: 'Privacy Policy', subtitle: 'Your privacy matters to us' },
    ar: { title: 'سياسة الخصوصية', subtitle: 'خصوصيتك تهمّنا' },
    fr: { title: 'Politique de confidentialité', subtitle: 'Votre vie privée compte pour nous' },
    es: { title: 'Política de privacidad', subtitle: 'Tu privacidad nos importa' },
    de: { title: 'Datenschutz', subtitle: 'Ihre Privatsphäre ist uns wichtig' },
  },
}

const pageSections: Record<string, { type: string; order: number; settings: string; translations: Record<string, { title: string; subtitle: string; content: string; buttonText: string }> }[]> = {
  home: [
    {
      type: 'hero',
      order: 0,
      settings: JSON.stringify({ layout: 'centered', showCTA: true, backgroundColor: 'gradient' }),
      translations: {
        en: { title: 'We build digital products that matter', subtitle: 'NexusLabs creates world-class tools for developers, designers, and teams.', content: '', buttonText: 'Explore Projects' },
        ar: { title: 'نبني منتجات رقمية تهم', subtitle: 'نكسوس لابس تصنع أدوات عالمية المستوى للمطورين والمصممين والفرق.', content: '', buttonText: 'استكشف المشاريع' },
        fr: { title: 'Nous créons des produits numériques qui comptent', subtitle: 'NexusLabs crée des outils de classe mondiale pour les développeurs et les équipes.', content: '', buttonText: 'Explorer les projets' },
        es: { title: 'Construimos productos digitales que importan', subtitle: 'NexusLabs crea herramientas de clase mundial para desarrolladores y equipos.', content: '', buttonText: 'Explorar proyectos' },
        de: { title: 'Wir bauen digitale Produkte, die zählen', subtitle: 'NexusLabs erstellt erstklassige Tools für Entwickler, Designer und Teams.', content: '', buttonText: 'Projekte entdecken' },
      },
    },
    {
      type: 'featured-projects',
      order: 1,
      settings: JSON.stringify({ maxItems: 4, showTags: true }),
      translations: {
        en: { title: 'Spotlight Projects', subtitle: 'Our most impactful products driving innovation across industries.', content: '', buttonText: 'View All Projects' },
        ar: { title: 'مشاريع مميزة', subtitle: 'منتجاتنا الأكثر تأثيراً التي تقود الابتكار عبر الصناعات.', content: '', buttonText: 'عرض جميع المشاريع' },
        fr: { title: 'Projets phares', subtitle: 'Nos produits les plus impactants qui stimulent l\'innovation.', content: '', buttonText: 'Voir tous les projets' },
        es: { title: 'Proyectos destacados', subtitle: 'Nuestros productos más impactantes que impulsan la innovación.', content: '', buttonText: 'Ver todos los proyectos' },
        de: { title: 'Spotlight-Projekte', subtitle: 'Unsere wirkungsvollsten Produkte, die Innovation vorantreiben.', content: '', buttonText: 'Alle Projekte anzeigen' },
      },
    },
    {
      type: 'stats',
      order: 2,
      settings: JSON.stringify({ columns: 4, showIcons: true }),
      translations: {
        en: { title: 'By the Numbers', subtitle: 'Trusted by teams worldwide', content: '', buttonText: '' },
        ar: { title: 'بالأرقام', subtitle: 'موثوق من فرق حول العالم', content: '', buttonText: '' },
        fr: { title: 'En chiffres', subtitle: 'Adopté par des équipes du monde entier', content: '', buttonText: '' },
        es: { title: 'En números', subtitle: 'Confiado por equipos en todo el mundo', content: '', buttonText: '' },
        de: { title: 'In Zahlen', subtitle: 'Vertraut von Teams weltweit', content: '', buttonText: '' },
      },
    },
  ],
  about: [
    {
      type: 'mission',
      order: 0,
      settings: JSON.stringify({ layout: 'split', imagePosition: 'right' }),
      translations: {
        en: { title: 'Our Mission', subtitle: 'Democratizing access to powerful technology', content: 'We believe that world-class tools should be available to everyone — from solo developers to enterprise teams. Our mission drives every product we build and every decision we make.', buttonText: 'Learn More' },
        ar: { title: 'مهمتنا', subtitle: 'ت democratize الوصول للتقنية القوية', content: 'نؤمن أن الأدوات عالمية المستوى يجب أن تكون متاحة للجميع — من المطورين الفرديين إلى فرق المؤسسات.', buttonText: 'اعرف المزيد' },
        fr: { title: 'Notre mission', subtitle: 'Démocratiser l\'accès à la technologie puissante', content: 'Nous croyons que les outils de classe mondiale doivent être accessibles à tous.', buttonText: 'En savoir plus' },
        es: { title: 'Nuestra misión', subtitle: 'Democratizar el acceso a tecnología poderosa', content: 'Creemos que herramientas de clase mundial deben estar disponibles para todos.', buttonText: 'Saber más' },
        de: { title: 'Unsere Mission', subtitle: 'Den Zugang zu leistungsstarker Technologie demokratisieren', content: 'Wir glauben, dass erstklassige Tools für alle verfügbar sein sollten.', buttonText: 'Mehr erfahren' },
      },
    },
    {
      type: 'values',
      order: 1,
      settings: JSON.stringify({ columns: 3, showIcons: true }),
      translations: {
        en: { title: 'Our Values', subtitle: 'The principles that guide us', content: '', buttonText: '' },
        ar: { title: 'قيمنا', subtitle: 'المبادئ التي توجهنا', content: '', buttonText: '' },
        fr: { title: 'Nos valeurs', subtitle: 'Les principes qui nous guident', content: '', buttonText: '' },
        es: { title: 'Nuestros valores', subtitle: 'Los principios que nos guían', content: '', buttonText: '' },
        de: { title: 'Unsere Werte', subtitle: 'Die Prinzipien, die uns leiten', content: '', buttonText: '' },
      },
    },
  ],
  services: [
    {
      type: 'service-list',
      order: 0,
      settings: JSON.stringify({ columns: 3, showPricing: false }),
      translations: {
        en: { title: 'What We Do', subtitle: 'End-to-end digital product development', content: '', buttonText: 'Get Started' },
        ar: { title: 'ما نقدمه', subtitle: 'تطوير منتجات رقمية شامل', content: '', buttonText: 'ابدأ الآن' },
        fr: { title: 'Ce que nous faisons', subtitle: 'Développement de produits numériques de bout en bout', content: '', buttonText: 'Commencer' },
        es: { title: 'Lo que hacemos', subtitle: 'Desarrollo de productos digitales de principio a fin', content: '', buttonText: 'Comenzar' },
        de: { title: 'Was wir tun', subtitle: 'Durchgängige Entwicklung digitaler Produkte', content: '', buttonText: 'Loslegen' },
      },
    },
  ],
}

// =============================================================================
// Media Seed Data
// =============================================================================

const mediaItems = [
  { filename: 'logo.svg', originalName: 'NexusLabs Logo', mimeType: 'image/svg+xml', size: 4096, url: '/media/logo.svg', alt: 'NexusLabs Logo', category: 'branding' },
  { filename: 'hero-illustration.svg', originalName: 'Hero Illustration', mimeType: 'image/svg+xml', size: 12288, url: '/media/hero-illustration.svg', alt: 'Hero illustration showing digital products', category: 'illustrations' },
  { filename: 'og-image.png', originalName: 'Open Graph Image', mimeType: 'image/png', size: 245760, url: '/media/og-image.png', alt: 'NexusLabs Open Graph image', category: 'social' },
  { filename: 'favicon.ico', originalName: 'Favicon', mimeType: 'image/x-icon', size: 2048, url: '/media/favicon.ico', alt: '', category: 'branding' },
  { filename: 'team-photo.jpg', originalName: 'Team Photo', mimeType: 'image/jpeg', size: 524288, url: '/media/team-photo.jpg', alt: 'The NexusLabs team', category: 'photos' },
  { filename: 'office-photo.jpg', originalName: 'Office Photo', mimeType: 'image/jpeg', size: 393216, url: '/media/office-photo.jpg', alt: 'NexusLabs office in San Francisco', category: 'photos' },
]

async function seed() {
  console.log('🌱 Seeding database...')

  // Projects
  for (const p of projects) {
    const project = await db.project.upsert({
      where: { slug: p.slug },
      update: { category: p.category, imageUrl: p.imageUrl, externalUrl: p.url, tags: p.tags, featured: p.featured, order: p.order, views: p.views },
      create: { slug: p.slug, category: p.category, imageUrl: p.imageUrl, externalUrl: p.url, tags: p.tags, featured: p.featured, order: p.order, views: p.views },
    })

    for (const locale of locales) {
      const t = projectTranslations[p.slug]?.[locale]
      if (t) {
        await db.projectTranslation.upsert({
          where: { projectId_locale: { projectId: project.id, locale } },
          update: { name: t.name, tagline: t.tagline, description: t.description },
          create: { projectId: project.id, locale, name: t.name, tagline: t.tagline, description: t.description },
        })
      }
    }
  }
  console.log(`✅ Seeded ${projects.length} projects with ${locales.length} languages`)

  // Translations
  let tCount = 0
  for (const [key, values] of Object.entries(translations)) {
    for (const locale of locales) {
      const value = values[locale]
      if (value) {
        await db.translation.upsert({
          where: { key_locale: { key, locale } },
          update: { value },
          create: { key, locale, value },
        })
        tCount++
      }
    }
  }
  console.log(`✅ Seeded ${tCount} translations`)

  // Settings
  for (const s of settings) {
    await db.setting.upsert({
      where: { key: s.key },
      update: { value: s.value, type: s.type },
      create: { key: s.key, value: s.value, type: s.type },
    })
  }
  console.log(`✅ Seeded ${settings.length} settings`)

  // CMS Pages
  let pageSectionCount = 0
  let pageSectionTranslationCount = 0
  for (const p of pages) {
    const page = await db.page.upsert({
      where: { slug: p.slug },
      update: { published: p.published, order: p.order },
      create: { slug: p.slug, published: p.published, order: p.order },
    })

    // Page translations
    for (const locale of locales) {
      const t = pageTranslations[p.slug]?.[locale]
      if (t) {
        await db.pageTranslation.upsert({
          where: { pageId_locale: { pageId: page.id, locale } },
          update: { title: t.title, subtitle: t.subtitle },
          create: { pageId: page.id, locale, title: t.title, subtitle: t.subtitle },
        })
      }
    }

    // Page sections
    const sections = pageSections[p.slug] ?? []
    for (const s of sections) {
      const section = await db.pageSection.create({
        data: {
          pageId: page.id,
          type: s.type,
          order: s.order,
          settings: s.settings,
        },
      })
      pageSectionCount++

      for (const locale of locales) {
        const st = s.translations[locale]
        if (st) {
          await db.pageSectionTranslation.create({
            data: {
              sectionId: section.id,
              locale,
              title: st.title,
              subtitle: st.subtitle,
              content: st.content,
              buttonText: st.buttonText,
            },
          })
          pageSectionTranslationCount++
        }
      }
    }
  }
  console.log(`✅ Seeded ${pages.length} pages with ${pageSectionCount} sections and ${pageSectionTranslationCount} section translations`)

  // Media
  for (const m of mediaItems) {
    await db.media.upsert({
      where: { id: `seed-${m.filename}` },
      update: {},
      create: {
        id: `seed-${m.filename}`,
        filename: m.filename,
        originalName: m.originalName,
        mimeType: m.mimeType,
        size: m.size,
        url: m.url,
        alt: m.alt,
        category: m.category,
      },
    })
  }
  console.log(`✅ Seeded ${mediaItems.length} media items`)

  console.log('🎉 Seed complete!')
}

seed().catch(console.error).finally(() => db.$disconnect())
