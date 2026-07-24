/**
 * frevector.com - SSR Function (Cloudflare Pages)
 * Serves the full index.html and dynamically replaces the SEO content block
 * based on the ?category= query parameter.
 *
 * This is the ONLY server-side handler for the root path (/).
 * It reads the static index.html via the ASSETS binding, replaces
 * the .home-seo-content section, and returns the modified HTML.
 */

// ═══════════════════════════════════════════════════════════════════
// SEO DATA — per-category unique content
// ═══════════════════════════════════════════════════════════════════
const CATEGORY_SEO_DATA = {
    'all': {
        title: 'Free Vector Graphics for Everyone',
        p1: 'Welcome to frevector.com — your go-to free resource for high-quality vector graphics, SVG files, and JPEG illustrations. Whether you are a graphic designer, web developer, marketing professional, or student, our constantly growing library of free vectors is ready for you to download and use in both personal and commercial projects.',
        p2: 'Browse thousands of fully scalable vector assets organized by category. From flat icons and geometric patterns to detailed illustrations and decorative backgrounds — frevector.com has the design resources you need. Every file is available in SVG and JPEG formats, ensuring perfect quality at any size. No registration, no subscription, no hidden fees. Just search, preview, and download instantly.',
        p3: 'Our library is updated regularly with fresh content across all categories. All files are free to use under a personal and commercial license. Looking for something specific? Use the search bar or browse by category to find exactly what your project needs.',
        popularCats: ['Icons &amp; UI Elements', 'Patterns &amp; Textures', 'Backgrounds &amp; Wallpapers', 'Logos &amp; Symbols']
    },
    'Icon': {
        title: 'Free Icon Vector Graphics — SVG &amp; JPEG Downloads',
        p1: 'Explore our extensive collection of free icon vectors designed for web, mobile, and print applications. From minimal line icons to bold filled symbols, our icon library covers every interface need — navigation arrows, social media glyphs, e-commerce symbols, and much more.',
        p2: 'Each icon vector is crafted for pixel-perfect clarity at any resolution. Whether you are building a mobile app, designing a website, or creating a presentation, these scalable SVG icons adapt seamlessly to your layout. Download in SVG for full scalability or JPEG for quick embedding — all completely free.',
        p3: 'Our icon collection spans hundreds of categories including technology, communication, business, and lifestyle. New icon sets are added regularly, ensuring you always have fresh, modern assets at your fingertips. No attribution required for personal or commercial use.',
        popularCats: ['UI Elements', 'Technology Icons', 'Business Symbols', 'Social Media Icons']
    },
    'Logo': {
        title: 'Free Logo Vector Elements — SVG &amp; JPEG Downloads',
        p1: 'Discover a rich collection of free logo vector elements including abstract marks, monogram designs, badge templates, and brand identity components. These vectors are ideal starting points for creating unique brand identities or as decorative elements for existing logo designs.',
        p2: 'Logo design demands precision and scalability — qualities that vector format delivers perfectly. Our logo vectors are built for use across business cards, digital displays, vehicle wraps, and embroidered patches. Customize colors, adjust proportions, and combine elements to craft a logo that truly represents your brand.',
        p3: 'All logo vectors are free for commercial use, making them accessible to freelancers, agencies, and in-house design teams. The collection includes geometric marks, typographic treatments, emblem designs, and abstract symbols — each crafted with professional attention to detail.',
        popularCats: ['Symbols', 'Business', 'Abstract', 'Badges &amp; Emblems']
    },
    'Abstract': {
        title: 'Free Abstract Vector Graphics — SVG &amp; JPEG Downloads',
        p1: 'Immerse yourself in our collection of free abstract vector graphics featuring geometric compositions, fluid shapes, gradient meshes, and artistic patterns. Abstract vectors are the backbone of modern graphic design — perfect for backgrounds, branding, editorial layouts, and digital art.',
        p2: 'Each abstract vector is fully scalable and editable, allowing you to customize colors, scale shapes, and blend elements to match your creative vision. Whether you need a striking poster background, a dynamic web banner, or a unique packaging design, our abstract library delivers endless inspiration.',
        p3: 'Our abstract collection is continuously updated with contemporary styles including low-poly art, glitch effects, neon gradients, and minimalist geometry. All files are free for personal and commercial projects with no registration required.',
        popularCats: ['Backgrounds', 'Patterns', 'Geometric', 'Gradients']
    },
    'Animals': {
        title: 'Free Animal Vector Graphics — SVG &amp; JPEG Downloads',
        p1: 'Browse our charming collection of free animal vector graphics featuring wildlife illustrations, pet portraits, cartoon characters, and nature-inspired designs. From majestic lions and playful dogs to exotic birds and marine creatures, our animal library covers the entire animal kingdom.',
        p2: 'Animal vectors are perfect for children\'s books, educational materials, wildlife branding, pet care businesses, and nature-themed projects. Each illustration is crafted with expressive detail and is available in fully scalable SVG format, ensuring crisp quality at any size.',
        p3: 'Whether you need a realistic wildlife illustration or a cute cartoon mascot, our animal collection offers diverse styles to suit every project. All vectors are free for commercial use — ideal for logos, stickers, apparel prints, and digital content.',
        popularCats: ['Wildlife', 'Pets', 'Birds', 'Marine Life']
    },
    'Backgrounds': {
        title: 'Free Background Vector Graphics — SVG &amp; JPEG Downloads',
        p1: 'Transform your designs with our extensive collection of free background vectors. From subtle textures and geometric patterns to vibrant gradients and atmospheric landscapes, our background library provides the perfect foundation for any creative project.',
        p2: 'Background vectors are essential for web design, presentation slides, social media graphics, and print materials. Our collection includes seamless patterns for repeating tiles, full-bleed illustrations for hero sections, and abstract compositions for modern branding — all available in scalable SVG format.',
        p3: 'Regularly updated with seasonal themes, trending styles, and timeless classics, our background collection ensures you always have fresh design assets. Download any background vector for free and use it in personal or commercial projects without restrictions.',
        popularCats: ['Patterns &amp; Textures', 'Gradients', 'Nature Scenes', 'Abstract']
    },
    'Business': {
        title: 'Free Business Vector Graphics — SVG &amp; JPEG Downloads',
        p1: 'Elevate your professional presentations and marketing materials with our free business vector graphics. The collection includes corporate icons, infographic elements, office illustrations, financial charts, and team collaboration visuals — everything a business communicator needs.',
        p2: 'Business vectors are designed for clarity and professionalism, making them ideal for annual reports, pitch decks, website design, and corporate branding. Each element is clean, scalable, and easily customizable to match your brand colors and style guidelines.',
        p3: 'From startup branding to enterprise communications, our business vector library supports every professional context. All files are free for commercial use, giving businesses of all sizes access to high-quality design assets without licensing fees.',
        popularCats: ['Corporate Icons', 'Infographics', 'Finance', 'Office &amp; Workspace']
    },
    'Food': {
        title: 'Free Food Vector Graphics — SVG &amp; JPEG Downloads',
        p1: 'Satisfy your design appetite with our free food vector graphics collection. Featuring mouth-watering illustrations of cuisines from around the world — from artisan pizzas and fresh salads to exotic street food and gourmet desserts — our food library is a feast for the eyes.',
        p2: 'Food vectors are indispensable for restaurant menus, food blogs, recipe websites, packaging design, and culinary branding. Each illustration is crafted with appetizing detail and is available in scalable SVG format, ensuring your food graphics look delicious on any medium.',
        p3: 'Whether you need a simple fruit icon for a health app or a detailed restaurant illustration for a menu cover, our food collection delivers. All vectors are free for commercial use — ideal for restaurants, food brands, and culinary content creators.',
        popularCats: ['Fruits &amp; Vegetables', 'Restaurant &amp; Dining', 'Snacks &amp; Desserts', 'Drink']
    },
    'Nature': {
        title: 'Free Nature Vector Graphics — SVG &amp; JPEG Downloads',
        p1: 'Connect with the natural world through our free nature vector graphics collection. Featuring lush botanical illustrations, dramatic landscape scenes, weather phenomena, seasonal foliage, and organic textures, our nature library brings the beauty of the outdoors to your designs.',
        p2: 'Nature vectors are perfect for eco-friendly branding, wellness products, outdoor lifestyle campaigns, environmental publications, and botanical art prints. Each illustration captures the organic beauty of the natural world in fully scalable vector format.',
        p3: 'From delicate wildflower arrangements and majestic mountain landscapes to tropical rainforest scenes and serene ocean views, our nature collection spans every biome and season. All vectors are free for commercial use.',
        popularCats: ['Botanical &amp; Plants', 'Landscapes', 'Weather', 'Animals']
    },
    'Miscellaneous': {
        title: 'Free Miscellaneous Vector Graphics — SVG &amp; JPEG Downloads',
        p1: 'Discover a diverse collection of free miscellaneous vector graphics that defy easy categorization. This eclectic library includes unique illustrations, novelty designs, decorative elements, and creative assets that add unexpected character to any project.',
        p2: 'Miscellaneous vectors are the wildcards of the design world — perfect when you need something distinctive that stands apart from conventional categories. Use them for editorial illustrations, creative packaging, unique social media content, and experimental branding.',
        p3: 'Our miscellaneous collection is a treasure trove of creative surprises, regularly updated with one-of-a-kind designs. All vectors are free for personal and commercial use, giving designers the freedom to explore unconventional creative directions.',
        popularCats: ['Decorative Elements', 'Novelty', 'Objects', 'Abstract']
    },
    'Drink': {
        title: 'Free Drink Vector Graphics — SVG &amp; JPEG Downloads',
        p1: 'Quench your design thirst with our free drink vector graphics collection. Featuring everything from steaming coffee cups and refreshing cocktails to craft beer illustrations and smoothie bowls, our drink library is perfect for food and beverage brands, restaurant menus, and lifestyle content.',
        p2: 'Drink vectors are essential assets for café branding, bar menus, food blogs, and packaging design. Each illustration is crafted with appetizing detail and is available in scalable SVG format, ensuring your beverage graphics look crisp on menus, signage, and digital platforms.',
        p3: 'Whether you need a minimalist coffee icon for a café app or a detailed cocktail illustration for a bar menu, our drink collection delivers. All vectors are free for commercial use — perfect for hospitality businesses, food bloggers, and beverage brands.',
        popularCats: ['Coffee &amp; Tea', 'Cocktails &amp; Spirits', 'Soft Drinks', 'Food &amp; Drink']
    },
    'Education': {
        title: 'Free Education Vector Graphics — SVG &amp; JPEG Downloads',
        p1: 'Inspire learning with our free education vector graphics collection. Featuring school supplies, academic icons, graduation elements, science equipment, and classroom illustrations, our education library supports teachers, students, and educational publishers alike.',
        p2: 'Education vectors are perfect for school websites, e-learning platforms, textbook design, educational apps, and classroom materials. Each graphic is designed for clarity and engagement, helping communicate complex concepts through visual storytelling.',
        p3: 'From kindergarten-friendly illustrations to university-level academic icons, our education collection spans all learning levels. All vectors are free for commercial use, making quality design accessible to educational institutions and content creators worldwide.',
        popularCats: ['School Supplies', 'Science &amp; Lab', 'Graduation', 'E-Learning']
    },
    'Fashion': {
        title: 'Free Fashion Vector Graphics — SVG &amp; JPEG Downloads',
        p1: 'Stay on trend with our free fashion vector graphics collection. Featuring clothing illustrations, accessory designs, runway silhouettes, beauty icons, and style-forward patterns, our fashion library is the go-to resource for apparel brands, fashion bloggers, and style publications.',
        p2: 'Fashion vectors are essential for lookbook design, clothing catalogs, fashion week materials, and lifestyle branding. Each illustration captures the elegance and dynamism of the fashion world, available in scalable SVG format for flawless reproduction across all media.',
        p3: 'From minimalist wardrobe icons to elaborate haute couture illustrations, our fashion collection covers every style aesthetic. All vectors are free for commercial use — perfect for boutiques, fashion designers, and style-focused content creators.',
        popularCats: ['Clothing &amp; Apparel', 'Accessories', 'Beauty &amp; Cosmetics', 'Lifestyle']
    },
    'Holidays': {
        title: 'Free Holiday Vector Graphics — SVG &amp; JPEG Downloads',
        p1: 'Celebrate every occasion with our free holiday vector graphics collection. Featuring festive illustrations for Christmas, Halloween, Easter, New Year, Valentine\'s Day, and dozens of other holidays and cultural celebrations, our holiday library keeps your designs seasonally fresh.',
        p2: 'Holiday vectors are essential for greeting cards, seasonal marketing campaigns, event invitations, social media posts, and festive packaging. Each illustration captures the spirit of the season with vibrant colors and joyful compositions.',
        p3: 'From cozy Christmas scenes and spooky Halloween graphics to romantic Valentine\'s motifs and patriotic Independence Day designs, our holiday collection covers the entire calendar year. All vectors are free for commercial use.',
        popularCats: ['Christmas', 'Halloween', 'Valentine\'s Day', 'New Year']
    },
    'Medical': {
        title: 'Free Medical Vector Graphics — SVG &amp; JPEG Downloads',
        p1: 'Support healthcare communication with our free medical vector graphics collection. Featuring anatomical illustrations, medical equipment icons, healthcare symbols, pharmaceutical graphics, and wellness imagery, our medical library serves healthcare professionals, publishers, and health-focused brands.',
        p2: 'Medical vectors are essential for hospital websites, health apps, medical publications, pharmaceutical branding, and patient education materials. Each graphic is designed for clarity and accuracy, helping communicate complex health information visually.',
        p3: 'From simple first-aid icons to detailed anatomical diagrams, our medical collection covers the full spectrum of healthcare design needs. All vectors are free for commercial use, making professional medical illustration accessible to organizations of all sizes.',
        popularCats: ['Healthcare Icons', 'Anatomy', 'Pharmacy', 'Wellness']
    },
    'Objects': {
        title: 'Free Object Vector Graphics — SVG &amp; JPEG Downloads',
        p1: 'Find the perfect free object vector for any design project. Our objects collection features everyday items, household goods, tools, gadgets, furniture, and decorative pieces — all rendered as clean, scalable vector illustrations ready for immediate use.',
        p2: 'Object vectors are invaluable for e-commerce product illustrations, instructional diagrams, app interfaces, and editorial design. Each illustration is crafted for visual clarity, making complex objects immediately recognizable at any scale.',
        p3: 'From kitchen utensils and office supplies to vintage collectibles and modern electronics, our objects collection covers the full spectrum of everyday life. All vectors are free for personal and commercial use with no registration required.',
        popularCats: ['Household Items', 'Tools &amp; Equipment', 'Electronics', 'Furniture']
    },
    'Sports': {
        title: 'Free Sports Vector Graphics — SVG &amp; JPEG Downloads',
        p1: 'Score big with our free sports vector graphics collection. Featuring dynamic athlete illustrations, sports equipment icons, team emblems, stadium scenes, and action-packed compositions across dozens of sports disciplines — from football and basketball to tennis and swimming.',
        p2: 'Sports vectors are essential for team branding, sports event posters, fitness app design, athletic wear graphics, and sports journalism. Each illustration captures the energy and dynamism of athletic competition in crisp, scalable vector format.',
        p3: 'Whether you need a simple football icon for a sports app or a detailed stadium illustration for an event poster, our sports collection delivers. All vectors are free for commercial use — perfect for sports organizations, fitness brands, and athletic content creators.',
        popularCats: ['Ball Sports', 'Athletics &amp; Track', 'Water Sports', 'Outdoor']
    },
    'Technology': {
        title: 'Free Technology Vector Graphics — SVG &amp; JPEG Downloads',
        p1: 'Power up your designs with our free technology vector graphics collection. Featuring computer hardware, mobile devices, circuit board patterns, cybersecurity icons, artificial intelligence visuals, and digital interface elements, our tech library keeps your designs cutting-edge.',
        p2: 'Technology vectors are essential for software company branding, tech startup marketing, cybersecurity communications, app design, and digital innovation campaigns. Each graphic is designed to convey precision, innovation, and forward-thinking in scalable vector format.',
        p3: 'From vintage computing nostalgia to futuristic AI and robotics imagery, our technology collection spans the full arc of digital innovation. All vectors are free for commercial use — perfect for tech companies, developers, and digital content creators.',
        popularCats: ['Computers &amp; Devices', 'Cybersecurity', 'AI &amp; Robotics', 'Science']
    },
    'Transportation': {
        title: 'Free Transportation Vector Graphics — SVG &amp; JPEG Downloads',
        p1: 'Navigate your designs with our free transportation vector graphics collection. Featuring cars, trucks, motorcycles, aircraft, ships, trains, bicycles, and futuristic vehicles, our transportation library covers every mode of travel from city streets to outer space.',
        p2: 'Transportation vectors are essential for automotive branding, travel app design, logistics company marketing, urban planning materials, and transportation journalism. Each vehicle illustration is crafted with technical detail and stylistic flair in scalable vector format.',
        p3: 'From vintage automobiles and classic aircraft to electric vehicles and hyperloop concepts, our transportation collection spans the history and future of human mobility. All vectors are free for commercial use.',
        popularCats: ['Automobiles', 'Aviation', 'Maritime', 'Urban Transport']
    },
    'Vintage': {
        title: 'Free Vintage Vector Graphics — SVG &amp; JPEG Downloads',
        p1: 'Travel back in time with our free vintage vector graphics collection. Featuring retro illustrations, antique ornaments, Art Deco patterns, Victorian engravings, mid-century modern designs, and nostalgic Americana, our vintage library adds timeless character to contemporary projects.',
        p2: 'Vintage vectors are perfect for craft brewery branding, artisan product packaging, retro-themed events, antique shop marketing, and nostalgic editorial design. Each illustration captures the distinctive aesthetic of its era with authentic detail.',
        p3: 'From 1920s Art Deco elegance to 1970s psychedelic patterns and 1950s Americana charm, our vintage collection spans a century of design history. All vectors are free for commercial use — perfect for brands seeking timeless, character-rich design assets.',
        popularCats: ['Art Deco', 'Retro &amp; Mid-Century', 'Victorian &amp; Antique', 'Objects']
    },
    'Buildings': {
        title: 'Free Building &amp; Architecture Vector Graphics — SVG &amp; JPEG Downloads',
        p1: 'Construct stunning designs with our free building and architecture vector graphics collection. Featuring iconic landmarks, architectural details, urban skylines, historical buildings, modern structures, and construction site illustrations, our buildings library supports architects, urban planners, and real estate brands.',
        p2: 'Building vectors are essential for real estate marketing, architectural firm portfolios, urban development presentations, travel and tourism content, and city planning materials. Each illustration captures architectural character with precision and artistic flair.',
        p3: 'From ancient temples and medieval castles to modernist skyscrapers and futuristic concept buildings, our architecture collection spans the full history of human construction. All vectors are free for commercial use.',
        popularCats: ['Landmarks', 'Urban Skylines', 'Historical Architecture', 'Outdoor']
    },
    'Font': {
        title: 'Free Font &amp; Typography Vector Graphics — SVG &amp; JPEG Downloads',
        p1: 'Explore our collection of free font and typography vector graphics featuring decorative lettering, calligraphic elements, alphabet sets, and typographic ornaments. These vectors are ideal for creating custom titles, logotypes, signage, and editorial layouts with a distinctive typographic flair.',
        p2: 'Typography vectors give designers the flexibility to craft unique text treatments without relying on installed fonts. Use them for poster headlines, wedding invitations, brand wordmarks, and social media graphics — all scalable to any size without quality loss.',
        p3: 'Our font and typography collection includes hand-lettered scripts, bold display styles, vintage signage alphabets, and modern geometric letterforms. All vectors are free for commercial use, empowering typographers and designers to push creative boundaries.',
        popularCats: ['Calligraphy', 'Display &amp; Decorative', 'Alphabet Sets', 'Ornaments']
    },
    'Symbols': {
        title: 'Free Symbol Vector Graphics — SVG &amp; JPEG Downloads',
        p1: 'Communicate universally with our free symbol vector graphics collection. Featuring international signs, cultural emblems, religious symbols, mathematical notation, warning icons, and universal pictograms, our symbols library transcends language barriers.',
        p2: 'Symbol vectors are essential for wayfinding systems, international communications, cultural publications, educational materials, and universal design projects. Each symbol is crafted for maximum clarity and immediate recognition across diverse audiences.',
        p3: 'From traffic signs and safety symbols to cultural emblems and mathematical operators, our symbols collection covers the full spectrum of visual communication. All vectors are free for commercial use, supporting clear and universal design worldwide.',
        popularCats: ['Signs &amp; Wayfinding', 'Cultural &amp; Religious', 'Mathematical', 'Logo']
    },
    'Celebrities': {
        title: 'Free Celebrity Vector Illustrations — SVG &amp; JPEG Downloads',
        p1: 'Explore our collection of free celebrity vector illustrations featuring stylized portraits, pop culture icons, and entertainment-themed graphics. These vectors capture the essence of famous figures through artistic interpretation, making them ideal for fan art, editorial design, and pop culture projects.',
        p2: 'Celebrity vectors are popular choices for magazine layouts, event posters, social media content, and entertainment branding. Each illustration is crafted in a distinctive artistic style that balances likeness with creative expression.',
        p3: 'All celebrity vectors are free for personal and editorial use. Our collection is regularly updated with new portraits and pop culture references, keeping your design toolkit current and culturally relevant.',
        popularCats: ['Entertainment', 'Music', 'Sports Stars', 'Pop Culture']
    },
    'Outdoor': {
        title: 'Free Outdoor Vector Graphics — SVG &amp; JPEG Downloads',
        p1: 'Embrace the great outdoors with our free outdoor vector graphics collection. Featuring adventure sports, camping scenes, hiking trails, extreme activities, and outdoor lifestyle imagery, our outdoor library is perfect for adventure brands, travel companies, and active lifestyle content.',
        p2: 'Outdoor vectors capture the spirit of exploration and adventure, making them ideal for sports equipment branding, travel apps, outdoor event posters, and adventure tourism marketing. Each illustration conveys energy and movement in crisp, scalable vector format.',
        p3: 'From mountain climbing and kayaking to beach volleyball and cycling, our outdoor collection covers every adventure activity. All vectors are free for commercial use — perfect for sports brands, travel bloggers, and outdoor enthusiasts.',
        popularCats: ['Adventure Sports', 'Camping &amp; Hiking', 'Water Sports', 'Nature']
    },
    'People': {
        title: 'Free People Vector Graphics — SVG &amp; JPEG Downloads',
        p1: 'Humanize your designs with our free people vector graphics collection. Featuring diverse character illustrations, professional silhouettes, lifestyle scenes, team collaboration visuals, and cultural representations, our people library brings authentic human stories to your creative projects.',
        p2: 'People vectors are essential for corporate presentations, diversity and inclusion campaigns, social media content, educational materials, and healthcare communications. Each illustration is crafted to represent a wide range of ages, backgrounds, and activities.',
        p3: 'From business professionals and medical workers to students, athletes, and families, our people collection celebrates human diversity. All vectors are free for commercial use, making inclusive design accessible to every creator.',
        popularCats: ['Business Professionals', 'Families &amp; Children', 'Sports &amp; Fitness', 'Diversity &amp; Inclusion']
    },
    'Science': {
        title: 'Free Science Vector Graphics — SVG &amp; JPEG Downloads',
        p1: 'Illuminate complex concepts with our free science vector graphics collection. Featuring laboratory equipment, molecular structures, astronomical illustrations, physics diagrams, chemistry symbols, and biological specimens, our science library supports researchers, educators, and science communicators.',
        p2: 'Science vectors are perfect for academic publications, educational websites, science museum exhibits, STEM learning materials, and research presentations. Each illustration combines scientific accuracy with visual clarity to make complex ideas accessible.',
        p3: 'From microscopic cell structures to vast cosmic landscapes, our science collection spans every scientific discipline. All vectors are free for commercial use, supporting science education and communication at every level.',
        popularCats: ['Biology &amp; Medicine', 'Chemistry', 'Physics &amp; Space', 'Technology']
    },
    'The Arts': {
        title: 'Free Arts &amp; Culture Vector Graphics — SVG &amp; JPEG Downloads',
        p1: 'Celebrate creativity with our free arts and culture vector graphics collection. Featuring fine art references, musical instruments, theatrical imagery, dance illustrations, film and cinema graphics, and cultural heritage designs, our arts library honors human creative expression.',
        p2: 'Arts vectors are perfect for cultural institution branding, event posters, music venue design, arts education materials, and creative industry communications. Each illustration captures the passion and artistry of human cultural achievement.',
        p3: 'From classical music and ballet to street art and contemporary performance, our arts collection spans the full spectrum of human creativity. All vectors are free for commercial use, supporting arts organizations and creative professionals worldwide.',
        popularCats: ['Music &amp; Instruments', 'Visual Arts', 'Performing Arts', 'Film &amp; Cinema']
    },
    'Industrial': {
        title: 'Free Industrial Vector Graphics — SVG &amp; JPEG Downloads',
        p1: 'Build stronger designs with our free industrial vector graphics collection. Featuring factory machinery, construction equipment, engineering tools, manufacturing processes, and heavy industry imagery, our industrial library supports engineering firms, construction companies, and industrial brands.',
        p2: 'Industrial vectors are perfect for safety training materials, engineering publications, manufacturing company websites, construction project presentations, and industrial equipment catalogs. Each illustration combines technical accuracy with visual impact.',
        p3: 'From precision engineering components to large-scale construction machinery, our industrial collection covers the full spectrum of manufacturing and construction design needs. All vectors are free for commercial use.',
        popularCats: ['Construction', 'Manufacturing', 'Engineering Tools', 'Technology']
    },
    'Interiors': {
        title: 'Free Interior Design Vector Graphics — SVG &amp; JPEG Downloads',
        p1: 'Design beautiful spaces with our free interior design vector graphics collection. Featuring furniture illustrations, room layouts, decorative elements, architectural details, and home décor accessories, our interiors library supports interior designers, architects, and home lifestyle brands.',
        p2: 'Interior vectors are perfect for home décor catalogs, interior design portfolios, real estate marketing, furniture brand websites, and lifestyle publications. Each illustration captures the elegance and functionality of well-designed living spaces.',
        p3: 'From minimalist Scandinavian interiors to opulent Art Deco settings, our interiors collection spans every design style and aesthetic. All vectors are free for commercial use — ideal for interior designers, home brands, and lifestyle content creators.',
        popularCats: ['Furniture', 'Home Décor', 'Architecture', 'Lifestyle']
    },
    'Religion': {
        title: 'Free Religion &amp; Spirituality Vector Graphics — SVG &amp; JPEG Downloads',
        p1: 'Honor diverse spiritual traditions with our free religion and spirituality vector graphics collection. Featuring sacred symbols, religious architecture, ceremonial objects, spiritual motifs, and cultural heritage designs from world religions and spiritual traditions.',
        p2: 'Religion vectors are used in faith community communications, religious publication design, cultural heritage projects, interfaith dialogue materials, and spiritual wellness branding. Each illustration is crafted with cultural sensitivity and artistic respect.',
        p3: 'From ancient sacred symbols to contemporary spiritual iconography, our religion collection represents the rich diversity of human spiritual expression. All vectors are free for personal and commercial use.',
        popularCats: ['Sacred Symbols', 'Religious Architecture', 'Ceremonies', 'Symbols']
    }
};

