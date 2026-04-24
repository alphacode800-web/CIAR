import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const locales = ['en', 'ar', 'fr', 'es', 'de'] as const

const projects = [
  { slug: 'ciar-realestate', category: 'Real Estate', imageUrl: '/images/real-estate.png', url: 'https://realestate.ciar.com', tags: '["Real Estate","Property","Listings","Virtual Tours","Booking","Investment"]', featured: true, order: 1, views: 32450 },
  { slug: 'ciar-carrental', category: 'Car Rental', imageUrl: '/images/car-rental.png', url: 'https://cars.ciar.com', tags: '["Car Rental","Transportation","Booking","Fleet","GPS","Insurance"]', featured: true, order: 2, views: 28930 },
  { slug: 'ciar-mall', category: 'E-Commerce', imageUrl: '/images/ecommerce.png', url: 'https://mall.ciar.com', tags: '["E-Commerce","Shopping","Marketplace","Payments","Delivery","Fashion"]', featured: true, order: 3, views: 45720 },
  { slug: 'ciar-travel', category: 'Tourism', imageUrl: '/images/tourist-guide.png', url: 'https://travel.ciar.com', tags: '["Tourism","Travel","Hotels","Flights","Guides","Destinations"]', featured: true, order: 4, views: 35600 },
  { slug: 'ciar-food', category: 'Food Delivery', imageUrl: '/images/food-delivery.png', url: 'https://food.ciar.com', tags: '["Food Delivery","Restaurants","Ordering","Tracking","Cuisine","Catering"]', featured: true, order: 5, views: 21340 },
  { slug: 'ciar-education', category: 'Education', imageUrl: '/images/education.png', url: 'https://edu.ciar.com', tags: '["Education","E-Learning","Courses","Certification","LMS","Training"]', featured: false, order: 6, views: 18920 },
  { slug: 'ciar-health', category: 'Healthcare', imageUrl: '/images/healthcare.png', url: 'https://health.ciar.com', tags: '["Healthcare","Medical","Appointments","Telemedicine","Pharmacy","Records"]', featured: true, order: 7, views: 27800 },
  { slug: 'ciar-logistics', category: 'Logistics', imageUrl: '/images/logistics.png', url: 'https://logistics.ciar.com', tags: '["Logistics","Shipping","Tracking","Warehousing","Fleet","Supply Chain"]', featured: false, order: 8, views: 14560 },
]

