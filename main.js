/**
 * frevector.com - Frontend Logic
 * v2026031401 - Revisions: mobile layout, our-picks arrows, category spacing
 */

const EXTRA_KEYWORDS = ['free jpeg', 'free', 'jpeg', 'fre'];
const VECTOR_KEYWORDS = ['free vector', 'free svg', 'free svg icon', 'free jpeg', 'vector jpeg', 'svg'];

const CATEGORIES = [
    'Icon', 'Logo', 'Abstract', 'Animals', 'The Arts', 'Backgrounds', 'Business', 'Buildings', 'Celebrities',
    'Drink', 'Education', 'Fashion', 'Food', 'Font', 'Holidays', 'Industrial', 'Interiors', 'Medical',
    'Miscellaneous', 'Nature', 'Objects', 'Outdoor', 'People', 'Religion', 'Science', 'Sports',
    'Symbols', 'Technology', 'Transportation', 'Vintage'
];

const MODAL_CONTENTS = {
    about: {
        title: 'About Us',
        content: `
            <h2 style="margin-bottom:16px;">About Us</h2>
            <p style="margin-bottom:12px;">Frevector.com is an independent design platform established to provide access to original resources in the field of graphic design.</p>
            <p style="margin-bottom:12px;">The platform is managed by a team producing within its own in-house studio. All designs on the site are created exclusively by Frevector artists. Content is never sourced, copied, or rearranged from other platforms. Each work is built from scratch and undergoes an original production process.</p>
            <p style="margin-bottom:12px;">Every design is shared only after passing through the stages of idea development, sketching, vector editing, technical adjustments, and quality control. Our goal is to create a growing graphic archive that can be used with confidence over time.</p>
            <p style="margin-bottom:12px;">Frevector.com includes the following content:</p>
            <ul style="margin-left:20px;margin-bottom:12px;">
                <li>Vector illustrations</li>
                <li>Icon sets</li>
                <li>Logo design elements</li>
                <li>Graphic elements</li>
                <li>Various design resources</li>
            </ul>
            <p style="margin-bottom:12px;">All files can be used in both personal and commercial projects.</p>
            <p style="margin-bottom:12px;"><strong>Our only rule is this:</strong> Files cannot be redistributed, uploaded to other platforms, sold, or reshared as part of a package.</p>
            <p>Frevector is a platform that values labor, original production, and an ethical approach to design.</p>
        `
    },

    terms: {
        title: 'Terms of Service',
        content: `
            <h2 style="margin-bottom:16px;">Terms of Service</h2>
            <p style="margin-bottom:12px;">Every visitor using Frevector.com is deemed to have accepted the following terms.</p>
            <h3 style="margin-bottom:8px;margin-top:16px;">1. Content Ownership</h3>
            <p style="margin-bottom:12px;">All graphic designs on the site are original works prepared by Frevector artists. All rights belong to Frevector.</p>
            <h3 style="margin-bottom:8px;margin-top:16px;">2. Right of Use</h3>
            <p style="margin-bottom:12px;">Downloaded files can be used in personal and commercial projects. The user may edit the files for their own projects and incorporate them into their work.</p>
            <h3 style="margin-bottom:8px;margin-top:16px;">3. Prohibited Uses</h3>
            <p style="margin-bottom:8px;">The following actions are prohibited:</p>
            <ul style="margin-left:20px;margin-bottom:12px;">
                <li>Redistributing files</li>
                <li>Uploading to other sites</li>
                <li>Selling files digitally or physically</li>
                <li>Sharing as an archive, package, or collection</li>
                <li>Presenting Frevector content as a resource on other platforms</li>
            </ul>
            <h3 style="margin-bottom:8px;margin-top:16px;">4. Liability</h3>
            <p style="margin-bottom:12px;">Frevector cannot be held responsible for any direct or indirect damages arising from the use of the content. Technical malfunctions or temporary access issues may occur on the platform from time to time.</p>
            <h3 style="margin-bottom:8px;margin-top:16px;">5. Right to Change</h3>
            <p style="margin-bottom:16px;">Frevector reserves the right to update the terms of service and site content as necessary.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
            <h3 style="margin-bottom:8px;">License Description</h3>
            <p style="margin-bottom:8px;">All designs on Frevector are original works prepared by Frevector artists.</p>
            <p style="margin-bottom:8px;"><strong>Usage Permission:</strong></p>
            <ul style="margin-left:20px;margin-bottom:12px;">
                <li>Can be used in personal projects</li>
                <li>Can be used in commercial projects</li>
                <li>Can be edited and integrated into projects</li>
            </ul>
            <p style="margin-bottom:8px;"><strong>Prohibitions:</strong></p>
            <ul style="margin-left:20px;margin-bottom:12px;">
                <li>Sharing files as-is</li>
                <li>Redistribution</li>
                <li>Selling</li>
                <li>Presenting as a resource on other sites</li>
                <li>Sharing within bulk content archives</li>
            </ul>
            <p>The Frevector license allows designs to be used in end-user projects. It does not allow the sharing of the file itself.</p>
        `
    },
    contact: {
        title: 'Contact',
        content: `
            <h2 style="margin-bottom:16px;">Contact</h2>
            <p style="margin-bottom:12px;">If you have any questions or feedback regarding Frevector.com, please get in touch with us.</p>
            <p style="margin-bottom:16px;"><strong>Email:</strong> <a href="mailto:hakankacar2014@gmail.com" style="color:#000;text-decoration:underline;">hakankacar2014@gmail.com</a></p>
            <p style="margin-bottom:16px;">Frevector prioritizes clear and transparent communication with its users.</p>
            <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
            <h3 style="margin-bottom:8px;">Copyright Notice</h3>
            <p style="margin-bottom:12px;">Frevector values original production and respects copyrights. The content on the site has been prepared by Frevector artists. Nevertheless, if you believe that any content infringes your copyright, please contact us.</p>
            <p style="margin-bottom:8px;">The notification must include the following:</p>
            <ul style="margin-left:20px;margin-bottom:12px;">
                <li>Information proving you are the copyright owner</li>
                <li>A link to the content you believe is infringing</li>
                <li>Your contact information</li>
                <li>A statement regarding the accuracy of your claim</li>
            </ul>
            <p style="margin-bottom:12px;">Upon review, if deemed appropriate, the relevant content will be removed.</p>
            <p><strong>Contact:</strong> <a href="mailto:hakankacar2014@gmail.com" style="color:#000;text-decoration:underline;">hakankacar2014@gmail.com</a></p>
            <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
            <h3 style="margin-bottom:8px;">Frequently Asked Questions</h3>
            <p style="margin-bottom:6px;"><strong>1. Are the files free?</strong><br>Yes. Files can be used for free in personal and commercial projects.</p>
            <p style="margin-bottom:6px;"><strong>2. Can I sell the files?</strong><br>No. Selling or redistributing the files is prohibited.</p>
            <p style="margin-bottom:6px;"><strong>3. Can I use the files for my clients?</strong><br>Yes. They can be used in commercial projects. However, the file itself cannot be provided as a separate product.</p>
            <p><strong>4. Can I upload the files to another site?</strong><br>No. Redistribution is not permitted.</p>
        `
    },
    privacy: {
        title: 'Privacy Policy',
        content: `
            <h2 style="margin-bottom:16px;">Privacy Policy</h2>
            <p style="margin-bottom:12px;">At Frevector.com, we respect your privacy and are committed to protecting any information we may collect while operating our website.</p>
            <h3 style="margin-bottom:8px;margin-top:16px;">1. Information We Collect</h3>
            <p style="margin-bottom:12px;">We do not require registration or personal information to download files. However, like most websites, we collect non-personally-identifying information such as browser type, language preference, and the date and time of each visitor request.</p>
            <h3 style="margin-bottom:8px;margin-top:16px;">2. Cookies</h3>
            <p style="margin-bottom:12px;">We use cookies to help us identify and track visitors, their usage of Frevector.com, and their website access preferences. We also use third-party cookies from Google AdSense to serve advertisements based on a user's prior visits to our website or other websites.</p>
            <h3 style="margin-bottom:8px;margin-top:16px;">3. Advertisements</h3>
            <p style="margin-bottom:12px;">Ads appearing on our website may be delivered to users by advertising partners, who may set cookies. These cookies allow the ad server to recognize your computer each time they send you an online advertisement to compile information about you or others who use your computer.</p>
            <h3 style="margin-bottom:8px;margin-top:16px;">4. Analytics</h3>
            <p style="margin-bottom:12px;">We may use third-party service providers like Google Analytics to monitor and analyze the use of our service.</p>
            <h3 style="margin-bottom:8px;margin-top:16px;">5. External Links</h3>
            <p style="margin-bottom:12px;">Our website may contain links to external sites that are not operated by us. We strongly advise you to review the Privacy Policy of every site you visit.</p>
            <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:hakankacar2014@gmail.com">hakankacar2014@gmail.com</a>.</p>
        `
    }
};

const state = {
    vectors: [],
    currentPage: 1,
    totalPages: 1,
    total: 0,
    selectedCategory: 'all',
    selectedType: 'all',
    searchQuery: '',
    isLoading: false,
    openedVector: null,
    openedCardEl: null,
    countdownInterval: null,
    detailPanelOpen: false,
    downloadInProgress: false,
    // REVİZYON 3: Our Picks kaydırma durumu
    ourPicksOffset: 0,
    ourPicksVectors: []
};


