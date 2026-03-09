/**
 * FAQ Data
 * Single source of truth for all FAQ questions and answers
 * Organized by audience: Users, Partners, General
 * Includes SEO-optimized questions for search ranking
 */

export type FAQItem = {
  id: string; // Stable ID for analytics + deep links
  question: string;
  answer: string;
  keywords?: string[]; // For search matching
  isPopular?: boolean; // For featured/popular ranking
};

export type FAQCategory = {
  id: string;
  title: string;
  description: string;
  items: FAQItem[];
};

export const faqData: FAQCategory[] = [
  {
    id: "users",
    title: "For Users",
    description: "Buying, selling, and using Revvup as an individual",
    items: [
      // Listing & Selling
      {
        id: "users-free-listing",
        question: "Is it free to list my car on Revvup?",
        answer: "Yes, listing your car on Revvup is completely free. There are no listing fees, no boost fees, and no hidden charges. Private sellers pay nothing to list, sell, or promote their vehicles on the platform.",
        keywords: ["free", "cost", "price", "listing fee", "charge"],
        isPopular: true,
      },
      {
        id: "users-cost-to-sell",
        question: "How much does it cost to sell a car on Revvup?",
        answer: "It costs AED 0 to sell a car on Revvup. Private sellers pay no listing fees, no boost fees, and no commission on sales. The platform is completely free for private car sellers in the UAE.",
        keywords: ["cost", "sell", "price", "fee", "commission"],
      },
      {
        id: "users-photo-limit",
        question: "How many photos can I upload per car listing?",
        answer: "You can upload up to 20 photos per car listing on Revvup. We recommend including exterior shots from all angles, interior photos, engine bay, and any unique features or imperfections for transparency.",
        keywords: ["photos", "images", "pictures", "upload", "limit"],
      },
      {
        id: "users-listing-duration",
        question: "How long does a car listing stay active on Revvup?",
        answer: "Car listings on Revvup stay active for 24 days. This keeps the marketplace fresh and reduces stale inventory. After expiry, you can relist your car with one tap if it hasn't sold.",
        keywords: ["listing", "duration", "expire", "active", "days"],
      },
      {
        id: "users-edit-listing",
        question: "Can I edit my car listing after posting?",
        answer: "Yes, you can edit your car listing anytime after posting. There are no limits on edits—update your price, photos, description, or any other details as often as needed at no cost.",
        keywords: ["edit", "update", "change", "modify"],
      },
      // VIN & Transparency
      {
        id: "users-vin-required",
        question: "Why does Revvup collect VIN when listing?",
        answer: "We collect VIN to prevent abuse—spam posts, fraudulent listings, and bad actors. It's a verification step that keeps the marketplace clean. Whether to display your VIN publicly is your choice.",
        keywords: ["vin", "vehicle identification", "required", "why", "collect"],
        isPopular: true,
      },
      {
        id: "users-vin-visible",
        question: "Is my car's VIN visible to buyers on Revvup?",
        answer: "That's up to you. We collect VIN during listing to prevent abuse, but you choose whether to show it publicly or keep it private.",
        keywords: ["vin", "public", "visible", "show", "display", "hide"],
      },
      // Test Drives & Booking
      {
        id: "users-test-drives",
        question: "How do test drives work on Revvup?",
        answer: "For partner (dealer) listings, buyers can book test drives directly through the listing by selecting an available time slot. For individual sellers, buyers contact you directly to arrange a test drive at a mutually convenient time.",
        keywords: ["test drive", "book", "booking", "schedule"],
      },
      {
        id: "users-book-anytime",
        question: "Can I book a test drive at any time on Revvup?",
        answer: "For partner (dealer) listings, test drive booking is available 24/7 through the platform. For individual sellers, contact the seller directly through messaging to arrange a test drive time that works for both parties.",
        keywords: ["test drive", "24/7", "anytime", "book"],
      },
      // Visibility & Ranking
      {
        id: "users-ranking",
        question: "How do car listings rank on Revvup?",
        answer: "Listings on Revvup rank based on quality, not payment. The algorithm considers photo quality, description completeness, seller response time, and ratings. There are no paid boosts or promoted listings—quality content earns visibility.",
        keywords: ["rank", "ranking", "visibility", "position", "featured"],
        isPopular: true,
      },
      {
        id: "users-no-boosts",
        question: "Can I pay to boost my car listing on Revvup?",
        answer: "No, Revvup does not sell listing boosts or paid promotions. All listings compete on quality only. To improve visibility, focus on high-quality photos, detailed descriptions, competitive pricing, and fast response times.",
        keywords: ["boost", "promote", "pay", "featured", "highlight"],
      },
      // Account & Privacy
      {
        id: "users-data-safe",
        question: "Is my personal data safe on Revvup?",
        answer: "Yes, your data is protected on Revvup. We use industry-standard security measures and encrypt data in transit. Sensitive documents like Emirates ID are stored securely and only used for verification purposes. We never sell user data to third parties.",
        keywords: ["data", "privacy", "safe", "security", "encryption"],
      },
      {
        id: "users-create-account",
        question: "How do I create an account on Revvup?",
        answer: "To create an Revvup account, click Sign Up, enter your email address, and verify it through the confirmation link. The process takes about 30 seconds. You can also sign up using Google for faster registration.",
        keywords: ["account", "sign up", "register", "create"],
      },
      {
        id: "users-uae-residents",
        question: "Is Revvup only for UAE residents?",
        answer: "No, anyone can use Revvup to buy or sell cars in the UAE. You don't need to be a UAE resident to list or browse vehicles. However, all listings must be for cars physically located in the UAE.",
        keywords: ["resident", "expat", "tourist", "foreigner", "visa", "who can use"],
      },
      // Alternatives & Comparisons (for SEO)
      {
        id: "users-best-place-sell-car",
        question: "What is the best place to sell a car in Dubai?",
        answer: "The best place depends on your priorities. If you want free listing with no fees, clean interface, and quality-based rankings instead of pay-to-win, Revvup is built for that. No boost fees, no commissions, no hidden charges—just list and sell.",
        keywords: ["best place", "sell car", "dubai", "where", "site"],
        isPopular: true,
      },
      {
        id: "users-free-car-listing-dubai",
        question: "Where can I list my car for free in Dubai?",
        answer: "On Revvup, private car listings are 100% free—forever. No listing fees, no boost fees, no commission on sale. Upload up to 20 photos and reach serious buyers without paying anything.",
        keywords: ["free", "list car", "dubai", "where", "no fee"],
        isPopular: true,
      },
      {
        id: "users-avoid-listing-fees",
        question: "How can I avoid car listing fees in Dubai?",
        answer: "Use Revvup. It's the only major car marketplace in the UAE where private sellers pay zero fees—no listing fees, no boost fees, no success fees, no commission. The platform is funded by dealer subscriptions, so private sellers list free.",
        keywords: ["avoid", "fees", "listing", "free", "no charge"],
      },
      {
        id: "users-sell-car-without-fees",
        question: "Can I sell my car online in Dubai without paying fees?",
        answer: "Yes. Revvup offers completely free listings for private sellers. No upfront fees, no boost fees to get visibility, and no commission when your car sells. Your listing competes on quality, not budget.",
        keywords: ["sell car", "without fees", "online", "dubai", "free"],
      },
      {
        id: "users-free-alternative",
        question: "Is there a free alternative to paid car listing sites?",
        answer: "Yes. Revvup is free for private sellers with no listing fees, no boost fees, and no commission. Unlike traditional classifieds, rankings are based on listing quality—not how much you pay.",
        keywords: ["dubizzle", "alternative", "free", "compare"],
        isPopular: true,
      },
      {
        id: "users-instant-offer-alternative",
        question: "Can I sell my car myself instead of to an instant-offer site?",
        answer: "Yes. If you want to sell your car yourself instead of accepting a dealer's offer, Revvup lets you list for free and keep 100% of the sale price. No instant offers below market value—you set your price and deal directly with buyers.",
        keywords: ["cars24", "alternative", "sell yourself", "better price", "instant offer"],
      },
      {
        id: "users-no-commission-marketplace",
        question: "Is there a car marketplace with no commission in the UAE?",
        answer: "Yes. Revvup charges zero commission on all sales. Private sellers list free, and dealers pay a flat monthly subscription. When your car sells, you keep 100%—no percentage taken by the platform.",
        keywords: ["no commission", "marketplace", "uae", "zero", "keep all"],
      },
      {
        id: "users-pay-to-boost",
        question: "Do I need to pay to boost my car listing to sell faster?",
        answer: "Not on Revvup. Paid boosts don't exist here. All listings rank based on quality—photo quality, description completeness, competitive pricing, and response time. You can't buy visibility; you earn it.",
        keywords: ["pay to boost", "promote", "featured", "sell faster"],
      },
      {
        id: "users-best-car-website-dubai",
        question: "What is the best car website in Dubai for 2026?",
        answer: "Revvup stands out for transparency: no paid boosts, no ads cluttering the experience, quality-based rankings. Free for private sellers, subscription-based for dealers. If you value fair rankings and honest transactions, it's built for that.",
        keywords: ["best", "car website", "dubai", "2026", "top"],
      },
      {
        id: "users-sell-car-quickly-dubai",
        question: "How can I sell my car quickly in Dubai?",
        answer: "List on Revvup with high-quality photos (use all 20 slots), write a detailed description, price competitively, and respond quickly to inquiries. Quality listings rank higher organically—no need to pay for visibility.",
        keywords: ["sell quickly", "fast", "tips", "how to", "dubai"],
      },
      {
        id: "users-verified-car-marketplace",
        question: "Is there a verified car marketplace in Dubai?",
        answer: "Revvup verifies listings through VIN collection to prevent abuse and keep quality high. Seller ratings, response times, and reviews add additional trust layers. It's a cleaner marketplace by design.",
        keywords: ["verified", "authentic", "trusted", "legit", "quality"],
      },
      {
        id: "users-sell-luxury-car-dubai",
        question: "What's the best way to sell a luxury car in Dubai?",
        answer: "For high-value cars, presentation matters. Revvup's clean, ad-free interface showcases your car professionally. Upload 20 high-quality photos, provide detailed specs, and let the car speak for itself—no competing ads or clutter.",
        keywords: ["luxury", "premium", "high value", "supercar", "best way"],
      },
      {
        id: "users-compare-car-platforms",
        question: "How do I compare car selling platforms in Dubai?",
        answer: "Check for: listing fees (Revvup: free), boost fees (Revvup: none exist), commission (Revvup: 0%), and ranking fairness (Revvup: quality-based only). These factors determine your cost and visibility.",
        keywords: ["compare", "platforms", "which", "best", "features"],
      },
    ],
  },
  {
    id: "partners",
    title: "For Partners",
    description: "Dealers and businesses selling on Revvup",
    items: [
      // Becoming a Partner
      {
        id: "partners-how-to-become",
        question: "How do I become a car dealer partner on Revvup?",
        answer: "To become an Revvup partner, create an account, go to Dashboard → Requests → Partner Application, and complete the form. You'll need your company name, trade license, and VAT number. Applications are typically reviewed within 2-3 business days.",
        keywords: ["partner", "become", "apply", "dealer", "join"],
        isPopular: true,
      },
      {
        id: "partners-application-fee",
        question: "Is there a fee to apply as an Revvup partner?",
        answer: "No, applying to become an Revvup partner is completely free. You only pay once your application is approved and you choose to activate a subscription plan. There are no application or onboarding fees.",
        keywords: ["application", "fee", "cost", "apply"],
      },
      {
        id: "partners-requirements",
        question: "What are the requirements to become an Revvup partner?",
        answer: "To apply as an Revvup partner, you need: your company's legal name, trade license number and expiry date, a copy of your trade license document (PDF or image), and your VAT registration number.",
        keywords: ["apply", "requirements", "documents", "trade license"],
      },
      {
        id: "partners-approval-time",
        question: "How long does Revvup partner approval take?",
        answer: "Revvup partner applications are typically reviewed within 2-3 business days. Each application is reviewed manually by our team. You'll receive an email notification with the decision and next steps if approved.",
        keywords: ["approval", "review", "time", "days", "wait"],
      },
      // Pricing & Fees
      {
        id: "partners-no-commission",
        question: "Does Revvup take commission on car sales?",
        answer: "No, Revvup charges zero commission on sales. Partners pay only a flat monthly subscription fee. There is no percentage taken from your car sales—your profit margins remain 100% yours.",
        keywords: ["commission", "fee", "percentage", "cut", "take"],
        isPopular: true,
      },
      {
        id: "partners-pricing",
        question: "How does Revvup partner pricing work?",
        answer: "Revvup partners pay one flat monthly fee per showroom location. This includes unlimited car listings, all platform features, team management, and booking tools. No per-listing fees, no credits, no tokens.",
        keywords: ["pricing", "cost", "monthly", "fee", "plan"],
      },
      {
        id: "partners-hidden-fees",
        question: "Are there hidden fees for Revvup partners?",
        answer: "No, there are no hidden fees for Revvup partners. The monthly subscription covers everything—unlimited listings, all features, team accounts, and support. No boost fees, no premium tiers, no surprise charges.",
        keywords: ["hidden", "fees", "extra", "charges"],
      },
      {
        id: "partners-per-listing",
        question: "Do Revvup partners pay per car listing?",
        answer: "No, Revvup partners do not pay per listing. Whether you list 10 cars or 1,000 cars, you pay the same flat monthly subscription fee. There are no per-listing charges or listing limits.",
        keywords: ["per listing", "cost", "unlimited", "fee"],
      },
      // How It Works
      {
        id: "partners-revvup-sells-cars",
        question: "Does Revvup sell cars directly?",
        answer: "No, Revvup does not sell cars. Revvup is a marketplace platform that connects buyers with dealers and private sellers. We never buy, own, or sell inventory—we're your sales channel, not your competitor.",
        keywords: ["sell cars", "compete", "inventory", "Revvup cars"],
      },
      {
        id: "partners-visibility",
        question: "How do buyers find my cars on Revvup?",
        answer: "Buyers find your cars through search, filters, and quality-based ranking. Listings with better photos, complete descriptions, fast response times, and positive reviews rank higher. There are no paid boosts—quality determines visibility.",
        keywords: ["visibility", "find", "buyers", "ranking"],
      },
      {
        id: "partners-messaging",
        question: "How does messaging work for Revvup partners?",
        answer: "Each conversation is tied to a specific car listing. If the same customer inquires about two different cars, you'll have two separate chat threads. This keeps conversations organized and provides context for every inquiry.",
        keywords: ["messaging", "chat", "inbox", "organize"],
      },
      // Dashboard & Team
      {
        id: "partners-dashboard",
        question: "What features are in the Revvup partner dashboard?",
        answer: "The Revvup partner dashboard includes: inventory management, test drive booking calendar, customer messaging, performance analytics, team member management, and your public showroom profile page.",
        keywords: ["dashboard", "features", "tools", "manage"],
      },
      {
        id: "partners-add-staff",
        question: "Can I add staff members to my Revvup partner account?",
        answer: "Yes, you can add unlimited staff members to your partner account. There are two roles: Owner (full access to all listings and data) and Staff (access only to their own listings, bookings, and messages).",
        keywords: ["staff", "team", "employees", "add", "roles"],
      },
      {
        id: "partners-staff-limit",
        question: "How many staff members can I add on Revvup?",
        answer: "You can add unlimited staff members to your Revvup partner account at no extra charge. There is no cap on team size—add as many salespeople or managers as your showroom needs.",
        keywords: ["staff", "limit", "how many", "team size"],
      },
      // Brand & Profile
      {
        id: "partners-profile",
        question: "What does my Revvup partner profile show to buyers?",
        answer: "Your partner profile displays: your showroom name and logo, current inventory, total cars sold, average response time, Google Rating (if synced), location with map, and contact information.",
        keywords: ["profile", "brand", "page", "show", "display", "google"],
      },
      {
        id: "partners-sync-reviews",
        question: "Can I sync Google Ratings to my Revvup profile?",
        answer: "Yes, Google Ratings are automatically synced to your Revvup partner profile and displayed on your showroom page, helping build trust with potential buyers. Black partners receive custom review integration measures.",
        keywords: ["google ratings", "sync", "ratings", "rating"],
      },
      {
        id: "partners-non-uae-specs",
        question: "Can I list imported or non-GCC spec cars on Revvup?",
        answer: "Yes, you can list imported and non-GCC spec vehicles on Revvup. All specs are welcome—American, European, Japanese, or GCC. Just ensure the car is physically in the UAE.",
        keywords: ["import", "non-gcc", "american spec", "european", "japanese", "specs"],
      },
      {
        id: "partners-cancel-refund",
        question: "Can I cancel my Revvup partner subscription anytime?",
        answer: "Yes, you can cancel your subscription anytime from your dashboard. Cancellation takes effect at the end of your current billing period.",
        keywords: ["cancel", "refund", "subscription", "policy", "money back"],
      },
      {
        id: "partners-multiple-showrooms",
        question: "Can I have multiple showroom branches under one Revvup account?",
        answer: "Currently, each showroom location requires its own subscription. If you have multiple branches and need a custom arrangement, contact us directly—we're happy to discuss options.",
        keywords: ["multiple", "branches", "showrooms", "locations", "one account"],
      },
      // High-intent dealer questions
      {
        id: "partners-platform-alternative",
        question: "Is Revvup a good alternative to traditional car listing platforms?",
        answer: "Yes. Unlike traditional classifieds, Revvup charges zero commission and no per-listing fees. You pay one flat monthly subscription for unlimited listings. No boost fees, no bidding for visibility—your listings rank on quality, not payment. Many dealers switch from legacy platforms to reduce costs and increase transparency.",
        keywords: ["dubizzle", "alternative", "switch", "compare", "better"],
        isPopular: true,
      },
      {
        id: "partners-increase-sales",
        question: "How can Revvup help me sell more cars in Dubai?",
        answer: "Revvup is built to maximize your visibility without extra fees. Unlimited listings mean your full inventory is always online. Quality-based ranking rewards good photos and fast responses. Built-in test drive booking reduces friction. Analytics show what's working. And zero commission means every sale stays 100% yours.",
        keywords: ["sell more", "increase sales", "grow", "dubai", "how"],
        isPopular: true,
      },
      {
        id: "partners-leads-quality",
        question: "What kind of leads do dealers get on Revvup?",
        answer: "Revvup delivers high-intent buyer leads. Every inquiry comes through a specific car listing, so you know exactly what the buyer wants. No tire-kickers, no spam inquiries from bots—just serious buyers ready to talk.",
        keywords: ["leads", "quality", "buyers", "inquiries", "genuine"],
      },
      {
        id: "partners-inventory-management",
        question: "Does Revvup offer inventory management software?",
        answer: "Yes. The partner dashboard includes full inventory management—add, edit, and organize your listings in one place. Track which cars get views, inquiries, and bookings. Bulk upload support coming soon. All included in your subscription, no extra software needed.",
        keywords: ["inventory", "management", "software", "dashboard", "organize"],
      },
      {
        id: "partners-crm-features",
        question: "Does Revvup include CRM or lead management tools?",
        answer: "Yes. Every inquiry creates a conversation thread tied to the specific car. See message history, response times, and buyer interest. Staff can be assigned to handle leads. Analytics track your team's performance. It's built-in CRM designed specifically for car sales.",
        keywords: ["CRM", "lead management", "customer", "track", "tools"],
      },
      {
        id: "partners-test-drive-booking",
        question: "How does test drive booking work for dealers on Revvup?",
        answer: "Buyers can book test drives directly through your listings. Set your available time slots in the dashboard. Receive instant notifications when bookings come in. Manage, confirm, or reschedule all from one calendar. No phone tag, no missed opportunities.",
        keywords: ["test drive", "booking", "schedule", "calendar", "manage"],
      },
      {
        id: "partners-analytics",
        question: "What analytics do Revvup partners get?",
        answer: "Full visibility into your performance: listing views, inquiry rates, response times, booking conversions, and more. See which cars perform best, which need better photos, and how your team responds. Data-driven insights to help you sell more.",
        keywords: ["analytics", "data", "insights", "performance", "reports"],
      },
      {
        id: "partners-boost-visibility",
        question: "How do I get more visibility for my listings on Revvup?",
        answer: "On Revvup, visibility is earned, not bought. To rank higher: use high-quality photos (20 per listing), write detailed descriptions, price competitively, respond quickly to inquiries, and maintain good ratings. No paid boosts exist—quality determines ranking.",
        keywords: ["visibility", "boost", "ranking", "featured", "promote"],
      },
      {
        id: "partners-showroom-page",
        question: "Do dealers get a branded showroom page on Revvup?",
        answer: "Yes. Every partner gets a dedicated showroom page with your logo, location, full inventory, and Google Rating (if synced). Black tier partners receive custom branding and enhanced showroom presentation.",
        keywords: ["showroom page", "branded", "profile", "dealer page", "storefront"],
      },
      {
        id: "partners-why-switch",
        question: "Why should I switch from my current platform to Revvup?",
        answer: "Three reasons: cost, fairness, and alignment. Cost: flat fee, no commission, no boost fees. Fairness: quality-based ranking, not pay-to-win. Alignment: we don't sell cars—we help YOU sell. Unlike platforms that compete for your customers, we only succeed when you do.",
        keywords: ["switch", "why", "better", "change", "move"],
        isPopular: true,
      },
      {
        id: "partners-luxury-cars",
        question: "Is Revvup good for luxury and premium car dealers?",
        answer: "Yes. Revvup's clean, ad-free interface is designed for premium presentation. Black tier offers elevated showroom branding and premium listing formats. Many luxury dealers choose Revvup for the professional, clutter-free experience.",
        keywords: ["luxury", "premium", "high-end", "supercar", "exotic"],
      },
      {
        id: "partners-used-cars",
        question: "Is Revvup suitable for used car dealers?",
        answer: "Absolutely. Revvup is built for used car dealers of all sizes. Unlimited listings mean your full inventory is online. Quality-based ranking rewards dealers who present cars well and respond quickly.",
        keywords: ["used cars", "pre-owned", "second hand", "certified"],
      },
      {
        id: "partners-small-dealer",
        question: "Is Revvup worth it for small dealers with few cars?",
        answer: "Yes. The flat subscription means you pay the same whether you have 5 cars or 500. No per-listing fees. All features included. Small dealers often see the best ROI because they're not paying for unused boost credits or per-car fees.",
        keywords: ["small dealer", "few cars", "worth it", "small inventory", "startup"],
      },
      {
        id: "partners-abu-dhabi-sharjah",
        question: "Can dealers outside Dubai list on Revvup?",
        answer: "Yes. Revvup covers all Emirates—Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah, and Umm Al Quwain. Your showroom location is displayed to buyers, and they can filter by area. The platform is UAE-wide.",
        keywords: ["abu dhabi", "sharjah", "ajman", "emirates", "outside dubai"],
      },
    ],
  },
  {
    id: "general",
    title: "General",
    description: "About Revvup, the platform, and how things work",
    items: [
      // About Revvup
      {
        id: "general-what-is-revvup",
        question: "What is Revvup?",
        answer: "Revvup is a car marketplace built for the UAE. Free for private sellers, subscription-based for dealers. No paid boosts, no ads, no commissions. Just a clean platform where quality determines visibility—not how much you pay.",
        keywords: ["what is", "revvup", "about", "platform"],
        isPopular: true,
      },
      {
        id: "general-why-built",
        question: "Why was Revvup built?",
        answer: "Revvup was built because most car marketplaces prioritize revenue over user experience—selling boosts, running ads, and burying organic listings. We wanted to create a platform where the best listings rise to the top, not the ones that pay the most.",
        keywords: ["why", "built", "created", "purpose", "reason"],
      },
      {
        id: "general-mission",
        question: "What is Revvup's mission?",
        answer: "To make buying and selling cars in the UAE transparent, fair, and efficient. No games, no hidden fees, no pay-to-win. Just a clean marketplace where quality content earns visibility.",
        keywords: ["mission", "goal", "vision", "purpose"],
      },
      {
        id: "general-location",
        question: "Where is Revvup based?",
        answer: "Revvup is based in Dubai, United Arab Emirates. The team is local, the focus is the UAE market, and the platform is built specifically for how people buy and sell cars here.",
        keywords: ["location", "Dubai", "UAE", "based", "where"],
      },
      {
        id: "general-uae-only",
        question: "Is Revvup available outside the UAE?",
        answer: "Currently, Revvup is UAE-only. The platform, support, and features are designed specifically for the Emirates market. There are no immediate plans for expansion.",
        keywords: ["UAE", "country", "region", "available", "expansion"],
      },
      // How It's Different
      {
        id: "general-different",
        question: "How is Revvup different from other car platforms?",
        answer: "Revvup was built to change how cars are bought and sold in the UAE. We believe in fairness—no paid boosts, no pay-to-win. We believe in clarity—clean design, no clutter, no ads. Most platforms optimize for their revenue. We optimize for trust. That's the difference.",
        keywords: ["different", "compare", "vs", "dubizzle", "carswitch", "cars24", "yallamotor"],
        isPopular: true,
      },
      {
        id: "general-no-ads",
        question: "Why doesn't Revvup have advertisements?",
        answer: "Because ads degrade the experience. They clutter the interface, slow things down, and create incentives that don't align with users. Revvup is funded by partner subscriptions, not advertising. No banner ads, no pop-ups, no sponsored listings.",
        keywords: ["ads", "advertising", "no ads", "why"],
      },
      {
        id: "general-no-boosts",
        question: "Why doesn't Revvup sell listing boosts?",
        answer: "Paid boosts break fairness. If visibility is for sale, the marketplace becomes pay-to-win. On Revvup, every listing competes on quality—photos, descriptions, pricing, response time. Not budget.",
        keywords: ["boost", "promote", "paid", "featured", "why"],
        isPopular: true,
      },
      {
        id: "general-vin-why",
        question: "Why does Revvup collect VIN when listing?",
        answer: "To prevent abuse—spam, fraud, and bad actors. VIN collection is a verification step that keeps the marketplace clean. Whether to display your VIN publicly is your choice.",
        keywords: ["vin", "why", "required", "collect"],
      },
      // Trust & Safety
      {
        id: "general-prevent-scams",
        question: "How does Revvup prevent car scams?",
        answer: "VIN collection during listing prevents abuse, seller ratings and response time tracking enable informed decisions, and review systems help identify bad actors. These don't eliminate fraud entirely, but they make it much harder to hide.",
        keywords: ["scam", "fraud", "safe", "trust", "verify"],
      },
      {
        id: "general-verified",
        question: "Are car listings on Revvup verified?",
        answer: "We collect VIN during listing to prevent abuse and verify authenticity. Seller ratings, response times, and reviews add additional trust layers. More verification features are in development.",
        keywords: ["verified", "verification", "real", "legit"],
      },
      // Business Model
      {
        id: "general-business-model",
        question: "How does Revvup make money?",
        answer: "Monthly subscriptions from dealer partners. That's the entire revenue model. No ads, no commissions, no fees from private sellers. Dealers pay a flat monthly rate for unlimited listings and full platform access.",
        keywords: ["money", "business model", "revenue", "how"],
      },
      {
        id: "general-sustainable",
        question: "Is Revvup's free model sustainable?",
        answer: "Yes. The model is simple: private sellers list free, dealers subscribe. Dealer subscriptions fund the platform. There's no venture-funded growth hack that needs to flip later. Free for private sellers is permanent—not a promotion.",
        keywords: ["sustainable", "free", "permanent", "business model"],
      },
      {
        id: "general-always-free",
        question: "Will Revvup ever charge private sellers?",
        answer: "No, Revvup will never charge private sellers. Free listings for private sellers is a core principle of the platform, not a temporary promotion. This commitment is permanent.",
        keywords: ["charge", "free", "private", "future", "ever"],
      },
      // Contact & Support
      {
        id: "general-contact",
        question: "How do I contact Revvup support?",
        answer: "To contact Revvup support, email us at support@revvup.ae or visit the Contact page on our website. We aim to respond to all inquiries within 24 hours on business days.",
        keywords: ["contact", "support", "help", "email", "reach"],
      },
      {
        id: "general-report",
        question: "How do I report a problem or suspicious listing on Revvup?",
        answer: "To report a problem or suspicious listing, email support@revvup.ae with the listing URL (if applicable), a description of the issue. Reports are typically reviewed within 24 hours on business days.",
        keywords: ["report", "problem", "issue", "bug", "complaint"],
      },
    ],
  },
  {
    id: "pricing",
    title: "Pricing & Plans",
    description: "Partner subscriptions, Flow vs Black, and billing",
    items: [
      {
        id: "pricing-black-listing",
        question: "What is a Black listing?",
        answer: "A Black listing is a premium presentation format for cars that deserve more than a standard listing. Not every car is the same—some are worth significantly more and deserve a richer showcase. Black listings give those cars the visual treatment they merit. Flow includes 1 Black listing, Black tier includes 5.",
        keywords: ["black listing", "premium", "showcase", "featured"],
        isPopular: true,
      },
      {
        id: "pricing-rankings",
        question: "Will Black get me better rankings?",
        answer: "No. Listings rank the same for all partners. There is no boost, no priority placement, no algorithmic advantage. Black is about how your brand is presented—not how your listings perform.",
        keywords: ["black", "rankings", "boost", "priority", "algorithm"],
        isPopular: true,
      },
      {
        id: "pricing-missing-features",
        question: "Is Flow missing anything?",
        answer: "No. Flow includes every feature we offer—unlimited listings, full analytics, lead management, staff accounts, and all platform tools. Nothing is held back. Black adds branding and white-glove service, not functionality.",
        keywords: ["flow", "missing", "features", "complete", "full"],
        isPopular: true,
      },
      {
        id: "pricing-recommend",
        question: "Which plan do you recommend?",
        answer: "Flow. For almost every dealer, Flow is the right choice. It's complete, fairly priced, and built to scale. Black exists for partners who want premium brand presentation and dedicated support—but it's not better, just different.",
        keywords: ["recommend", "which", "plan", "best", "choose"],
      },
      {
        id: "pricing-black-limited",
        question: "Why is Black availability limited?",
        answer: "Black includes hands-on account management, custom branding work, and priority support. That level of attention doesn't scale infinitely. We limit Black spots to ensure every partner in the tier gets the service they're paying for.",
        keywords: ["black", "limited", "availability", "spots", "why"],
      },
      {
        id: "pricing-unbiased",
        question: "How do you keep results unbiased?",
        answer: "Simple: we don't sell ranking boosts. Every listing—Flow or Black—competes on the same terms. What you pay affects your brand presentation and support level, never your visibility or placement.",
        keywords: ["unbiased", "fair", "equal", "rankings", "boost"],
      },
      {
        id: "pricing-black-price",
        question: "Why is Black 3× the price?",
        answer: "Black is not about more features or better rankings. It's about brand presence, premium positioning, and dedicated attention—including custom branding, priority support, and deeper visibility into your business performance.",
        keywords: ["black", "price", "expensive", "cost", "3x"],
      },
      {
        id: "pricing-showroom",
        question: "What counts as a showroom?",
        answer: "A showroom refers to a single physical dealership location operating under one brand and inventory team. Each showroom subscription includes unlimited listings, staff accounts, and full access to the platform.",
        keywords: ["showroom", "location", "branch", "dealership"],
      },
      {
        id: "pricing-branches",
        question: "We have multiple branches. Can we use one subscription?",
        answer: "At the moment, each physical showroom requires its own subscription. This ensures clean inventory separation, accurate analytics, and proper brand representation per location. If you operate multiple branches and need a custom setup, contact us to discuss options.",
        keywords: ["branches", "multiple", "locations", "subscription", "one"],
      },
      {
        id: "pricing-switch",
        question: "Can I switch between Flow and Black?",
        answer: "Yes. You can upgrade from Flow to Black at any time—subject to availability. Downgrades are also supported and take effect at the next billing cycle.",
        keywords: ["switch", "upgrade", "downgrade", "change", "plan"],
      },
      {
        id: "pricing-small-inventory",
        question: "What if I only have 5 cars right now?",
        answer: "Flow is designed to scale with you. Whether you list 5 cars or 500, the platform, tools, and pricing remain the same.",
        keywords: ["small", "inventory", "few", "cars", "scale"],
      },
      {
        id: "pricing-trial",
        question: "What is the Founding Dealer Program?",
        answer: "A limited launch program for early partners. You get three months of full platform access with no credit card required, a direct line to our team, and the ability to shape the platform as we build it.",
        keywords: ["founding", "program", "trial", "test", "access"],
        isPopular: true,
      },
      {
        id: "pricing-price-change",
        question: "Will pricing change?",
        answer: "Pricing is subject to change as the platform scales—based on market conditions, demand, and operational efficiency. We offer a limited number of rate-lock spots for founding members who commit early. Not all founding members are guaranteed a locked rate—only the first to commit.",
        keywords: ["price", "change", "increase", "7000", "stay", "locked"],
      },
      {
        id: "pricing-payments",
        question: "How are payments handled?",
        answer: "All payments are processed securely via Stripe. Revvup does not store card details. Billing, invoicing, and compliance are handled by Stripe's industry-standard infrastructure.",
        keywords: ["payment", "stripe", "billing", "invoice", "card"],
      },
    ],
  },
];

// Helper to get all FAQ items flat (for search)
export function getAllFAQItems(): (FAQItem & { category: string })[] {
  return faqData.flatMap((category) =>
    category.items.map((item) => ({
      ...item,
      category: category.title,
    }))
  );
}

// Helper to get popular FAQ items
export function getPopularFAQItems(): (FAQItem & { category: string })[] {
  return getAllFAQItems().filter((item) => item.isPopular);
}