const projectTranslations: Record<string, Record<string, { name: string; tagline: string; description: string }>> = {
  'ciar-realestate': {
    en: { name: 'CIAR Real Estate', tagline: 'Discover your dream property with confidence', description: 'CIAR Real Estate is a premium property platform connecting buyers, sellers, and renters with the finest properties. Features include virtual tours, AI-powered property matching, market analytics, and seamless booking experiences for residential and commercial properties.' },
    ar: { name: 'CIAR العقارات', tagline: 'اكتشف عقار أحلامك بثقة', description: 'CIAR العقارات هي منصة عقارية متميزة تربط بين المشترين والبائعين والمستأجرين مع أرقى العقارات. تشمل جولات افتراضية ومطابقة عقارات بالذكاء الاصطناعي.' },
    fr: { name: 'CIAR Immobilier', tagline: 'Découvrez votre propriété de rêve en toute confiance', description: 'CIAR Immobilier est une plateforme immobilière premium reliant acheteurs, vendeurs et locataires aux plus belles propriétés avec visites virtuelles.' },
    es: { name: 'CIAR Bienes Raíces', tagline: 'Descubre la propiedad de tus sueños con confianza', description: 'CIAR Bienes Raíces es una plataforma inmobiliaria premium que conecta compradores, vendedores y arrendatarios con las mejores propiedades.' },
    de: { name: 'CIAR Immobilien', tagline: 'Entdecken Sie Ihr Traumobjekt mit Vertrauen', description: 'CIAR Immobilien ist eine Premium-Immobilienplattform, die Käufer, Verkäufer und Mieter mit den besten Objekten verbindet.' },
  },
  'ciar-carrental': {
    en: { name: 'CIAR Car Rental', tagline: 'Drive excellence, rent simplicity', description: 'CIAR Car Rental offers a seamless car rental experience with a diverse fleet of premium vehicles. Features include real-time availability, GPS navigation, insurance integration, and doorstep delivery. Available across multiple cities with 24/7 support.' },
    ar: { name: 'CIAR لتأجير السيارات', tagline: 'اقُد التميّز، استأجر بساطة', description: 'CIAR لتأجير السيارات تقدم تجربة تأجير سلسة مع أسطول متنوع من السيارات الفاخرة. تشمل التوفر الفوري والملاحة GPS والتأمين.' },
    fr: { name: 'CIAR Location de Voitures', tagline: 'Conduisez l\'excellence, louez la simplicité', description: 'CIAR Location de Voitures offre une expérience de location fluide avec une flotte diversifiée de véhicules premium et livraison à domicile.' },
    es: { name: 'CIAR Alquiler de Autos', tagline: 'Conduce la excelencia, alquila con simplicidad', description: 'CIAR Alquiler de Autos ofrece una experiencia de alquiler fluida con una flota diversa de vehículos premium y entrega a domicilio.' },
    de: { name: 'CIAR Autovermietung', tagline: 'Fahren Sie Exzellenz, mieten Sie Einfachheit', description: 'CIAR Autovermietung bietet ein nahtloses Miet erlebnis mit einer vielfältigen Flotte von Premium-Fahrzeugen und Zustellung an die Haustür.' },
  },
  'ciar-mall': {
    en: { name: 'CIAR Mall', tagline: 'Your premium marketplace experience', description: 'CIAR Mall is a comprehensive e-commerce platform featuring thousands of brands across fashion, electronics, home, and more. With AI-powered recommendations, secure payments, fast delivery, and easy returns, it delivers a premium shopping experience.' },
    ar: { name: 'CIAR مول', tagline: 'تجربة تسوقك المميزة', description: 'CIAR مول هي منصة تجارة إلكترونية شاملة تضم آلاف العلامات التجارية في الموضة والإلكترونيات والمنزل والمزيد.' },
    fr: { name: 'CIAR Mall', tagline: 'Votre expérience marketplace premium', description: 'CIAR Mall est une plateforme e-commerce complète avec des milliers de marques en mode, électronique, maison et plus encore.' },
    es: { name: 'CIAR Mall', tagline: 'Tu experiencia premium de compras', description: 'CIAR Mall es una plataforma e-commerce completa con miles de marcas en moda, electrónica, hogar y más.' },
    de: { name: 'CIAR Mall', tagline: 'Ihr Premium-Marketplace-Erlebnis', description: 'CIAR Mall ist eine umfassende E-Commerce-Plattform mit tausenden Marken in Mode, Elektronik, Haus und mehr.' },
  },
  'ciar-travel': {
    en: { name: 'CIAR Travel', tagline: 'Explore the world, one destination at a time', description: 'CIAR Travel is your ultimate travel companion, offering curated tour packages, hotel bookings, flight reservations, and local guides. Discover hidden gems, plan itineraries, and book everything in one place with exclusive deals.' },
    ar: { name: 'CIAR للسياحة', tagline: 'استكشف العالم، وجهة واحدة في كل مرة', description: 'CIAR للسياحة هي رفيق سفرك المثالي، تقدم باقات سياحية مختارة وحجز الفنادق وحجز الطيران والأدلة المحلية.' },
    fr: { name: 'CIAR Voyages', tagline: 'Explorez le monde, une destination à la fois', description: 'CIAR Voyages est votre compagnon de voyage ultime, offrant des forfaits touristiques, réservations d\'hôtels et billets d\'avion.' },
    es: { name: 'CIAR Viajes', tagline: 'Explora el mundo, un destino a la vez', description: 'CIAR Viajes es tu compañero de viaje definitivo, ofreciendo paquetes turísticos, reservas de hoteles y vuelos con guías locales.' },
    de: { name: 'CIAR Reisen', tagline: 'Erkunden Sie die Welt, ein Ziel nach dem anderen', description: 'CIAR Reisen ist Ihr ultimativer Reisebegleiter mit kuratierten Reisepaketen, Hotelbuchungen und Flugreservierungen.' },
  },
  'ciar-food': {
    en: { name: 'CIAR Food', tagline: 'Delicious meals delivered to your doorstep', description: 'CIAR Food connects you with the best restaurants and chefs in your city. Order your favorite meals with real-time tracking, scheduled deliveries, group ordering, and exclusive restaurant partnerships for a delightful dining experience.' },
    ar: { name: 'CIAR فود', tagline: 'وجبات لذيذة تصل لباب بيتك', description: 'CIAR فود تربطك بأفضل المطاعم والطهاة في مدينتك. اطلب وجباتك المفضلة مع تتبع فوري وجدول deliveries.' },
    fr: { name: 'CIAR Food', tagline: 'De délicieux repas livrés à votre porte', description: 'CIAR Food vous connecte aux meilleurs restaurants et chefs de votre ville avec suivi en temps réel et livraison planifiée.' },
    es: { name: 'CIAR Food', tagline: 'Comidas deliciosas entregadas en tu puerta', description: 'CIAR Food te conecta con los mejores restaurantes y chefs de tu ciudad con seguimiento en tiempo real y entregas programadas.' },
    de: { name: 'CIAR Food', tagline: 'Köstliche Mahlzeiten an Ihre Haustür geliefert', description: 'CIAR Food verbindet Sie mit den besten Restaurants und Köchen in Ihrer Stadt mit Echtzeit-Tracking.' },
  },
  'ciar-education': {
    en: { name: 'CIAR Academy', tagline: 'Learn without limits, grow without boundaries', description: 'CIAR Academy is a comprehensive e-learning platform offering professional courses, certifications, and skill development programs. Features include live sessions, interactive labs, mentorship programs, and industry-recognized certificates.' },
    ar: { name: 'CIAR أكاديمي', tagline: 'تعلّم بلا حدود، نمُ بلا حدود', description: 'CIAR أكاديمي هي منصة تعليم إلكتروني شاملة تقدم دورات مهنية وشهادات وبرامج تطوير المهارات.' },
    fr: { name: 'CIAR Académie', tagline: 'Apprenez sans limites, grandissez sans frontières', description: 'CIAR Académie est une plateforme e-learning complète offrant des cours professionnels, certifications et programmes de développement.' },
    es: { name: 'CIAR Academia', tagline: 'Aprende sin límites, crece sin fronteras', description: 'CIAR Academia es una plataforma e-learning completa que ofrece cursos profesionales, certificaciones y programas de desarrollo.' },
    de: { name: 'CIAR Akademie', tagline: 'Lernen ohne Grenzen, wachsen ohne Begrenzung', description: 'CIAR Akademie ist eine umfassende E-Learning-Plattform mit professionellen Kursen und Zertifizierungsprogrammen.' },
  },
  'ciar-health': {
    en: { name: 'CIAR Health', tagline: 'Your health, our priority', description: 'CIAR Health provides comprehensive healthcare services including online consultations, appointment scheduling, medical records management, and pharmacy services. Connect with top healthcare professionals from the comfort of your home.' },
    ar: { name: 'CIAR الصحة', tagline: 'صحتك، أولويتنا', description: 'CIAR الصحة تقدم خدمات رعاية صحية شاملة تشمل الاستشارات عبر الإنترنت وحجز المواعيد وإدارة السجلات الطبية.' },
    fr: { name: 'CIAR Santé', tagline: 'Votre santé, notre priorité', description: 'CIAR Santé fournit des services de santé complets incluant consultations en ligne, prise de rendez-vous et gestion des dossiers médicaux.' },
    es: { name: 'CIAR Salud', tagline: 'Tu salud, nuestra prioridad', description: 'CIAR Salud proporciona servicios de salud completos incluyendo consultas en línea, programación de citas y gestión de historiales médicos.' },
    de: { name: 'CIAR Gesundheit', tagline: 'Ihre Gesundheit, unsere Priorität', description: 'CIAR Gesundheit bietet umfassende Gesundheitsdienste einschließlich Online-Beratungen und Terminvereinbarungen.' },
  },
  'ciar-logistics': {
    en: { name: 'CIAR Logistics', tagline: 'Moving your business forward, always on time', description: 'CIAR Logistics provides end-to-end supply chain solutions including shipping, warehousing, fleet management, and last-mile delivery. Features real-time package tracking, route optimization, and automated inventory management.' },
    ar: { name: 'CIAR اللوجستيات', tagline: 'ندفع أعمالك للأمام، دائماً في الوقت', description: 'CIAR اللوجستيات تقدم حلول سلسلة إمداد شاملة تشمل الشحن والتخزين وإدارة الأسطول والتوصيل للميل الأخير.' },
    fr: { name: 'CIAR Logistique', tagline: 'Faites avancer votre entreprise, toujours à temps', description: 'CIAR Logistique fournit des solutions de chaîne d\'approvisionnement de bout en bout avec suivi en temps réel et optimisation des itinéraires.' },
    es: { name: 'CIAR Logística', tagline: 'Impulsando tu negocio, siempre a tiempo', description: 'CIAR Logística proporciona soluciones de cadena de suministro de extremo a extremo con seguimiento en tiempo real y optimización de rutas.' },
    de: { name: 'CIAR Logistik', tagline: 'Bringen Sie Ihr Unternehmen voran, immer pünktlich', description: 'CIAR Logistik bietet End-to-End-Lieferkettenlösungen mit Echtzeit-Tracking und Routenoptimierung.' },
  },
}