// GÖREV 9: Inject JSON-LD schema.org
function injectSchema(v) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": v.title || "",
        "description": v.description || "",
        "image": v.thumbnail || "",
        "category": v.category || "",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
        }
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
}

function init() {
    setupCategories();
    setupEventListeners();
    setupModalHandlers();
    setupDownloadPageHandlers();
    setupOurPicksArrows();
    updateSEOBlock();

    window.onpopstate = (event) => {
        if (location.pathname.startsWith("/details/")) {
            const slug = location.pathname.split("/details/")[1].split("?")[0];
            const match = state.vectors.find(v => v.name === slug);
            if (match) openDetailPanel(match);
        } else {
            closeDetailPanel();
        }
    };

    fetchVectors().then(() => {
        if (location.pathname.startsWith("/details/")) {
            const slug = location.pathname.split("/details/")[1].split("?")[0];
            const match = state.vectors.find(v =>
                v.name === slug || (v.name && v.name.toLowerCase().replace(/\s+/g, "-") === slug)
            );
            if (match) {
                // DOM'un render edilmesi için kısa bir süre bekle
                setTimeout(() => {
                    const grid = document.getElementById("vectorsGrid");
                    if (!grid) return;
                    
                    // Önce mevcut kartlar arasında ara
                    let cardEl = Array.from(grid.children)
                        .find(el => el.querySelector(".vc-img")?.alt === match.title);
                    
                    // Eğer kart bulunamazsa (farklı sayfada olabilir), ilk kartı referans al veya sanal bir kart oluşturma mantığı yerine direkt aç
                    if (cardEl) {
                        openDetailPanel(match, cardEl);
                        cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    } else {
                        // Kart bulunamadıysa bile paneli açmak için ilk kartı kullan (grid boş değilse)
                        if (grid.children.length > 0) {
                            openDetailPanel(match, grid.children[0]);
                        }
                    }
                }, 200);
            }
        }
    });
}

function setupCategories() {
    const list = document.getElementById('categoriesList');
    if (!list) return;
    list.innerHTML = '';

    // TYPE section removed as per requirement June 2026

    const allLink = document.createElement('a');
    allLink.href = '#';
    allLink.className = 'category-item' + (state.selectedCategory === 'all' ? ' active' : '');
    allLink.dataset.cat = 'all';
    allLink.textContent = 'All Categories';
    allLink.onclick = (e) => { e.preventDefault(); selectCategory('all'); };
    list.appendChild(allLink);

    CATEGORIES.forEach(cat => {
        const a = document.createElement('a');
        a.href = '#';
        a.className = 'category-item' + (state.selectedCategory === cat ? ' active' : '');
        a.dataset.cat = cat;
        a.textContent = cat;
        a.onclick = (e) => { e.preventDefault(); selectCategory(cat); };
        list.appendChild(a);
    });
}

function selectCategory(cat) {
    state.selectedCategory = cat;
    state.currentPage = 1;
    state.searchQuery = '';
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    closeDetailPanel();
    setupCategories();
    updateCategoryTitle();
    updateSEOBlock();
    fetchVectors();
}

function selectType(type) {
    state.selectedType = type;
    state.currentPage = 1;
    state.searchQuery = '';
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    closeDetailPanel();
    setupCategories();
    updateCategoryTitle();
    fetchVectors();
}

function updateCategoryTitle() {
    const el = document.getElementById('categoryTitle');
    if (!el) return;
    
    // Generate H1 title based on selected category
    let h1Text = '';
    if (state.selectedCategory === 'all') {
        h1Text = 'Free Vectors, SVGs, Icons and Clipart';
    } else {
        h1Text = `Free ${state.selectedCategory} Vectors, SVGs, Icons and Clipart`;
    }
    
    el.textContent = h1Text;
}