// ═══════════════════════════════════════════════════════════════════
// HANDLER
// ═══════════════════════════════════════════════════════════════════
export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);

    // Only intercept the root path
    if (url.pathname !== '/' && url.pathname !== '/index.html') {
        return context.next();
    }

    // Fetch the static index.html via the ASSETS binding
    const assetUrl = new URL(url.pathname, url.origin);
    const assetResponse = await env.ASSETS.fetch(assetUrl);
    let html = await assetResponse.text();

    // Determine category from query param
    const categoryParam = url.searchParams.get('category') || '';
    let matchedKey = 'all';
    if (categoryParam) {
        const catLower = categoryParam.toLowerCase();
        for (const key of Object.keys(CATEGORY_SEO_DATA)) {
            if (key !== 'all' && key.toLowerCase() === catLower) {
                matchedKey = key;
                break;
            }
        }
    }

    const seoData = CATEGORY_SEO_DATA[matchedKey] || CATEGORY_SEO_DATA['all'];

    // Build the dynamic SEO block
    const popularCatsHtml = seoData.popularCats.map(c => `<li>${c}</li>`).join('');
    const newSeoBlock = `<section class="home-seo-content" style="padding:24px 0 32px;max-width:100%;margin:24px 0 0;font-family:Arial,sans-serif;color:#2c3e50;border-top:1px solid #eee">
              <h2 style="font-size:20px;font-weight:700;margin-bottom:12px;color:#1a5276">${seoData.title}</h2>
              <p style="font-size:14px;line-height:1.7;margin-bottom:10px">${seoData.p1}</p>
              <p style="font-size:14px;line-height:1.7;margin-bottom:10px">${seoData.p2}</p>
              <p style="font-size:14px;line-height:1.7">${seoData.p3}</p>
              <p style="margin-top:10px;font-size:14px;color:#666;">
                Browse <strong>our free vector files</strong> across
                <strong>25+ categories</strong> — all free for personal
                and commercial use. No registration required.
              </p>
              <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:20px;margin-top:24px">
                <div>
                  <h3 style="font-size:16px;font-weight:700;margin-bottom:8px;color:#1a5276">Popular Categories</h3>
                  <ul style="font-size:13px;line-height:1.6;margin:0;padding-left:18px">
                    ${popularCatsHtml}
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
            </section>`;

    // Replace the static SEO block
    const oldBlockRegex = /<section class="home-seo-content"[^>]*>[\s\S]*?<\/section>/;
    const updatedHtml = html.replace(oldBlockRegex, newSeoBlock);

    // --- GÖREV 3/4: CRAWLABILITY FIX ---
    // Sadece crawler'lar için (veya SEO için) görünür, normal kullanıcıdan gizli gerçek linkler ekliyoruz.
    // Bu sayede Googlebot /details/ sayfalarını keşfedebilir ve pagination'ı takip edebilir.
    let crawlableLinksHtml = '';
    try {
        const r2 = env.VECTOR_ASSETS;
        const r2Object = await r2.get("all_vectors.json");
        if (r2Object) {
            const allVectors = JSON.parse(await r2Object.text());
            let filtered = allVectors;
            
            // Kategori filtresi
            if (categoryParam && categoryParam !== 'all') {
                const catLower = categoryParam.toLowerCase();
                filtered = allVectors.filter(v => (v.category || "").toLowerCase() === catLower);
            }
            
            // Sadece vektörleri göster (JPEG'leri gizle - main.js ile uyumlu)
            filtered = filtered.filter(v => v.contentType !== 'jpeg');
            
            // Sayfalama (Limit 24 - main.js ile uyumlu)
            const limit = 24;
            const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
            const total = filtered.length;
            const totalPages = Math.ceil(total / limit);
            const offset = (page - 1) * limit;
            const pageVectors = filtered.slice(offset, offset + limit);
            
            // Ürün linklerini oluştur
            const productLinks = pageVectors.map(v => `<li><a href="/details/${v.name}">${v.title || v.name}</a></li>`).join('');
            
            // Sayfalama linklerini oluştur
            let paginationLinks = '';
            if (page > 1) {
                const prevUrl = new URL(url.toString());
                prevUrl.searchParams.set('page', page - 1);
                paginationLinks += `<a href="${prevUrl.pathname}${prevUrl.search}">Previous Page</a> `;
            }
            if (page < totalPages) {
                const nextUrl = new URL(url.toString());
                nextUrl.searchParams.set('page', page + 1);
                paginationLinks += `<a href="${nextUrl.pathname}${nextUrl.search}">Next Page</a>`;
            }
            
            crawlableLinksHtml = `
            <div id="seo-crawl-links" style="display:none !important;" aria-hidden="true">
                <ul>${productLinks}</ul>
                <div class="seo-pagination">${paginationLinks}</div>
                <span id="ssr-total-count">${total}</span>
                <span id="ssr-total-pages">${totalPages}</span>
            </div>`;
        }
    } catch (e) {
        console.error("SSR Link generation failed:", e);
    }

    // SSR içeriğini HTML'e enjekte et
    if (crawlableLinksHtml) {
        html = html.replace('</body>', `${crawlableLinksHtml}\n</body>`);
        
        // Toplam sayfa sayısını ve vektör sayısını HTML'deki yerlerine de yazalım
        const totalMatch = crawlableLinksHtml.match(/<span id="ssr-total-count">(\d+)<\/span>/);
        const pagesMatch = crawlableLinksHtml.match(/<span id="ssr-total-pages">(\d+)<\/span>/);
        
        if (totalMatch) {
            html = html.replace(/\(free vectors available\)/, `(${parseInt(totalMatch[1]).toLocaleString()} free vectors available)`);
        }
        if (pagesMatch) {
            html = html.replace(/\/ 177/, `/ ${pagesMatch[1]}`);
        }
    }

    // Return with proper headers
    const headers = new Headers(assetResponse.headers);
    headers.set('Content-Type', 'text/html; charset=utf-8');
    headers.delete('Cache-Control');
    headers.set('Cache-Control', 'public, max-age=0, must-revalidate');

    return new Response(updatedHtml, {
        status: assetResponse.status,
        statusText: assetResponse.statusText,
        headers: headers,
    });
}