const translations: Record<string, Record<string, string>> = {
  'nav.home': { en: 'Home', ar: 'الرئيسية', fr: 'Accueil', es: 'Inicio', de: 'Startseite' },
  'nav.projects': { en: 'Our Platforms', ar: 'منصاتنا', fr: 'Nos plateformes', es: 'Nuestras plataformas', de: 'Unsere Plattformen' },
  'nav.about': { en: 'About', ar: 'عن CIAR', fr: 'À propos', es: 'Acerca de', de: 'Über uns' },
  'nav.contact': { en: 'Contact', ar: 'تواصل', fr: 'Contact', es: 'Contacto', de: 'Kontakt' },
  'nav.admin': { en: 'Admin', ar: 'الإدارة', fr: 'Admin', es: 'Admin', de: 'Admin' },
  'hero.badge': { en: 'Transforming Services Digitally', ar: 'نحوّل الخدمات رقمياً', fr: 'Transformer les services numériquement', es: 'Transformando servicios digitalmente', de: 'Services digital transformieren' },
  'hero.title_1': { en: 'Building Digital', ar: 'نبني منصات', fr: 'Construire des plateformes', es: 'Construyendo plataformas', de: 'Digitale Plattformen' },
  'hero.title_2': { en: 'Experiences', ar: 'رقمية استثنائية', fr: 'numériques exceptionnelles', es: 'digitales excepcionales', de: 'gebaut für die Zukunft' },
  'hero.subtitle': { en: 'CIAR is a leading services company that builds and manages a diverse portfolio of digital platforms — from real estate and car rental to e-commerce, tourism, and beyond.', ar: 'CIAR شركة خدمات رائدة تبني وتدير محفظة متنوعة من المنصات الرقمية — من العقارات وتأجير السيارات إلى التجارة الإلكترونية والسياحة وأكثر.', fr: 'CIAR est une entreprise de services de premier plan qui construit et gère un portefeuille diversifié de plateformes numériques — de l\'immobilier à la location de voitures.', es: 'CIAR es una empresa líder en servicios que construye y gestiona un portafolio diverso de plataformas digitales — desde bienes raíces hasta turismo.', de: 'CIAR ist ein führendes Dienstleistungsunternehmen, das ein diversifiziertes Portfolio digitaler Plattformen aufbaut und verwaltet.' },
  'hero.cta': { en: 'Explore Platforms', ar: 'استكشف المنصات', fr: 'Explorer les plateformes', es: 'Explorar plataformas', de: 'Plattformen entdecken' },
  'hero.cta2': { en: 'Learn More', ar: 'اعرف المزيد', fr: 'En savoir plus', es: 'Saber más', de: 'Mehr erfahren' },
  'hero.stat_products': { en: 'Platforms', ar: 'منصات', fr: 'Plateformes', es: 'Plataformas', de: 'Plattformen' },
  'hero.stat_views': { en: 'Total Users', ar: 'إجمالي المستخدمين', fr: 'Utilisateurs totaux', es: 'Usuarios totales', de: 'Gesamtnutzer' },
  'hero.stat_categories': { en: 'Industries', ar: 'قطاعات', fr: 'Industries', es: 'Industrias', de: 'Branchen' },
  'projects.title': { en: 'Our Platforms', ar: 'منصاتنا', fr: 'Nos plateformes', es: 'Nuestras plataformas', de: 'Unsere Plattformen' },
  'projects.subtitle': { en: 'Explore our diverse portfolio of digital platforms serving millions of users worldwide.', ar: 'استكشف محفظتنا المتنوعة من المنصات الرقمية التي تخدم ملايين المستخدمين حول العالم.', fr: 'Explorez notre portefeuille diversifié de plateformes numériques au service de millions d\'utilisateurs.', es: 'Explora nuestro portafolio diverso de plataformas digitales que sirven a millones de usuarios en todo el mundo.', de: 'Entdecken Sie unser diversifiziertes Portfolio digitaler Plattformen für Millionen von Nutzern weltweit.' },
  'projects.featured': { en: 'Featured', ar: 'مميز', fr: 'En vedette', es: 'Destacados', de: 'Empfohlen' },
  'projects.featured_title': { en: 'Spotlight Platforms', ar: 'منصات مميزة', fr: 'Plateformes phares', es: 'Plataformas destacadas', de: 'Spotlight-Plattformen' },
  'projects.featured_subtitle': { en: 'Our flagship platforms driving innovation across multiple industries.', ar: 'منصاتنا الرائدة التي تقود الابتكار عبر قطاعات متعددة.', fr: 'Nos plateformes phares stimulant l\'innovation dans de multiples industries.', es: 'Nuestras plataformas insignia impulsando la innovación en múltiples industrias.', de: 'Unsere Leitplattformen, die Innovation in mehreren Branchen vorantreiben.' },
  'projects.search_placeholder': { en: 'Search platforms...', ar: 'ابحث عن منصات...', fr: 'Rechercher des plateformes...', es: 'Buscar plataformas...', de: 'Plattformen suchen...' },
  'projects.all': { en: 'All', ar: 'الكل', fr: 'Tous', es: 'Todos', de: 'Alle' },
  'projects.no_results': { en: 'No platforms found', ar: 'لم يتم العثور على منصات', fr: 'Aucune plateforme trouvée', es: 'No se encontraron plataformas', de: 'Keine Plattformen gefunden' },
  'projects.visit': { en: 'Visit', ar: 'زيارة', fr: 'Visiter', es: 'Visitar', de: 'Besuchen' },
  'projects.views': { en: 'visits', ar: 'زيارة', fr: 'visites', es: 'visitas', de: 'Besuche' },
  'projects.view_details': { en: 'View Details', ar: 'عرض التفاصيل', fr: 'Voir les détails', es: 'Ver detalles', de: 'Details ansehen' },
  'projects.project_count': { en: '{count} platforms', ar: '{count} منصات', fr: '{count} plateformes', es: '{count} plataformas', de: '{count} Plattformen' },
  'projects.project_count_single': { en: '1 platform', ar: 'منصة واحدة', fr: '1 plateforme', es: '1 plataforma', de: '1 Plattform' },
  'projects.refresh': { en: 'Refresh', ar: 'تحديث', fr: 'Actualiser', es: 'Actualizar', de: 'Aktualisieren' },
  'project.details': { en: 'Platform Details', ar: 'تفاصيل المنصة', fr: 'Détails de la plateforme', es: 'Detalles de la plataforma', de: 'Plattform-Details' },
  'project.about': { en: 'About this Platform', ar: 'حول هذه المنصة', fr: 'À propos de cette plateforme', es: 'Acerca de esta plataforma', de: 'Über diese Plattform' },
  'project.no_description': { en: 'No description available', ar: 'لا يوجد وصف متاح', fr: 'Aucune description disponible', es: 'No hay descripción disponible', de: 'Keine Beschreibung verfügbar' },
  'project.technologies': { en: 'Features', ar: 'المميزات', fr: 'Fonctionnalités', es: 'Características', de: 'Funktionen' },
  'project.visit_website': { en: 'Visit Platform', ar: 'زيارة المنصة', fr: 'Visiter la plateforme', es: 'Visitar plataforma', de: 'Plattform besuchen' },
  'project.back': { en: 'Back to Platforms', ar: 'العودة للمنصات', fr: 'Retour aux plateformes', es: 'Volver a plataformas', de: 'Zurück zu Plattformen' },
  'project.featured': { en: 'Featured', ar: 'مميز', fr: 'En vedette', es: 'Destacado', de: 'Empfohlen' },
  'about.badge': { en: 'About CIAR', ar: 'عن CIAR', fr: 'À propos de CIAR', es: 'Acerca de CIAR', de: 'Über CIAR' },
  'about.title_1': { en: 'We build platforms', ar: 'نبني منصات', fr: 'Nous construisons des plateformes', es: 'Construimos plataformas', de: 'Wir bauen Plattformen' },
  'about.title_2': { en: 'that serve millions', ar: 'تخدم الملايين', fr: 'au service de millions', es: 'que sirven a millones', de: 'für Millionen' },
  'about.subtitle': { en: 'CIAR is a leading services company dedicated to creating innovative digital platforms that simplify lives and empower businesses across diverse industries.', ar: 'CIAR شركة خدمات رائدة مكرسة لإنشاء منصات رقمية مبتكرة تبسّط الحياة وتمكّن الأعمال عبر قطاعات متنوعة.', fr: 'CIAR est une entreprise de services de premier plan dédiée à la création de plateformes numériques innovantes.', es: 'CIAR es una empresa líder en servicios dedicada a crear plataformas digitales innovadoras que simplifican vidas.', de: 'CIAR ist ein führendes Dienstleistungsunternehmen, das innovative digitale Plattformen schafft.' },
  'about.mission_title': { en: 'Our Mission', ar: 'مهمتنا', fr: 'Notre mission', es: 'Nuestra misión', de: 'Unsere Mission' },
  'about.mission_text': { en: 'To transform how people access essential services through beautifully crafted digital platforms. We bridge the gap between traditional services and the digital age, making everyday life easier and more connected.', ar: 'تحويل طريقة وصول الناس للخدمات الأساسية عبر منصات رقمية مصممة بعناية. نربط الفجوة بين الخدمات التقليدية والعصر الرقمي.', fr: 'Transformer la façon dont les gens accèdent aux services essentiels grâce à des plateformes numériques élégantes.', es: 'Transformar cómo las personas acceden a servicios esenciales a través de plataformas digitales bien diseñadas.', de: 'Den Zugang zu wesentlichen Dienstleistungen durch ansprechend gestaltete digitale Plattformen transformieren.' },
  'about.vision_title': { en: 'Our Vision', ar: 'رؤيتنا', fr: 'Notre vision', es: 'Nuestra visión', de: 'Unsere Vision' },
  'about.vision_text': { en: 'A world where every essential service is just a tap away. We envision becoming the go-to digital services ecosystem, connecting millions of users with the services they need through intuitive, reliable platforms.', ar: 'عالم حيث كل خدمة أساسية على بعد نقرة واحدة. نتصور أن نصبح النظام البيئي الرقمي الأول للخدمات.', fr: 'Un monde où chaque service essentiel est à un clic. Nous envisageons de devenir l\'écosystème de services numériques de référence.', es: 'Un mundo donde cada servicio esencial está a un toque. Visualizamos convertirnos en el ecosistema de servicios digitales de referencia.', de: 'Eine Welt, in dem jeder wesentliche Service nur einen Klick entfernt ist. Das führende digitale Service-Ökosystem.' },
  'about.values_title': { en: 'Our Values', ar: 'قيمنا', fr: 'Nos valeurs', es: 'Nuestros valores', de: 'Unsere Werte' },
  'about.value_innovation': { en: 'Innovation First', ar: 'الابتكار أولاً', fr: 'Innovation d\'abord', es: 'Innovación primero', de: 'Innovation zuerst' },
  'about.value_innovation_desc': { en: 'We continuously evolve our platforms with cutting-edge technology to deliver the best user experience.', ar: 'نتطور منصاتنا باستمرار بأحدث التقنيات لتقديم أفضل تجربة مستخدم.', fr: 'Nous faisons évoluer continuellement nos plateformes avec une technologie de pointe.', es: 'Evolucionamos continuamente nuestras plataformas con tecnología de vanguardia.', de: 'Wir entwickeln unsere Plattformen kontinuierlich mit modernster Technologie weiter.' },
  'about.value_users': { en: 'User Obsessed', ar: 'مهتمون بالمستخدم', fr: 'Obsédés par l\'utilisateur', es: 'Obsesionados por el usuario', de: 'Nutzerfokus' },
  'about.value_users_desc': { en: 'Every platform is designed around the people who use it. We build services that people genuinely love.', ar: 'كل منصة مصممة حول الأشخاص الذين يستخدمونها. نبني خدمات يحبها الناس حقاً.', fr: 'Chaque plateforme est conçue autour des personnes qui l\'utilisent.', es: 'Cada plataforma está diseñada alrededor de las personas que la usan.', de: 'Jede Plattform wird um die Menschen herum gestaltet, die sie nutzen.' },
  'about.value_security': { en: 'Trust & Security', ar: 'الثقة والأمان', fr: 'Confiance et sécurité', es: 'Confianza y seguridad', de: 'Vertrauen & Sicherheit' },
  'about.value_security_desc': { en: 'Security and privacy are foundational to every platform we build. Your data is always protected.', ar: 'الأمان والخصوصية أساسيان في كل منصة نبنيها. بياناتك محمية دائماً.', fr: 'La sécurité et la confidentialité sont fondamentales pour chaque plateforme que nous construisons.', es: 'La seguridad y privacidad son fundamentales en cada plataforma que construimos.', de: 'Sicherheit und Datenschutz sind grundlegend für jede Plattform, die wir bauen.' },
  'about.value_speed': { en: 'Speed & Reliability', ar: 'السرعة والموثوقية', fr: 'Vitesse et fiabilité', es: 'Velocidad y fiabilidad', de: 'Geschwindigkeit & Zuverlässigkeit' },
  'about.value_speed_desc': { en: 'Our platforms are built for performance. Fast loading, smooth interactions, and 99.9% uptime guaranteed.', ar: 'منصاتنا مبنية للأداء. تحميل سريع وتفاعلات سلسة وتوفر 99.9% مضمون.', fr: 'Nos plateformes sont conçues pour la performance. Chargement rapide et disponibilité garantie.', es: 'Nuestras plataformas están construidas para el rendimiento. Carga rápida y disponibilidad garantizada.', de: 'Unsere Plattformen sind für Leistung gebaut. Schnelles Laden und 99,9% Verfügbarkeit garantiert.' },
  'about.value_team': { en: 'Team Excellence', ar: 'تميز الفريق', fr: 'Excellence d\'équipe', es: 'Excelencia de equipo', de: 'Team-Exzellenz' },
  'about.value_team_desc': { en: 'Our diverse team of experts brings together the best in design, engineering, and service delivery.', ar: 'فريقنا المتنوع من الخبراء يجمع الأفضل في التصميم والهندسة وتقديم الخدمات.', fr: 'Notre équipe diversifiée d\'experts réunit le meilleur en design, ingénierie et prestation de services.', es: 'Nuestro equipo diverso de expertos reúne lo mejor en diseño, ingeniería y entrega de servicios.', de: 'Unser vielfältiges Expertenteam vereint das Beste in Design, Engineering und Service.' },
  'about.value_global': { en: 'Global Impact', ar: 'تأثير عالمي', fr: 'Impact mondial', es: 'Impacto global', de: 'Globale Wirkung' },
  'about.value_global_desc': { en: 'Our platforms serve millions of users across multiple countries and languages, breaking down borders.', ar: 'منصاتنا تخدم ملايين المستخدمين عبر دول ولغات متعددة، كسراً الحدود.', fr: 'Nos plateformes servent des millions d\'utilisateurs dans plusieurs pays et langues.', es: 'Nuestras plataformas sirven a millones de usuarios en múltiples países e idiomas.', de: 'Unsere Plattformen bedienen Millionen von Nutzern in mehreren Ländern und Sprachen.' },
  'about.stat_products': { en: 'Platforms', ar: 'منصات', fr: 'Plateformes', es: 'Plataformas', de: 'Plattformen' },
  'about.stat_users': { en: 'Users', ar: 'مستخدمون', fr: 'Utilisateurs', es: 'Usuarios', de: 'Nutzer' },
  'about.stat_uptime': { en: 'Uptime', ar: 'وقت التشغيل', fr: 'Disponibilité', es: 'Disponibilidad', de: 'Verfügbarkeit' },
  'about.stat_support': { en: 'Support', ar: 'الدعم', fr: 'Support', es: 'Soporte', de: 'Support' },
  'about.stat_products_value': { en: '8+', ar: '8+', fr: '8+', es: '8+', de: '8+' },
  'about.stat_users_value': { en: '2M+', ar: '+2 مليون', fr: '2M+', es: '2M+', de: '2M+' },
  'about.stat_uptime_value': { en: '99.9%', ar: '99.9%', fr: '99.9%', es: '99.9%', de: '99.9%' },
  'about.stat_support_value': { en: '24/7', ar: '24/7', fr: '24/7', es: '24/7', de: '24/7' },
  'contact.badge': { en: 'Get in Touch', ar: 'تواصل معنا', fr: 'Contactez-nous', es: 'Contáctenos', de: 'Kontaktieren Sie uns' },
  'contact.title_1': { en: "Let's", ar: 'دعنا', fr: 'Travaillons', es: 'Trabajemos', de: 'Lassen Sie uns' },
  'contact.title_2': { en: 'work together', ar: 'نتعاون معاً', fr: 'ensemble', es: 'juntos', de: 'zusammenarbeiten' },
  'contact.subtitle': { en: 'Have a partnership idea, business inquiry, or feedback? We\'d love to hear from you.', ar: 'لديك فكرة شراكة أو استفسار تجاري أو ملاحظات؟ يسعدنا أن نسمع منك.', fr: 'Vous avez une idée de partenariat ou une question ? Nous serions ravis de vous entendre.', es: '¿Tiene una idea de asociación o consulta comercial? Nos encantaría saber de usted.', de: 'Haben Sie eine Partnerschaftsidee oder geschäftliche Anfrage? Wir freuen uns von Ihnen zu hören.' },
  'contact.info_title': { en: 'Contact Info', ar: 'معلومات الاتصال', fr: 'Informations de contact', es: 'Info de contacto', de: 'Kontaktinfo' },
  'contact.email_label': { en: 'Email', ar: 'البريد الإلكتروني', fr: 'Email', es: 'Correo', de: 'E-Mail' },
  'contact.email': { en: 'hello@ciar.com', ar: 'hello@ciar.com', fr: 'hello@ciar.com', es: 'hello@ciar.com', de: 'hello@ciar.com' },
  'contact.office_label': { en: 'Office', ar: 'المكتب', fr: 'Bureau', es: 'Oficina', de: 'Büro' },
  'contact.office': { en: 'Riyadh, Saudi Arabia', ar: 'الرياض، المملكة العربية السعودية', fr: 'Riyad, Arabie Saoudite', es: 'Riad, Arabia Saudita', de: 'Riad, Saudi-Arabien' },
  'contact.response_title': { en: 'Quick Response', ar: 'رد سريع', fr: 'Réponse rapide', es: 'Respuesta rápida', de: 'Schnelle Antwort' },
  'contact.response_text': { en: 'We typically respond within 24 hours on business days.', ar: 'نرد عادة خلال 24 ساعة في أيام العمل.', fr: 'Nous répondons généralement sous 24 heures les jours ouvrables.', es: 'Normalmente respondemos en 24 horas los días laborables.', de: 'Wir antworten in der Regel innerhalb von 24 Stunden an Werktagen.' },
  'contact.name_label': { en: 'Name', ar: 'الاسم', fr: 'Nom', es: 'Nombre', de: 'Name' },
  'contact.name_placeholder': { en: 'Your full name', ar: 'الاسم الكامل', fr: 'Votre nom complet', es: 'Su nombre completo', de: 'Ihr vollständiger Name' },
  'contact.email_label2': { en: 'Email', ar: 'البريد الإلكتروني', fr: 'Email', es: 'Correo electrónico', de: 'E-Mail' },
  'contact.email_placeholder': { en: 'you@example.com', ar: 'you@example.com', fr: 'vous@exemple.com', es: 'usted@ejemplo.com', de: 'sie@beispiel.de' },
  'contact.subject_label': { en: 'Subject', ar: 'الموضوع', fr: 'Sujet', es: 'Asunto', de: 'Betreff' },
  'contact.subject_placeholder': { en: 'Partnership Inquiry', ar: 'استفسار شراكة', fr: 'Demande de partenariat', es: 'Consulta de asociación', de: 'Partnerschaftsanfrage' },
  'contact.message_label': { en: 'Message', ar: 'الرسالة', fr: 'Message', es: 'Mensaje', de: 'Nachricht' },
  'contact.message_placeholder': { en: 'Tell us about your project or idea...', ar: 'أخبرنا عن مشروعك أو فكرتك...', fr: 'Parlez-nous de votre projet ou idée...', es: 'Cuéntenos sobre su proyecto o idea...', de: 'Erzählen Sie uns von Ihrem Projekt oder Ihrer Idee...' },
  'contact.send': { en: 'Send Message', ar: 'إرسال الرسالة', fr: 'Envoyer', es: 'Enviar mensaje', de: 'Nachricht senden' },
  'contact.sending': { en: 'Sending...', ar: 'جار الإرسال...', fr: 'Envoi...', es: 'Enviando...', de: 'Wird gesendet...' },
  'contact.success': { en: 'Message sent! We\'ll get back to you soon.', ar: 'تم الإرسال! سنتواصل معك قريباً.', fr: 'Message envoyé ! Nous vous répondrons bientôt.', es: '¡Mensaje enviado! Le responderemos pronto.', de: 'Nachricht gesendet! Wir melden uns bald.' },
  'contact.error': { en: 'Failed to send. Please try again.', ar: 'فشل الإرسال. حاول مجدداً.', fr: 'Échec de l\'envoi. Veuillez réessayer.', es: 'Error al enviar. Intente de nuevo.', de: 'Senden fehlgeschlagen. Bitte erneut versuchen.' },
  'contact.validation_error': { en: 'This field is required', ar: 'هذا الحقل مطلوب', fr: 'Ce champ est requis', es: 'Este campo es obligatorio', de: 'Dieses Feld ist erforderlich' },
  'contact.response_active': { en: 'Active now', ar: 'متاح الآن', fr: 'Actif maintenant', es: 'Activo ahora', de: 'Jetzt aktiv' },
  'footer.brand': { en: 'CIAR', ar: 'CIAR', fr: 'CIAR', es: 'CIAR', de: 'CIAR' },
  'footer.products': { en: 'Platforms', ar: 'المنصات', fr: 'Plateformes', es: 'Plataformas', de: 'Plattformen' },
  'footer.company': { en: 'Company', ar: 'الشركة', fr: 'Entreprise', es: 'Empresa', de: 'Unternehmen' },
  'footer.legal': { en: 'Legal', ar: 'قانوني', fr: 'Légal', es: 'Legal', de: 'Rechtliches' },
  'footer.copyright': { en: 'All rights reserved.', ar: 'جميع الحقوق محفوظة.', fr: 'Tous droits réservés.', es: 'Todos los derechos reservados.', de: 'Alle Rechte vorbehalten.' },
  'footer.privacy': { en: 'Privacy', ar: 'الخصوصية', fr: 'Confidentialité', es: 'Privacidad', de: 'Datenschutz' },
  'footer.terms': { en: 'Terms', ar: 'الشروط', fr: 'Conditions', es: 'Términos', de: 'AGB' },
  'footer.blog': { en: 'Blog', ar: 'المدونة', fr: 'Blog', es: 'Blog', de: 'Blog' },
  'footer.careers': { en: 'Careers', ar: 'وظائف', fr: 'Carrières', es: 'Carreras', de: 'Karriere' },
  'footer.built_with': { en: 'Built with excellence for a digital world', ar: 'بُني بتميّز لعالم رقمي', fr: 'Construit avec excellence pour un monde numérique', es: 'Construido con excelencia para un mundo digital', de: 'Mit Exzellenz für eine digitale Welt gebaut' },
  'footer.product_1': { en: 'Real Estate', ar: 'العقارات', fr: 'Immobilier', es: 'Bienes Raíces', de: 'Immobilien' },
  'footer.product_2': { en: 'Car Rental', ar: 'تأجير السيارات', fr: 'Location de voitures', es: 'Alquiler de autos', de: 'Autovermietung' },
  'footer.product_3': { en: 'CIAR Mall', ar: 'CIAR مول', fr: 'CIAR Mall', es: 'CIAR Mall', de: 'CIAR Mall' },
  'footer.product_4': { en: 'Travel', ar: 'السياحة', fr: 'Voyages', es: 'Viajes', de: 'Reisen' },
  'footer.product_5': { en: 'Food Delivery', ar: 'توصيل الطعام', fr: 'Livraison repas', es: 'Delivery comida', de: 'Essenslieferung' },
  'home.featured_projects': { en: 'Featured Platforms', ar: 'المنصات المميزة', fr: 'Plateformes en vedette', es: 'Plataformas destacadas', de: 'Empfohlene Plattformen' },
  'home.featured_subtitle': { en: 'Discover our flagship digital platforms serving millions', ar: 'اكتشف منصاتنا الرقمية الرائدة التي تخدم الملايين', fr: 'Découvrez nos plateformes numériques phares au service de millions', es: 'Descubre nuestras plataformas digitales insignia que sirven a millones', de: 'Entdecken Sie unsere Leitplattformen im Dienste von Millionen' },
  'home.view_all': { en: 'View All Platforms', ar: 'عرض جميع المنصات', fr: 'Voir toutes les plateformes', es: 'Ver todas las plataformas', de: 'Alle Plattformen anzeigen' },
  'home.cta_title': { en: 'Ready to explore our platforms?', ar: 'مستعد لاكتشاف منصاتنا؟', fr: 'Prêt à explorer nos plateformes ?', es: '¿Listo para explorar nuestras plataformas?', de: 'Bereit, unsere Plattformen zu entdecken?' },
  'home.cta_subtitle': { en: 'Discover how our platforms can simplify your life and elevate your business.', ar: 'اكتشف كيف يمكن لمنصاتنا تبسيط حياتك ورفع مستوى أعمالك.', fr: 'Découvrez comment nos plateformes peuvent simplifier votre vie.', es: 'Descubre cómo nuestras plataformas pueden simplificar tu vida.', de: 'Entdecken Sie, wie unsere Plattformen Ihr Leben vereinfachen können.' },
  'home.cta_button': { en: 'Get Started', ar: 'ابدأ الآن', fr: 'Commencer', es: 'Comenzar', de: 'Loslegen' },
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
  { key: 'site_name', value: 'CIAR', type: 'string' },
  { key: 'default_locale', value: 'en', type: 'string' },
  { key: 'available_locales', value: '["en","ar","fr","es","de"]', type: 'json' },
]