// GÖREV 1: Kategori bazlı dinamik SEO metin bloğu
const CATEGORY_SEO_DATA = {
    'all': {
        title: 'Free Vector Graphics for Everyone',
        p1: 'Welcome to frevector.com — your go-to free resource for high-quality vector graphics, SVG files, and JPEG illustrations. Whether you are a graphic designer, web developer, marketing professional, or student, our constantly growing library of free vectors is ready for you to download and use in both personal and commercial projects.',
        p2: 'Browse thousands of fully scalable vector assets organized by category. From flat icons and geometric patterns to detailed illustrations and decorative backgrounds — frevector.com has the design resources you need. Every file is available in SVG and JPEG formats, ensuring perfect quality at any size. No registration, no subscription, no hidden fees. Just search, preview, and download instantly.',
        p3: 'Our library is updated regularly with fresh content across all categories. All files are free to use under a personal and commercial license. Looking for something specific? Use the search bar or browse by category to find exactly what your project needs.',
        popularCats: ['Icons & UI Elements', 'Patterns & Textures', 'Backgrounds & Wallpapers', 'Logos & Symbols']
    },
    'Icon': {
        title: 'Free Icon Vector Graphics — SVG & JPEG Downloads',
        p1: 'Explore our extensive collection of free icon vectors designed for web, mobile, and print applications. From minimal line icons to bold filled symbols, our icon library covers every interface need — navigation arrows, social media glyphs, e-commerce symbols, and much more.',
        p2: 'Each icon vector is crafted for pixel-perfect clarity at any resolution. Whether you are building a mobile app, designing a website, or creating a presentation, these scalable SVG icons adapt seamlessly to your layout. Download in SVG for full scalability or JPEG for quick embedding — all completely free.',
        p3: 'Our icon collection spans hundreds of categories including technology, communication, business, and lifestyle. New icon sets are added regularly, ensuring you always have fresh, modern assets at your fingertips. No attribution required for personal or commercial use.',
        popularCats: ['UI Elements', 'Technology Icons', 'Business Symbols', 'Social Media Icons']
    },
    'Logo': {
        title: 'Free Logo Vector Elements — SVG & JPEG Downloads',
        p1: 'Discover a rich collection of free logo vector elements including abstract marks, monogram designs, badge templates, and brand identity components. These vectors are ideal starting points for creating unique brand identities or as decorative elements for existing logo designs.',
        p2: 'Logo design demands precision and scalability — qualities that vector format delivers perfectly. Our logo vectors are built for use across business cards, digital displays, vehicle wraps, and embroidered patches. Customize colors, adjust proportions, and combine elements to craft a logo that truly represents your brand.',
        p3: 'All logo vectors are free for commercial use, making them accessible to freelancers, agencies, and in-house design teams. The collection includes geometric marks, typographic treatments, emblem designs, and abstract symbols — each crafted with professional attention to detail.',
        popularCats: ['Symbols', 'Business', 'Abstract', 'Badges & Emblems']
    },
    'Abstract': {
        title: 'Free Abstract Vector Graphics — SVG & JPEG Downloads',
        p1: 'Immerse yourself in our collection of free abstract vector graphics featuring geometric compositions, fluid shapes, gradient meshes, and artistic patterns. Abstract vectors are the backbone of modern graphic design — perfect for backgrounds, branding, editorial layouts, and digital art.',
        p2: 'Each abstract vector is fully scalable and editable, allowing you to customize colors, scale shapes, and blend elements to match your creative vision. Whether you need a striking poster background, a dynamic web banner, or a unique packaging design, our abstract library delivers endless inspiration.',
        p3: 'Our abstract collection is continuously updated with contemporary styles including low-poly art, glitch effects, neon gradients, and minimalist geometry. All files are free for personal and commercial projects with no registration required.',
        popularCats: ['Backgrounds', 'Patterns', 'Geometric', 'Gradients']
    },
    'Animals': {
        title: 'Free Animal Vector Graphics — SVG & JPEG Downloads',
        p1: 'Browse our charming collection of free animal vector graphics featuring wildlife illustrations, pet portraits, cartoon characters, and nature-inspired designs. From majestic lions and playful dogs to exotic birds and marine creatures, our animal library covers the entire animal kingdom.',
        p2: 'Animal vectors are perfect for children\'s books, educational materials, wildlife branding, pet care businesses, and nature-themed projects. Each illustration is crafted with expressive detail and is available in fully scalable SVG format, ensuring crisp quality at any size.',
        p3: 'Whether you need a realistic wildlife illustration or a cute cartoon mascot, our animal collection offers diverse styles to suit every project. All vectors are free for commercial use — ideal for logos, stickers, apparel prints, and digital content.',
        popularCats: ['Wildlife', 'Pets', 'Birds', 'Marine Life']
    },
    'Backgrounds': {
        title: 'Free Background Vector Graphics — SVG & JPEG Downloads',
        p1: 'Transform your designs with our extensive collection of free background vectors. From subtle textures and geometric patterns to vibrant gradients and atmospheric landscapes, our background library provides the perfect foundation for any creative project.',
        p2: 'Background vectors are essential for web design, presentation slides, social media graphics, and print materials. Our collection includes seamless patterns for repeating tiles, full-bleed illustrations for hero sections, and abstract compositions for modern branding — all available in scalable SVG format.',
        p3: 'Regularly updated with seasonal themes, trending styles, and timeless classics, our background collection ensures you always have fresh design assets. Download any background vector for free and use it in personal or commercial projects without restrictions.',
        popularCats: ['Patterns & Textures', 'Gradients', 'Nature Scenes', 'Abstract']
    },
    'Business': {
        title: 'Free Business Vector Graphics — SVG & JPEG Downloads',
        p1: 'Elevate your professional presentations and marketing materials with our free business vector graphics. The collection includes corporate icons, infographic elements, office illustrations, financial charts, and team collaboration visuals — everything a business communicator needs.',
        p2: 'Business vectors are designed for clarity and professionalism, making them ideal for annual reports, pitch decks, website design, and corporate branding. Each element is clean, scalable, and easily customizable to match your brand colors and style guidelines.',
        p3: 'From startup branding to enterprise communications, our business vector library supports every professional context. All files are free for commercial use, giving businesses of all sizes access to high-quality design assets without licensing fees.',
        popularCats: ['Corporate Icons', 'Infographics', 'Finance', 'Office & Workspace']
    },
    'Celebrities': {
        title: 'Free Celebrity Vector Illustrations — SVG & JPEG Downloads',
        p1: 'Explore our collection of free celebrity vector illustrations featuring stylized portraits, pop culture icons, and entertainment-themed graphics. These vectors capture the essence of famous figures through artistic interpretation, making them ideal for fan art, editorial design, and pop culture projects.',
        p2: 'Celebrity vectors are popular choices for magazine layouts, event posters, social media content, and entertainment branding. Each illustration is crafted in a distinctive artistic style that balances likeness with creative expression.',
        p3: 'All celebrity vectors are free for personal and editorial use. Our collection is regularly updated with new portraits and pop culture references, keeping your design toolkit current and culturally relevant.',
        popularCats: ['Entertainment', 'Music', 'Sports Stars', 'Pop Culture']
    },
    'Drink': {
        title: 'Free Drink Vector Graphics — SVG & JPEG Downloads',
        p1: 'Quench your design thirst with our free drink vector graphics collection. Featuring everything from steaming coffee cups and refreshing cocktails to craft beer illustrations and smoothie bowls, our drink library is perfect for food and beverage brands, restaurant menus, and lifestyle content.',
        p2: 'Drink vectors are essential assets for café branding, bar menus, food blogs, and packaging design. Each illustration is crafted with appetizing detail and is available in scalable SVG format, ensuring your beverage graphics look crisp on menus, signage, and digital platforms.',
        p3: 'Whether you need a minimalist coffee icon for a café app or a detailed cocktail illustration for a bar menu, our drink collection delivers. All vectors are free for commercial use — perfect for hospitality businesses, food bloggers, and beverage brands.',
        popularCats: ['Coffee & Tea', 'Cocktails & Spirits', 'Soft Drinks', 'Food & Drink']
    },
    'Education': {
        title: 'Free Education Vector Graphics — SVG & JPEG Downloads',
        p1: 'Inspire learning with our free education vector graphics collection. Featuring school supplies, academic icons, graduation elements, science equipment, and classroom illustrations, our education library supports teachers, students, and educational publishers alike.',
        p2: 'Education vectors are perfect for school websites, e-learning platforms, textbook design, educational apps, and classroom materials. Each graphic is designed for clarity and engagement, helping communicate complex concepts through visual storytelling.',
        p3: 'From kindergarten-friendly illustrations to university-level academic icons, our education collection spans all learning levels. All vectors are free for commercial use, making quality design accessible to educational institutions and content creators worldwide.',
        popularCats: ['School Supplies', 'Science & Lab', 'Graduation', 'E-Learning']
    },
    'Fashion': {
        title: 'Free Fashion Vector Graphics — SVG & JPEG Downloads',
        p1: 'Stay on trend with our free fashion vector graphics collection. Featuring clothing illustrations, accessory designs, runway silhouettes, beauty icons, and style-forward patterns, our fashion library is the go-to resource for apparel brands, fashion bloggers, and style publications.',
        p2: 'Fashion vectors are essential for lookbook design, clothing catalogs, fashion week materials, and lifestyle branding. Each illustration captures the elegance and dynamism of the fashion world, available in scalable SVG format for flawless reproduction across all media.',
        p3: 'From minimalist wardrobe icons to elaborate haute couture illustrations, our fashion collection covers every style aesthetic. All vectors are free for commercial use — perfect for boutiques, fashion designers, and style-focused content creators.',
        popularCats: ['Clothing & Apparel', 'Accessories', 'Beauty & Cosmetics', 'Lifestyle']
    },
    'Food': {
        title: 'Free Food Vector Graphics — SVG & JPEG Downloads',
        p1: 'Satisfy your design appetite with our free food vector graphics collection. Featuring mouth-watering illustrations of cuisines from around the world — from artisan pizzas and fresh salads to exotic street food and gourmet desserts — our food library is a feast for the eyes.',
        p2: 'Food vectors are indispensable for restaurant menus, food blogs, recipe websites, packaging design, and culinary branding. Each illustration is crafted with appetizing detail and is available in scalable SVG format, ensuring your food graphics look delicious on any medium.',
        p3: 'Whether you need a simple fruit icon for a health app or a detailed restaurant illustration for a menu cover, our food collection delivers. All vectors are free for commercial use — ideal for restaurants, food brands, and culinary content creators.',
        popularCats: ['Fruits & Vegetables', 'Restaurant & Dining', 'Snacks & Desserts', 'Drink']
    },
    'Font': {
        title: 'Free Font & Typography Vector Graphics — SVG & JPEG Downloads',
        p1: 'Explore our collection of free font and typography vector graphics featuring decorative lettering, calligraphic elements, alphabet sets, and typographic ornaments. These vectors are ideal for creating custom titles, logotypes, signage, and editorial layouts with a distinctive typographic flair.',
        p2: 'Typography vectors give designers the flexibility to craft unique text treatments without relying on installed fonts. Use them for poster headlines, wedding invitations, brand wordmarks, and social media graphics — all scalable to any size without quality loss.',
        p3: 'Our font and typography collection includes hand-lettered scripts, bold display styles, vintage signage alphabets, and modern geometric letterforms. All vectors are free for commercial use, empowering typographers and designers to push creative boundaries.',
        popularCats: ['Calligraphy', 'Display & Decorative', 'Alphabet Sets', 'Ornaments']
    },
    'Holidays': {
        title: 'Free Holiday Vector Graphics — SVG & JPEG Downloads',
        p1: 'Celebrate every occasion with our free holiday vector graphics collection. Featuring festive illustrations for Christmas, Halloween, Easter, New Year, Valentine\'s Day, and dozens of other holidays and cultural celebrations, our holiday library keeps your designs seasonally fresh.',
        p2: 'Holiday vectors are essential for greeting cards, seasonal marketing campaigns, event invitations, social media posts, and festive packaging. Each illustration captures the spirit of the season with vibrant colors and joyful compositions.',
        p3: 'From cozy Christmas scenes and spooky Halloween graphics to romantic Valentine\'s motifs and patriotic Independence Day designs, our holiday collection covers the entire calendar year. All vectors are free for commercial use.',
        popularCats: ['Christmas', 'Halloween', 'Valentine\'s Day', 'New Year']
    },
    'Medical': {
        title: 'Free Medical Vector Graphics — SVG & JPEG Downloads',
        p1: 'Support healthcare communication with our free medical vector graphics collection. Featuring anatomical illustrations, medical equipment icons, healthcare symbols, pharmaceutical graphics, and wellness imagery, our medical library serves healthcare professionals, publishers, and health-focused brands.',
        p2: 'Medical vectors are essential for hospital websites, health apps, medical publications, pharmaceutical branding, and patient education materials. Each graphic is designed for clarity and accuracy, helping communicate complex health information visually.',
        p3: 'From simple first-aid icons to detailed anatomical diagrams, our medical collection covers the full spectrum of healthcare design needs. All vectors are free for commercial use, making professional medical illustration accessible to organizations of all sizes.',
        popularCats: ['Healthcare Icons', 'Anatomy', 'Pharmacy', 'Wellness']
    },
    'Miscellaneous': {
        title: 'Free Miscellaneous Vector Graphics — SVG & JPEG Downloads',
        p1: 'Discover a diverse collection of free miscellaneous vector graphics that defy easy categorization. This eclectic library includes unique illustrations, novelty designs, decorative elements, and creative assets that add unexpected character to any project.',
        p2: 'Miscellaneous vectors are the wildcards of the design world — perfect when you need something distinctive that stands apart from conventional categories. Use them for editorial illustrations, creative packaging, unique social media content, and experimental branding.',
        p3: 'Our miscellaneous collection is a treasure trove of creative surprises, regularly updated with one-of-a-kind designs. All vectors are free for personal and commercial use, giving designers the freedom to explore unconventional creative directions.',
        popularCats: ['Decorative Elements', 'Novelty', 'Objects', 'Abstract']
    },
    'Nature': {
        title: 'Free Nature Vector Graphics — SVG & JPEG Downloads',
        p1: 'Connect with the natural world through our free nature vector graphics collection. Featuring lush botanical illustrations, dramatic landscape scenes, weather phenomena, seasonal foliage, and organic textures, our nature library brings the beauty of the outdoors to your designs.',
        p2: 'Nature vectors are perfect for eco-friendly branding, wellness products, outdoor lifestyle campaigns, environmental publications, and botanical art prints. Each illustration captures the organic beauty of the natural world in fully scalable vector format.',
        p3: 'From delicate wildflower arrangements and majestic mountain landscapes to tropical rainforest scenes and serene ocean views, our nature collection spans every biome and season. All vectors are free for commercial use.',
        popularCats: ['Botanical & Plants', 'Landscapes', 'Weather', 'Animals']
    },
    'Objects': {
        title: 'Free Object Vector Graphics — SVG & JPEG Downloads',
        p1: 'Find the perfect free object vector for any design project. Our objects collection features everyday items, household goods, tools, gadgets, furniture, and decorative pieces — all rendered as clean, scalable vector illustrations ready for immediate use.',
        p2: 'Object vectors are invaluable for e-commerce product illustrations, instructional diagrams, app interfaces, and editorial design. Each illustration is crafted for visual clarity, making complex objects immediately recognizable at any scale.',
        p3: 'From kitchen utensils and office supplies to vintage collectibles and modern electronics, our objects collection covers the full spectrum of everyday life. All vectors are free for personal and commercial use with no registration required.',
        popularCats: ['Household Items', 'Tools & Equipment', 'Electronics', 'Furniture']
    },
    'Outdoor': {
        title: 'Free Outdoor Vector Graphics — SVG & JPEG Downloads',
        p1: 'Embrace the great outdoors with our free outdoor vector graphics collection. Featuring adventure sports, camping scenes, hiking trails, extreme activities, and outdoor lifestyle imagery, our outdoor library is perfect for adventure brands, travel companies, and active lifestyle content.',
        p2: 'Outdoor vectors capture the spirit of exploration and adventure, making them ideal for sports equipment branding, travel apps, outdoor event posters, and adventure tourism marketing. Each illustration conveys energy and movement in crisp, scalable vector format.',
        p3: 'From mountain climbing and kayaking to beach volleyball and cycling, our outdoor collection covers every adventure activity. All vectors are free for commercial use — perfect for sports brands, travel bloggers, and outdoor enthusiasts.',
        popularCats: ['Adventure Sports', 'Camping & Hiking', 'Water Sports', 'Nature']
    },
    'People': {
        title: 'Free People Vector Graphics — SVG & JPEG Downloads',
        p1: 'Humanize your designs with our free people vector graphics collection. Featuring diverse character illustrations, professional silhouettes, lifestyle scenes, team collaboration visuals, and cultural representations, our people library brings authentic human stories to your creative projects.',
        p2: 'People vectors are essential for corporate presentations, diversity and inclusion campaigns, social media content, educational materials, and healthcare communications. Each illustration is crafted to represent a wide range of ages, backgrounds, and activities.',
        p3: 'From business professionals and medical workers to students, athletes, and families, our people collection celebrates human diversity. All vectors are free for commercial use, making inclusive design accessible to every creator.',
        popularCats: ['Business Professionals', 'Families & Children', 'Sports & Fitness', 'Diversity & Inclusion']
    },
    'Science': {
        title: 'Free Science Vector Graphics — SVG & JPEG Downloads',
        p1: 'Illuminate complex concepts with our free science vector graphics collection. Featuring laboratory equipment, molecular structures, astronomical illustrations, physics diagrams, chemistry symbols, and biological specimens, our science library supports researchers, educators, and science communicators.',
        p2: 'Science vectors are perfect for academic publications, educational websites, science museum exhibits, STEM learning materials, and research presentations. Each illustration combines scientific accuracy with visual clarity to make complex ideas accessible.',
        p3: 'From microscopic cell structures to vast cosmic landscapes, our science collection spans every scientific discipline. All vectors are free for commercial use, supporting science education and communication at every level.',
        popularCats: ['Biology & Medicine', 'Chemistry', 'Physics & Space', 'Technology']
    },
    'Sports': {
        title: 'Free Sports Vector Graphics — SVG & JPEG Downloads',
        p1: 'Score big with our free sports vector graphics collection. Featuring dynamic athlete illustrations, sports equipment icons, team emblems, stadium scenes, and action-packed compositions across dozens of sports disciplines — from football and basketball to tennis and swimming.',
        p2: 'Sports vectors are essential for team branding, sports event posters, fitness app design, athletic wear graphics, and sports journalism. Each illustration captures the energy and dynamism of athletic competition in crisp, scalable vector format.',
        p3: 'Whether you need a simple football icon for a sports app or a detailed stadium illustration for an event poster, our sports collection delivers. All vectors are free for commercial use — perfect for sports organizations, fitness brands, and athletic content creators.',
        popularCats: ['Ball Sports', 'Athletics & Track', 'Water Sports', 'Outdoor']
    },
    'Symbols': {
        title: 'Free Symbol Vector Graphics — SVG & JPEG Downloads',
        p1: 'Communicate universally with our free symbol vector graphics collection. Featuring international signs, cultural emblems, religious symbols, mathematical notation, warning icons, and universal pictograms, our symbols library transcends language barriers.',
        p2: 'Symbol vectors are essential for wayfinding systems, international communications, cultural publications, educational materials, and universal design projects. Each symbol is crafted for maximum clarity and immediate recognition across diverse audiences.',
        p3: 'From traffic signs and safety symbols to cultural emblems and mathematical operators, our symbols collection covers the full spectrum of visual communication. All vectors are free for commercial use, supporting clear and universal design worldwide.',
        popularCats: ['Signs & Wayfinding', 'Cultural & Religious', 'Mathematical', 'Logo']
    },
    'Technology': {
        title: 'Free Technology Vector Graphics — SVG & JPEG Downloads',
        p1: 'Power up your designs with our free technology vector graphics collection. Featuring computer hardware, mobile devices, circuit board patterns, cybersecurity icons, artificial intelligence visuals, and digital interface elements, our tech library keeps your designs cutting-edge.',
        p2: 'Technology vectors are essential for software company branding, tech startup marketing, cybersecurity communications, app design, and digital innovation campaigns. Each graphic is designed to convey precision, innovation, and forward-thinking in scalable vector format.',
        p3: 'From vintage computing nostalgia to futuristic AI and robotics imagery, our technology collection spans the full arc of digital innovation. All vectors are free for commercial use — perfect for tech companies, developers, and digital content creators.',
        popularCats: ['Computers & Devices', 'Cybersecurity', 'AI & Robotics', 'Science']
    },
    'The Arts': {
        title: 'Free Arts & Culture Vector Graphics — SVG & JPEG Downloads',
        p1: 'Celebrate creativity with our free arts and culture vector graphics collection. Featuring fine art references, musical instruments, theatrical imagery, dance illustrations, film and cinema graphics, and cultural heritage designs, our arts library honors human creative expression.',
        p2: 'Arts vectors are perfect for cultural institution branding, event posters, music venue design, arts education materials, and creative industry communications. Each illustration captures the passion and artistry of human cultural achievement.',
        p3: 'From classical music and ballet to street art and contemporary performance, our arts collection spans the full spectrum of human creativity. All vectors are free for commercial use, supporting arts organizations and creative professionals worldwide.',
        popularCats: ['Music & Instruments', 'Visual Arts', 'Performing Arts', 'Film & Cinema']
    },
    'Transportation': {
        title: 'Free Transportation Vector Graphics — SVG & JPEG Downloads',
        p1: 'Navigate your designs with our free transportation vector graphics collection. Featuring cars, trucks, motorcycles, aircraft, ships, trains, bicycles, and futuristic vehicles, our transportation library covers every mode of travel from city streets to outer space.',
        p2: 'Transportation vectors are essential for automotive branding, travel app design, logistics company marketing, urban planning materials, and transportation journalism. Each vehicle illustration is crafted with technical detail and stylistic flair in scalable vector format.',
        p3: 'From vintage automobiles and classic aircraft to electric vehicles and hyperloop concepts, our transportation collection spans the history and future of human mobility. All vectors are free for commercial use.',
        popularCats: ['Automobiles', 'Aviation', 'Maritime', 'Urban Transport']
    },
    'Industrial': {
        title: 'Free Industrial Vector Graphics — SVG & JPEG Downloads',
        p1: 'Build stronger designs with our free industrial vector graphics collection. Featuring factory machinery, construction equipment, engineering tools, manufacturing processes, and heavy industry imagery, our industrial library supports engineering firms, construction companies, and industrial brands.',
        p2: 'Industrial vectors are perfect for safety training materials, engineering publications, manufacturing company websites, construction project presentations, and industrial equipment catalogs. Each illustration combines technical accuracy with visual impact.',
        p3: 'From precision engineering components to large-scale construction machinery, our industrial collection covers the full spectrum of manufacturing and construction design needs. All vectors are free for commercial use.',
        popularCats: ['Construction', 'Manufacturing', 'Engineering Tools', 'Technology']
    },
    'Interiors': {
        title: 'Free Interior Design Vector Graphics — SVG & JPEG Downloads',
        p1: 'Design beautiful spaces with our free interior design vector graphics collection. Featuring furniture illustrations, room layouts, decorative elements, architectural details, and home décor accessories, our interiors library supports interior designers, architects, and home lifestyle brands.',
        p2: 'Interior vectors are perfect for home décor catalogs, interior design portfolios, real estate marketing, furniture brand websites, and lifestyle publications. Each illustration captures the elegance and functionality of well-designed living spaces.',
        p3: 'From minimalist Scandinavian interiors to opulent Art Deco settings, our interiors collection spans every design style and aesthetic. All vectors are free for commercial use — ideal for interior designers, home brands, and lifestyle content creators.',
        popularCats: ['Furniture', 'Home Décor', 'Architecture', 'Lifestyle']
    },
    'Religion': {
        title: 'Free Religion & Spirituality Vector Graphics — SVG & JPEG Downloads',
        p1: 'Honor diverse spiritual traditions with our free religion and spirituality vector graphics collection. Featuring sacred symbols, religious architecture, ceremonial objects, spiritual motifs, and cultural heritage designs from world religions and spiritual traditions.',
        p2: 'Religion vectors are used in faith community communications, religious publication design, cultural heritage projects, interfaith dialogue materials, and spiritual wellness branding. Each illustration is crafted with cultural sensitivity and artistic respect.',
        p3: 'From ancient sacred symbols to contemporary spiritual iconography, our religion collection represents the rich diversity of human spiritual expression. All vectors are free for personal and commercial use.',
        popularCats: ['Sacred Symbols', 'Religious Architecture', 'Ceremonies', 'Symbols']
    },
    'Vintage': {
        title: 'Free Vintage Vector Graphics — SVG & JPEG Downloads',
        p1: 'Travel back in time with our free vintage vector graphics collection. Featuring retro illustrations, antique ornaments, Art Deco patterns, Victorian engravings, mid-century modern designs, and nostalgic Americana, our vintage library adds timeless character to contemporary projects.',
        p2: 'Vintage vectors are perfect for craft brewery branding, artisan product packaging, retro-themed events, antique shop marketing, and nostalgic editorial design. Each illustration captures the distinctive aesthetic of its era with authentic detail.',
        p3: 'From 1920s Art Deco elegance to 1970s psychedelic patterns and 1950s Americana charm, our vintage collection spans a century of design history. All vectors are free for commercial use — perfect for brands seeking timeless, character-rich design assets.',
        popularCats: ['Art Deco', 'Retro & Mid-Century', 'Victorian & Antique', 'Objects']
    },
    'Buildings': {
        title: 'Free Building & Architecture Vector Graphics — SVG & JPEG Downloads',
        p1: 'Construct stunning designs with our free building and architecture vector graphics collection. Featuring iconic landmarks, architectural details, urban skylines, historical buildings, modern structures, and construction site illustrations, our buildings library supports architects, urban planners, and real estate brands.',
        p2: 'Building vectors are essential for real estate marketing, architectural firm portfolios, urban development presentations, travel and tourism content, and city planning materials. Each illustration captures architectural character with precision and artistic flair.',
        p3: 'From ancient temples and medieval castles to modernist skyscrapers and futuristic concept buildings, our architecture collection spans the full history of human construction. All vectors are free for commercial use.',
        popularCats: ['Landmarks', 'Urban Skylines', 'Historical Architecture', 'Outdoor']
    }
};

function updateSEOBlock() {
    const seoSection = document.querySelector('.home-seo-content');
    if (!seoSection) return;

    const cat = state.selectedCategory;
    const data = CATEGORY_SEO_DATA[cat] || CATEGORY_SEO_DATA['all'];
    const total = (state.total > 0) ? state.total : (window.__ssrData && window.__ssrData.totalCount) || 0;
    const totalText = total > 0 ? `Browse <strong>${total.toLocaleString()} free ${cat !== 'all' ? cat.toLowerCase() + ' ' : ''}vector files</strong>` : `Browse <strong>our free vector files</strong>`;

    seoSection.innerHTML = `
        <h2 style="font-size:20px;font-weight:700;margin-bottom:12px;color:#1a5276">${data.title}</h2>
        <p style="font-size:14px;line-height:1.7;margin-bottom:10px">${data.p1}</p>
        <p style="font-size:14px;line-height:1.7;margin-bottom:10px">${data.p2}</p>
        <p style="font-size:14px;line-height:1.7">${data.p3}</p>
        <p style="margin-top:10px;font-size:14px;color:#666;">
            ${totalText} across <strong>25+ categories</strong> — all free for personal and commercial use. No registration required.
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:20px;margin-top:24px">
            <div>
                <h3 style="font-size:16px;font-weight:700;margin-bottom:8px;color:#1a5276">Popular Categories</h3>
                <ul style="font-size:13px;line-height:1.6;margin:0;padding-left:18px">
                    ${data.popularCats.map(c => `<li>${c}</li>`).join('')}
                </ul>
            </div>
            <div>
                <h3 style="font-size:16px;font-weight:700;margin-bottom:8px;color:#1a5276">Why Choose Us?</h3>
                <ul style="font-size:13px;line-height:1.6;margin:0;padding-left:18px">
                    <li>100% Free Downloads</li>
                    <li>Personal &amp; Commercial Use</li>
                    <li>High-Quality SVG &amp; JPEG</li>
                    <li>No Registration Required</li>
                </ul>
            </div>
        </div>
    `;
}