async function main() {
  console.log('Seeding database...')

  // Clear existing data
  await db.projectTranslation.deleteMany()
  await db.translation.deleteMany()
  await db.pageSectionTranslation.deleteMany()
  await db.pageTranslation.deleteMany()
  await db.pageSection.deleteMany()
  await db.page.deleteMany()
  await db.contactSubmission.deleteMany()
  await db.media.deleteMany()
  await db.setting.deleteMany()
  await db.project.deleteMany()

  // Create projects
  for (const project of projects) {
    await db.project.create({
      data: {
        slug: project.slug,
        imageUrl: project.imageUrl,
        externalUrl: project.url || null,
        category: project.category,
        featured: project.featured,
        published: true,
        tags: project.tags,
        views: project.views,
        order: project.order,
        translations: {
          create: locales.map((locale) => ({
            locale,
            name: projectTranslations[project.slug]?.[locale]?.name ?? project.slug,
            tagline: projectTranslations[project.slug]?.[locale]?.tagline ?? '',
            description: projectTranslations[project.slug]?.[locale]?.description ?? '',
          })),
        },
      },
    })
    console.log(`  ✓ Project: ${project.slug}`)
  }

  // Create UI translations
  let translationCount = 0
  for (const [key, values] of Object.entries(translations)) {
    for (const locale of locales) {
      if (values[locale]) {
        await db.translation.upsert({
          where: { key_locale: { key, locale } },
          update: { value: values[locale] },
          create: { key, locale, value: values[locale] },
        })
        translationCount++
      }
    }
  }
  console.log(`  ✓ ${translationCount} translations`)

  // Create settings
  for (const setting of settings) {
    await db.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: { key: setting.key, value: setting.value, type: setting.type },
    })
  }
  console.log(`  ✓ Settings`)

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