async function fetchVectors() {
    if (state.isLoading) return;
    state.isLoading = true;
    showLoader(true);
    
    // Dim the grid instead of clearing it to provide visual feedback without jumpiness
    const grid = document.getElementById('vectorsGrid');
    if (grid) grid.style.opacity = '0.5';

    try {
        const url = new URL('/api/vectors', window.location.origin);
        
        if (location.pathname.startsWith("/details/")) {
            const slug = location.pathname.split("/details/")[1].split("?")[0];
            url.searchParams.set('fetchAllForSlug', slug);
        }

        url.searchParams.set('page', state.currentPage);
        url.searchParams.set('limit', '24');
        if (state.selectedCategory !== 'all') url.searchParams.set('category', state.selectedCategory);
        // JPEG visibility: JPEG files are stored in Cloudflare bucket but hidden from site display.
        // To re-enable JPEG listings, set HIDE_JPEG = false (or remove the filter).
        // Last updated: June 2026
        const HIDE_JPEG = true;
        if (HIDE_JPEG) {
            url.searchParams.set('type', 'vector');
        } else {
            if (state.selectedType === 'vector') url.searchParams.set('type', 'vector');
            if (state.selectedType === 'jpeg') url.searchParams.set('type', 'jpeg');
        }
        
        // Sıralama filtresini ekle
        const sortFilter = document.getElementById('sortFilter');
        if (sortFilter && sortFilter.value) {
            url.searchParams.set('sort', sortFilter.value);
        }

        if (state.searchQuery) url.searchParams.set('search', state.searchQuery);
        
        const res = await fetch(url);
        if (!res.ok) throw new Error('API request failed');
        
        const data = await res.json();
        state.vectors = data.vectors || [];
        state.totalPages = data.totalPages || 1;
        state.total = data.total || 0;

        renderVectors();
        fetchOurPicksRandomly();
        updatePagination();
        updateSEOBlock();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        console.error('Fetch error:', err);
    } finally {
        state.isLoading = false;
        showLoader(false);
        const grid = document.getElementById('vectorsGrid');
        if (grid) grid.style.opacity = '1';
    }
}

async function fetchOurPicksRandomly() {
    // SSR Fallback: If SSR data was injected, use it first
    if (window.__ssrData && window.__ssrData.ourPicks && window.__ssrData.ourPicks.length > 0) {
        state.ourPicksVectors = window.__ssrData.ourPicks;
        renderOurPicks();
        return;
    }

    try {
        const url = new URL('/api/vectors', window.location.origin);
        url.searchParams.set('limit', '100');
        
        // ÖNEMLİ: API'ye hem kategori hem de tip parametrelerini gönderiyoruz
        if (state.selectedCategory && state.selectedCategory !== 'all') {
            url.searchParams.set('category', state.selectedCategory);
        }
        
        if (state.selectedType === 'vector') {
            url.searchParams.set('type', 'vector');
        } else if (state.selectedType === 'jpeg') {
            url.searchParams.set('type', 'jpeg');
        }
        
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            let picks = data.vectors || [];
            
            // JPEG visibility
            const HIDE_JPEG = true;
            if (HIDE_JPEG) {
                picks = picks.filter(v => !v.isJpegOnly);
            } else {
                if (state.selectedType === 'vector') {
                    picks = picks.filter(v => !v.isJpegOnly);
                } else if (state.selectedType === 'jpeg') {
                    picks = picks.filter(v => v.isJpegOnly);
                }
            }

            // GÖREV 1: Fallback Mekanizması
            // Eğer seçili kategoride yeterli görsel yoksa (örneğin 20'den az), diğer kategorilerden popüler görselleri ekle
            if (picks.length < 20) {
                const fallbackUrl = new URL('/api/vectors', window.location.origin);
                fallbackUrl.searchParams.set('limit', '50'); // Genelden 50 tane çekelim
                if (HIDE_JPEG) fallbackUrl.searchParams.set('type', 'vector');
                
                const fallbackRes = await fetch(fallbackUrl);
                if (fallbackRes.ok) {
                    const fallbackData = await fallbackRes.json();
                    const fallbackVectors = (fallbackData.vectors || []).filter(fv => 
                        !picks.find(pv => pv.name === fv.name) // Mevcutları tekrar ekleme
                    );
                    // Eksik olanı genelden tamamla (toplam 40'a kadar veya bulabildiğin kadar)
                    picks = [...picks, ...fallbackVectors].slice(0, 40);
                }
            }
            
            picks.sort(() => Math.random() - 0.5);
            state.ourPicksVectors = picks;
            renderOurPicks();
        }
    } catch (err) {
        console.error('Our Picks fetch error:', err);
    }
}

function renderVectors() {
    const grid = document.getElementById('vectorsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!state.vectors.length) {
        grid.innerHTML = '<div class="no-results">No results found.</div>';
        return;
    }

    state.vectors.forEach((v, index) => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        if (state.openedVector && state.openedVector.name === v.name) card.classList.add('card-active');
        
        const typeLabel = v.isJpegOnly ? '<span class="vc-type-badge jpeg">JPEG</span>' : '<span class="vc-type-badge vector">VECTOR</span>';

        // İlk 12 görseli eager (hemen), diğerlerini lazy yükle
        const loadingAttr = index < 12 ? 'eager' : 'lazy';
        const fetchPriority = index < 12 ? 'high' : 'low';

        card.innerHTML = `
            <div class="vc-img-wrap">
                <img class="vc-img" src="${v.thumbnail}" alt="${escHtml(v.title)}" loading="${loadingAttr}" fetchpriority="${fetchPriority}" decoding="async" width="300" height="300">
                ${typeLabel}
            </div>
            <div class="vc-info">
                <div class="vc-description">${escHtml(v.description || "")}</div>
                <div class="vc-keywords">${escHtml([...new Set([...(v.keywords || [])])].join(', '))}</div>
            </div>
        `;
        card.onclick = () => openDetailPanel(v, card);
        grid.appendChild(card);
    });
}

// REVİZYON 3: Our Picks - Sonsuz Döngü ve Rastgele Görseller
function renderOurPicks() {
    const track = document.getElementById('ourPicksTrack');
    if (!track) return;
    track.innerHTML = '';
    
    // JPEG visibility: JPEG files are stored in Cloudflare bucket but hidden from site display.
    const HIDE_JPEG = true;
    let filteredPicks = [...state.ourPicksVectors];
    if (HIDE_JPEG) {
        filteredPicks = filteredPicks.filter(v => v.isJpegOnly === false || (typeof v.isJpegOnly === 'undefined' && !v.name.includes('jpeg')));
    } else {
        if (state.selectedType === 'vector') {
            filteredPicks = filteredPicks.filter(v => v.isJpegOnly === false || (typeof v.isJpegOnly === 'undefined' && !v.name.includes('jpeg')));
        } else if (state.selectedType === 'jpeg') {
            filteredPicks = filteredPicks.filter(v => v.isJpegOnly === true || (typeof v.isJpegOnly === 'undefined' && v.name.includes('jpeg')));
        }
    }
    
    if (filteredPicks.length === 0) return;
    
    const displayVectors = [...filteredPicks, ...filteredPicks, ...filteredPicks, ...filteredPicks, ...filteredPicks];
    
    displayVectors.forEach((v, index) => {
        const card = document.createElement('div');
        card.className = 'vector-card';
        const typeLabel = v.isJpegOnly ? '<span class="vc-type-badge jpeg">JPEG</span>' : '<span class="vc-type-badge vector">VECTOR</span>';
        
        // Our Picks için ilk birkaç görseli hızlı yükle, diğerlerini lazy load
        const loadingAttr = index < 15 ? 'eager' : 'lazy';

        card.innerHTML = `
            <div class="vc-img-wrap">
                <img class="vc-img" src="${v.thumbnail}" alt="${escHtml(v.title)}" loading="${loadingAttr}" decoding="async" fetchpriority="${index < 5 ? 'high' : 'auto'}" width="300" height="300">
                ${typeLabel}
            </div>
        `;
        card.onclick = () => {
            // "Our Picks" görselleri için özel davranış: Önce ana ekranda (detay paneli) açılacak
            // scrollIntoView'ı burada engelliyoruz çünkü sayfa kaymasını istemiyoruz
            openDetailPanel(v, null); 
            
            // Detay paneli açıldığında ana ızgaradaki ilgili kartı bulup aktif yapalım (eğer varsa)
            const mainGrid = document.getElementById('vectorsGrid');
            if (mainGrid) {
                const mainCards = mainGrid.querySelectorAll('.vector-card');
                mainCards.forEach(c => c.classList.remove('card-active'));
            }
        };
        track.appendChild(card);
    });

    const cardWidth = window.innerWidth <= 768 ? 70 : 90; 
    state.ourPicksOffset = 2 * filteredPicks.length * cardWidth;
    track.style.transition = 'none';
    track.style.transform = `translateX(-${state.ourPicksOffset}px)`;
}

function setupOurPicksArrows() {
    const prevBtn = document.getElementById('ourPicksPrev');
    const nextBtn = document.getElementById('ourPicksNext');
    const track = document.getElementById('ourPicksTrack');
    const wrap = document.querySelector('.our-picks-track-wrap');

    if (prevBtn && nextBtn) {
        prevBtn.onclick = () => scrollOurPicks(-1);
        nextBtn.onclick = () => scrollOurPicks(1);
    }

    if (!track || !wrap) return;

    // Swipe/Drag functionality with momentum
    let isDown = false;
    let startX;
    let scrollLeft;
    let initialOffset;
    let lastX = 0;
    let lastTime = 0;
    let velocity = 0;
    let momentumAnimationId = null;

    const start = (e) => {
        isDown = true;
        track.style.transition = 'none';
        startX = (e.pageX || e.touches[0].pageX) - wrap.offsetLeft;
        initialOffset = state.ourPicksOffset;
        lastX = startX;
        lastTime = Date.now();
        velocity = 0;
        if (momentumAnimationId) cancelAnimationFrame(momentumAnimationId);
    };

    const end = () => {
        if (!isDown) return;
        isDown = false;
        
        // Calculate velocity for momentum
        const now = Date.now();
        const timeDiff = now - lastTime;
        if (timeDiff > 0) {
            velocity = (lastX - startX) / timeDiff;
        }
        
        // Apply momentum with easing
        applyMomentum(velocity);
        
        // Sonsuz döngü kontrolü
        setTimeout(checkInfiniteScroll, 500);
    };

    const move = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = (e.pageX || e.touches[0].pageX) - wrap.offsetLeft;
        const walk = (x - startX);
        state.ourPicksOffset = initialOffset - walk;
        track.style.transform = `translateX(-${state.ourPicksOffset}px) translateZ(0)`;
        lastX = x;
        lastTime = Date.now();
    };
    
    const applyMomentum = (vel) => {
        const cardWidth = window.innerWidth <= 768 ? 70 : 90;
        const friction = 0.95;
        const minVelocity = 0.1;
        let currentVel = vel;
        
        const animate = () => {
            if (Math.abs(currentVel) > minVelocity) {
                state.ourPicksOffset -= currentVel * 16; // 16ms per frame
                currentVel *= friction;
                track.style.transition = 'none';
                track.style.transform = `translateX(-${state.ourPicksOffset}px) translateZ(0)`;
                momentumAnimationId = requestAnimationFrame(animate);
            } else {
                // Snap to nearest card after momentum ends
                track.style.transition = 'transform 0.3s ease-out';
                state.ourPicksOffset = Math.round(state.ourPicksOffset / cardWidth) * cardWidth;
                track.style.transform = `translateX(-${state.ourPicksOffset}px) translateZ(0)`;
            }
        };
        animate();
    };

    function checkInfiniteScroll() {
        let filteredPicks = [...state.ourPicksVectors];
        if (state.selectedType === 'vector') {
            filteredPicks = filteredPicks.filter(v => v.isJpegOnly === false || (typeof v.isJpegOnly === 'undefined' && !v.name.includes('jpeg')));
        } else if (state.selectedType === 'jpeg') {
            filteredPicks = filteredPicks.filter(v => v.isJpegOnly === true || (typeof v.isJpegOnly === 'undefined' && v.name.includes('jpeg')));
        }
        const cardWidth = window.innerWidth <= 768 ? 70 : 90;
        const singleSetWidth = filteredPicks.length * cardWidth;

        if (state.ourPicksOffset >= 3 * singleSetWidth) {
            state.ourPicksOffset -= singleSetWidth;
            track.style.transition = 'none';
            track.style.transform = `translateX(-${state.ourPicksOffset}px) translateZ(0)`;
        } else if (state.ourPicksOffset <= singleSetWidth) {
            state.ourPicksOffset += singleSetWidth;
            track.style.transition = 'none';
            track.style.transform = `translateX(-${state.ourPicksOffset}px) translateZ(0)`;
        }
    }

    wrap.addEventListener('mousedown', start);
    wrap.addEventListener('touchstart', start, { passive: true });
    
    window.addEventListener('mouseup', end);
    wrap.addEventListener('touchend', end);
    wrap.addEventListener('mouseleave', end);
    
    wrap.addEventListener('mousemove', move);
    wrap.addEventListener('touchmove', move, { passive: false });
}

function scrollOurPicks(direction) {
    const track = document.getElementById('ourPicksTrack');
    if (!track || !state.ourPicksVectors.length) return;

    const isMobile = window.innerWidth <= 768;
    const cardWidth = isMobile ? 70 : 90; 
    const step = (isMobile ? 2 : 3) * cardWidth; 
    
    state.ourPicksOffset += direction * step;
    track.style.transition = 'transform 0.4s ease-out';
    track.style.transform = `translateX(-${state.ourPicksOffset}px) translateZ(0)`;

    let filteredPicks = [...state.ourPicksVectors];
    if (state.selectedType === 'vector') {
        filteredPicks = filteredPicks.filter(v => v.isJpegOnly === false || (typeof v.isJpegOnly === 'undefined' && !v.name.includes('jpeg')));
    } else if (state.selectedType === 'jpeg') {
        filteredPicks = filteredPicks.filter(v => v.isJpegOnly === true || (typeof v.isJpegOnly === 'undefined' && v.name.includes('jpeg')));
    }
    const singleSetWidth = filteredPicks.length * cardWidth;
    
    track.addEventListener('transitionend', function handleTransitionEnd() {
        track.removeEventListener('transitionend', handleTransitionEnd);
        
        if (state.ourPicksOffset >= 3 * singleSetWidth) {
            state.ourPicksOffset -= singleSetWidth;
            track.style.transition = 'none';
            track.style.transform = `translateX(-${state.ourPicksOffset}px) translateZ(0)`;
        } else if (state.ourPicksOffset <= singleSetWidth) {
            state.ourPicksOffset += singleSetWidth;
            track.style.transition = 'none';
            track.style.transform = `translateX(-${state.ourPicksOffset}px) translateZ(0)`;
        }
    });
}

function openDetailPanel(v, cardEl) {
    if (state.openedVector && state.openedVector.name === v.name) {
        closeDetailPanel();
        return;
    }

    closeDetailPanel();
    state.openedVector = v;
    state.openedCardEl = cardEl;
    if (cardEl) cardEl.classList.add('card-active');

    const panel = document.createElement('div');
    panel.id = 'detailPanel';
    panel.className = 'detail-panel';
    
    const keywords = [...new Set([...(v.keywords || [])])];
    
    // REVİZYON: Tip ve Kategori Fallback Mekanizması
    const displayType = v.isJpegOnly ? 'JPEG' : 'Vector';
    const displayCategory = v.category || 'Unspecified';
    const fileFormat = v.isJpegOnly ? 'JPEG' : 'SVG, JPEG';

    panel.innerHTML = `
        <!-- GÖREV 10: Breadcrumb -->
        <div class="breadcrumb" style="font-size:12px;color:#888;margin-bottom:8px;">
            <a href="/" style="color:#000;text-decoration:none;">Home</a> &rsaquo; 
            <a href="/?category=${escHtml(displayCategory)}" style="color:#000;text-decoration:none;">${escHtml(displayCategory)}</a> &rsaquo; 
            <span style="color:#555;">${escHtml(v.title.substring(0, 30))}</span>
        </div>
        <div class="detail-inner">
            <div class="detail-left">
                <img class="detail-img" src="${v.thumbnail}" alt="${escHtml(v.title)}" width="600" height="600" loading="eager">
                <table class="detail-table">
                    <tr><td class="dt-label">TYPE</td><td class="dt-value">${displayType}</td></tr>
                    <tr><td class="dt-label">CATEGORY</td><td class="dt-value">${escHtml(displayCategory)}</td></tr>
                    <tr><td class="dt-label">FILE FORMAT</td><td class="dt-value">${fileFormat}</td></tr>
                    <tr><td class="dt-label">RESOLUTION</td><td class="dt-value">High Quality / Fully Scalable</td></tr>
                    <tr><td class="dt-label">LICENSE</td><td class="dt-value">Free for Personal &amp; Commercial Use</td></tr>
                    <tr><td class="dt-label">FILE SIZE</td><td class="dt-value">${v.fileSize || 'N/A'}</td></tr>
                </table>
            </div>
            <div class="detail-right">
                <h2 class="detail-title">${escHtml(v.title)}</h2>
                <p class="detail-desc">${escHtml(v.description || "")}</p>
                <div class="detail-keywords">
                    ${keywords.map(kw => `<span class="kw-tag">${escHtml(kw)}</span>`).join('')}
                </div>
                ${buildVectorSeoText(v)}
                <div style="margin-top: 20px; display: flex; gap: 12px;">
                    <button class="download-btn" id="mainDownloadBtn">DOWNLOAD</button>

                    <button class="detail-close-btn" id="mainCloseBtn">Close</button>
                </div>
            </div>
        </div>
    `;

    const grid = document.getElementById('vectorsGrid');
    
    // MOBİL REVİZYON: Mobilde detay panelini tıklanan görselin hemen altına ekle
    if (window.innerWidth <= 768 && cardEl) {
        cardEl.after(panel);
    } else {
        // Masaüstünde eski mantık: en sona ekle
        grid.appendChild(panel);
    }

    document.getElementById('mainDownloadBtn').onclick = () => showDownloadPage(v);
    document.getElementById('mainCloseBtn').onclick = closeDetailPanel;
    // GÖREV 2: Load dynamic related vectors
    loadRelatedVectors(v.category || '', v.name);
    
    // URL'yi güncelle (objects-jpeg-000000000131 takılı kalma sorununu çözer)
    injectSchema(v);
    const newPath = `/details/${v.name}`;
    if (window.location.pathname !== newPath) {
        window.history.pushState({ slug: v.name }, v.title, newPath);
    }
    
    // Detay panelini görünür kılmak için her zaman scroll yapalım
    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
}


// GÖREV 2: Dynamic related vectors loader
async function loadRelatedVectors(category, currentSlug) {
    const container = document.getElementById('related-vectors-container');
    if (!container) return;
    try {
        const res = await fetch(`/api/vectors?category=${encodeURIComponent(category)}&limit=50`);
        const data = await res.json();
        let vectors = (data.vectors || []).filter(v => v.name !== currentSlug);
        vectors.sort(() => Math.random() - 0.5);
        vectors = vectors.slice(0, 6);
        if (vectors.length === 0) {
            // Fallback: get from all vectors
            const res2 = await fetch(`/api/vectors?limit=50`);
            const data2 = await res2.json();
            vectors = (data2.vectors || []).filter(v => v.name !== currentSlug);
            vectors.sort(() => Math.random() - 0.5);
            vectors = vectors.slice(0, 6);
        }
        container.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;margin-top:8px;">' +
            vectors.map(v => `
                <div style="text-align:center;">
                    <a href="/details/${v.name}">
                        <img src="${v.thumbnail}" alt="${escHtml(v.title)}" style="width:100%;height:100px;object-fit:cover;border-radius:4px;border:1px solid #eee;" loading="lazy">
                        <p style="font-size:11px;color:#555;margin-top:4px;line-height:1.3;">${escHtml(v.title.substring(0, 40))}</p>
                    </a>
                </div>
            `).join('') +
            '</div>';
    } catch(e) {
        container.innerHTML = '<p>Browse more <a href="/" style="color:#000;text-decoration:underline;">free vectors</a> in our library.</p>';
    }
}

function closeDetailPanel() {
    const panel = document.getElementById('detailPanel');
    if (panel) panel.remove();
    if (state.openedCardEl) state.openedCardEl.classList.remove('card-active');
    
    // URL'yi ana sayfaya döndür
    if (window.location.pathname.startsWith('/details/')) {
        window.history.pushState({}, 'Frevector', '/');
    }
    
    state.openedVector = null;
    state.openedCardEl = null;
}

function buildVectorSeoText(v) {
    const title = escHtml(v.title || 'Free Vector Graphic');
    const category = escHtml(v.category || 'vector graphics');
    const style = (v.keywords && v.keywords.length) ? escHtml(v.keywords.slice(0, 3).join(', ')) : 'clean and editable';
    const useCases = (v.keywords && v.keywords.length) ? escHtml(v.keywords.slice(0, 8).join(', ')) : 'websites, social media posts, presentations, print advertisements, packaging, flyers, app icons, and infographics';
    return `<section class="detail-seo-text" style="margin-top:24px;font-size:14px;line-height:1.75;color:#333">
        <h3>${title} — Free SVG & JPEG Download</h3>
        <p>${title} is a high-quality free vector graphic available for download in SVG and JPEG formats. This file is part of our ${category} collection and is suitable for a wide range of design projects, from digital media to print materials.</p>
        <h3>About This File</h3>
        <p>This vector has been prepared in a ${style} style, making it versatile and easy to customize in vector editing applications such as Adobe Illustrator, Inkscape, CorelDRAW, or Affinity Designer. The scalable format ensures that the graphic looks sharp and professional at any size, whether you need a small icon for a mobile app or a large illustration for a poster or banner.</p>
        <p>The file is fully editable. You can change colors, resize elements, add text, or combine it with other graphics to create a unique composition. No quality loss occurs at any resolution because the artwork is delivered in a true vector format.</p>
        <h3>How to Use This Vector</h3>
        <p>This graphic is ideal for ${useCases}. Simply click the download button to get the file in your preferred format. SVG files can be opened directly in web browsers and most design tools. JPEG preview files are provided for quick viewing and reference.</p>
        <h3>License Information</h3>
        <p>This file is free for both personal and commercial use. You may use it in client projects, commercial products, and publications without paying any fee or providing attribution. Redistribution or reselling of the file as a standalone asset is not permitted.</p>
        <h3>Related Vectors</h3>
        <p>Browse more files in our ${category} category to find additional graphics that complement this design. frevector.com offers thousands of free vectors across dozens of categories, all available for instant download. If you enjoy using frevector.com, consider bookmarking our site and checking back regularly because we add new vectors every week.</p>
        <h3 style="margin-top:20px;">Frequently Asked Questions</h3>
        <div class="detail-faq" style="margin-top:8px;">
            <div style="margin-bottom:10px;"><strong style="color:#1a5276;">What file formats are included in the download?</strong><br>Every download includes an editable SVG file and a JPEG preview image. SVG files can be opened in Adobe Illustrator, Inkscape, or any modern web browser.</div>
            <div style="margin-bottom:10px;"><strong style="color:#1a5276;">Can I use this vector for commercial projects?</strong><br>Yes. All files on frevector.com are free for personal and commercial use without any registration, payment, or attribution requirement.</div>
            <div style="margin-bottom:10px;"><strong style="color:#1a5276;">Do I need to register to download?</strong><br>No. There is no registration, login, or email required. Simply click the download button and the file is yours.</div>
            <div style="margin-bottom:10px;"><strong style="color:#1a5276;">Can I modify the colors and sizes?</strong><br>Absolutely. SVG files are fully editable — you can change colors, resize elements, add text, and combine with other graphics without any quality loss at any scale.</div>
            <div><strong style="color:#1a5276;">Is it allowed to resell this file?</strong><br>No. You cannot redistribute or resell the raw vector file as a standalone asset. It must be incorporated into a larger design project or product.</div>
        </div>
    </section>`;
}

function showDownloadPage(v) {
    const dp = document.getElementById('downloadPage');
    if (!dp) return;

    document.getElementById('dpTitle').textContent = v.title;
    document.getElementById('dpDescription').textContent = v.description;
    document.getElementById('dpImage').src = v.thumbnail;
    
    // REVİZYON: Download sayfasında da Tip ve Kategori gösterimi
    const displayType = v.isJpegOnly ? 'JPEG' : 'Vector';
    const displayCategory = v.category || 'Unspecified';
    
    document.getElementById('dpCategory').textContent = displayCategory;
    document.getElementById('dpFileSize').textContent = v.fileSize || 'N/A';
    
    // Update file format in download page
    const dpFormatCell = document.getElementById('dpFileFormat');
    if (dpFormatCell) dpFormatCell.textContent = v.isJpegOnly ? 'JPEG' : 'SVG, JPEG';

    const kwBox = document.getElementById('dpKeywords');
    const keywords = [...new Set([...EXTRA_KEYWORDS, ...(v.keywords || [])])];
    kwBox.innerHTML = keywords.map(kw => `<span class="kw-tag">${escHtml(kw)}</span>`).join('');

    const btn = document.getElementById('dpDownloadBtn');
    const countBox = document.getElementById('dpCountdownBox');
    const countNum = document.getElementById('dpCountdown');

    btn.style.display = 'block';
    countBox.style.display = 'none';

    btn.onclick = () => {
        btn.style.display = 'none';
        countBox.style.display = 'block';
        let count = 4;
        countNum.textContent = count;
        state.countdownInterval = setInterval(() => {
            count--;
            countNum.textContent = count;
            if (count <= 0) {
                clearInterval(state.countdownInterval);
                window.location.href = `/api/download?slug=${v.name}`;
                // Sayfanın kapanması (dp.style.display = 'none') kaldırıldı, artık açık kalacak.
            }
        }, 1000);
    };

    dp.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function setupDownloadPageHandlers() {
    const dpClose = document.getElementById('dpClose');
    if (dpClose) {
        dpClose.onclick = () => {
            document.getElementById('downloadPage').style.display = 'none';
            document.body.style.overflow = '';
            clearInterval(state.countdownInterval);
        };
    }
}

function setupModalHandlers() {
    document.querySelectorAll('.modal-trigger').forEach(btn => {
        btn.onclick = (e) => {
            // e.preventDefault() removed to allow hash to appear in URL
            const modalType = btn.dataset.modal;
            const content = MODAL_CONTENTS[modalType];
            if (!content) return;
            document.getElementById('infoModalBody').innerHTML = content.content;
            document.getElementById('infoModal').style.display = 'flex';
        };
    });

    // Handle initial hash on load or hash change
    const handleHash = () => {
        const hash = window.location.hash.substring(1);
        if (MODAL_CONTENTS[hash]) {
            document.getElementById('infoModalBody').innerHTML = MODAL_CONTENTS[hash].content;
            document.getElementById('infoModal').style.display = 'flex';
        }
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    const closeModal = () => {
        document.getElementById('infoModal').style.display = 'none';
        if (window.location.hash) {
            history.pushState("", document.title, window.location.pathname + window.location.search);
        }
    };

    const infoModalClose = document.getElementById('infoModalClose');
    if (infoModalClose) {
        infoModalClose.onclick = closeModal;
    }
    // Close modal on backdrop click
    const infoModal = document.getElementById('infoModal');
    if (infoModal) {
        infoModal.onclick = (e) => {
            if (e.target === infoModal) {
                closeModal();
            }
        };
    }
}

function setupEventListeners() {
    const input = document.getElementById('searchInput');
    if (input) {
        input.onkeydown = (e) => { if (e.key === 'Enter') { state.searchQuery = input.value; state.currentPage = 1; fetchVectors(); } };
    }
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        const triggerSearch = () => { 
            state.searchQuery = input.value; 
            state.currentPage = 1; 
            fetchVectors(); 
        };
        searchBtn.onclick = triggerSearch;
        searchBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            triggerSearch();
        }, { passive: false });
    }
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter) {
        sortFilter.onchange = () => { 
            state.currentPage = 1; 
            // Sıralama değerini state'e eklemiyoruz ama fetchVectors içinde select'ten okuyacağız
            fetchVectors(); 
        };
    }
    
    const prevBtn = document.getElementById('prevBtn');
    if (prevBtn) {
        prevBtn.onclick = () => { if (state.currentPage > 1) { state.currentPage--; fetchVectors(); } };
    }
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
        nextBtn.onclick = () => { if (state.currentPage < state.totalPages) { state.currentPage++; fetchVectors(); } };
    }
}

function updatePagination() {
    const pageNumber = document.getElementById('pageNumber');
    if (pageNumber) pageNumber.textContent = state.currentPage;
    const pageTotal = document.getElementById('pageTotal');
    if (pageTotal) pageTotal.textContent = `/ ${state.totalPages}`;
    
    // GÖREV 2: Toplam vektör sayısını güncelle
    const totalCountEl = document.getElementById('totalVectorCount');
    if (totalCountEl) {
        // Use SSR data as fallback if API returned 0
        const displayTotal = (state.total > 0) ? state.total : (window.__ssrData && window.__ssrData.totalCount) || 0;
        if (displayTotal > 0) {
            totalCountEl.textContent = `(${displayTotal.toLocaleString()} free vectors available)`;
        }
    }
}

function showLoader(show) {
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = show ? 'flex' : 'none';
}

function escHtml(str) {
    if (!str) return '';
    return str.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// SSR Data: Read server-rendered data if available
function applySSRData() {
    // 1. Total vector count from SSR
    const countEl = document.getElementById('totalVectorCount');
    if (countEl && countEl.dataset.ssrTotal) {
        const ssrTotal = parseInt(countEl.dataset.ssrTotal);
        if (!isNaN(ssrTotal) && ssrTotal > 0) {
            countEl.textContent = `(${ssrTotal.toLocaleString()} free vectors available)`;
            // Store for later use
            if (!window.__ssrData) window.__ssrData = {};
            window.__ssrData.totalCount = ssrTotal;
        }
    }

    // 2. Category and FileSize from SSR (for detail pages)
    const catEl = document.getElementById('dpCategory');
    const sizeEl = document.getElementById('dpFileSize');
    if (catEl && catEl.dataset.ssrCategory) {
        if (catEl.textContent === '-' || catEl.textContent === 'Unspecified') {
            catEl.textContent = catEl.dataset.ssrCategory;
        }
    }
    if (sizeEl && sizeEl.dataset.ssrFilesize) {
        if (sizeEl.textContent === '-' || sizeEl.textContent === 'N/A') {
            sizeEl.textContent = sizeEl.dataset.ssrFilesize;
        }
    }

    // 3. Our Picks SSR data
    const picksDataEl = document.getElementById('our-picks-ssr-data');
    if (picksDataEl && picksDataEl.dataset.picks) {
        try {
            const picks = JSON.parse(picksDataEl.dataset.picks);
            if (Array.isArray(picks) && picks.length > 0) {
                // Build vector objects from SSR data
                const pickVectors = picks.map(p => ({
                    name: p.name,
                    title: p.title,
                    category: p.category,
                    fileSize: p.fileSize,
                    isJpegOnly: p.isJpegOnly || false,
                    thumbnail: `https://assets.frevector.com/${p.category}/${p.name}/${p.name}.jpg`,
                    description: '',
                    keywords: []
                }));
                if (!window.__ssrData) window.__ssrData = {};
                window.__ssrData.ourPicks = pickVectors;
            }
        } catch(e) {
            console.warn('SSR our-picks parse error:', e);
        }
    }
}

// Run SSR data application before init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { applySSRData(); });
} else {
    applySSRData();
}

document.addEventListener('DOMContentLoaded', init);

/* ULTRA PERFORMANCE PATCH v1 REMOVED - Native browser optimizations used instead */
