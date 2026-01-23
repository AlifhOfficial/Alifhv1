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
    description: "Buying, selling, and using Alifh as an individual",
    items: [
      // Listing & Selling
      {
        id: "users-free-listing",
        question: "Is it free to list my car on Alifh?",
        answer: "Yes, listing your car on Alifh is completely free. There are no listing fees, no boost fees, and no hidden charges. Individual sellers pay nothing to list, sell, or promote their vehicles on the platform.",
        keywords: ["free", "cost", "price", "listing fee", "charge"],
        isPopular: true,
      },
      {
        id: "users-cost-to-sell",
        question: "How much does it cost to sell a car on Alifh?",
        answer: "It costs AED 0 to sell a car on Alifh. Individual sellers pay no listing fees, no boost fees, and no commission on sales. The platform is completely free for private car sellers in the UAE.",
        keywords: ["cost", "sell", "price", "fee", "commission"],
      },
      {
        id: "users-photo-limit",
        question: "How many photos can I upload per car listing?",
        answer: "You can upload up to 20 photos per car listing on Alifh. We recommend including exterior shots from all angles, interior photos, engine bay, and any unique features or imperfections for transparency.",
        keywords: ["photos", "images", "pictures", "upload", "limit"],
      },
      {
        id: "users-listing-duration",
        question: "How long does a car listing stay active on Alifh?",
        answer: "Car listings on Alifh stay active for 24 days. This keeps the marketplace fresh and reduces stale inventory. After expiry, you can relist your car with one tap if it hasn't sold.",
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
        question: "Why does Alifh include VIN on every listing?",
        answer: "Every Alifh listing includes the VIN (Vehicle Identification Number) to ensure transparency and help prevent fraud. This allows buyers to verify the car's history, specifications, and authenticity before contacting the seller.",
        keywords: ["vin", "vehicle identification", "required", "why"],
        isPopular: true,
      },
      {
        id: "users-vin-visible",
        question: "Is my car's VIN visible to buyers on Alifh?",
        answer: "Yes, VINs are visible to all users on Alifh. This transparency allows buyers to run independent history checks and verify vehicle details before reaching out, building trust and reducing time-wasters.",
        keywords: ["vin", "public", "visible", "show"],
      },
      // Test Drives & Booking
      {
        id: "users-test-drives",
        question: "How do test drives work on Alifh?",
        answer: "For partner (dealer) listings, buyers can book test drives directly through the listing by selecting an available time slot. For individual sellers, buyers contact you directly to arrange a test drive at a mutually convenient time.",
        keywords: ["test drive", "book", "booking", "schedule"],
      },
      {
        id: "users-book-anytime",
        question: "Can I book a test drive at any time on Alifh?",
        answer: "For partner (dealer) listings, test drive booking is available 24/7 through the platform. For individual sellers, contact the seller directly through messaging to arrange a test drive time that works for both parties.",
        keywords: ["test drive", "24/7", "anytime", "book"],
      },
      // Visibility & Ranking
      {
        id: "users-ranking",
        question: "How do car listings rank on Alifh?",
        answer: "Listings on Alifh rank based on quality, not payment. The algorithm considers photo quality, description completeness, seller response time, and ratings. There are no paid boosts or promoted listings—quality content earns visibility.",
        keywords: ["rank", "ranking", "visibility", "position", "featured"],
        isPopular: true,
      },
      {
        id: "users-no-boosts",
        question: "Can I pay to boost my car listing on Alifh?",
        answer: "No, Alifh does not sell listing boosts or paid promotions. All listings compete on quality only. To improve visibility, focus on high-quality photos, detailed descriptions, competitive pricing, and fast response times.",
        keywords: ["boost", "promote", "pay", "featured", "highlight"],
      },
      // Account & Privacy
      {
        id: "users-data-safe",
        question: "Is my personal data safe on Alifh?",
        answer: "Yes, your data is protected on Alifh. We use industry-standard security measures and encrypt data in transit. Sensitive documents like Emirates ID are stored securely and only used for verification purposes. We never sell user data to third parties.",
        keywords: ["data", "privacy", "safe", "security", "encryption"],
      },
      {
        id: "users-create-account",
        question: "How do I create an account on Alifh?",
        answer: "To create an Alifh account, click Sign Up, enter your email address, and verify it through the confirmation link. The process takes about 30 seconds. You can also sign up using Google for faster registration.",
        keywords: ["account", "sign up", "register", "create"],
      },
      {
        id: "users-uae-residents",
        question: "Is Alifh only for UAE residents?",
        answer: "No, anyone can use Alifh to buy or sell cars in the UAE. You don't need to be a UAE resident to list or browse vehicles. However, all listings must be for cars physically located in the UAE.",
        keywords: ["resident", "expat", "tourist", "foreigner", "visa", "who can use"],
      },
    ],
  },
  {
    id: "partners",
    title: "For Partners",
    description: "Dealers and businesses selling on Alifh",
    items: [
      // Becoming a Partner
      {
        id: "partners-how-to-become",
        question: "How do I become a car dealer partner on Alifh?",
        answer: "To become an Alifh partner, create an account, go to Dashboard → Requests → Partner Application, and complete the form. You'll need your company name, trade license, and VAT number. Applications are typically reviewed within 2-3 business days.",
        keywords: ["partner", "become", "apply", "dealer", "join"],
        isPopular: true,
      },
      {
        id: "partners-application-fee",
        question: "Is there a fee to apply as an Alifh partner?",
        answer: "No, applying to become an Alifh partner is completely free. You only pay once your application is approved and you choose to activate a subscription plan. There are no application or onboarding fees.",
        keywords: ["application", "fee", "cost", "apply"],
      },
      {
        id: "partners-requirements",
        question: "What are the requirements to become an Alifh partner?",
        answer: "To apply as an Alifh partner, you need: your company's legal name, trade license number and expiry date, a copy of your trade license document (PDF or image), and your VAT registration number.",
        keywords: ["apply", "requirements", "documents", "trade license"],
      },
      {
        id: "partners-approval-time",
        question: "How long does Alifh partner approval take?",
        answer: "Alifh partner applications are typically reviewed within 2-3 business days. Each application is reviewed manually by our team. You'll receive an email notification with the decision and next steps if approved.",
        keywords: ["approval", "review", "time", "days", "wait"],
      },
      // Pricing & Fees
      {
        id: "partners-no-commission",
        question: "Does Alifh take commission on car sales?",
        answer: "No, Alifh charges zero commission on sales. Partners pay only a flat monthly subscription fee. There is no percentage taken from your car sales—your profit margins remain 100% yours.",
        keywords: ["commission", "fee", "percentage", "cut", "take"],
        isPopular: true,
      },
      {
        id: "partners-pricing",
        question: "How does Alifh partner pricing work?",
        answer: "Alifh partners pay one flat monthly fee per showroom location. This includes unlimited car listings, all platform features, team management, and booking tools. No per-listing fees, no credits, no tokens.",
        keywords: ["pricing", "cost", "monthly", "fee", "plan"],
      },
      {
        id: "partners-hidden-fees",
        question: "Are there hidden fees for Alifh partners?",
        answer: "No, there are no hidden fees for Alifh partners. The monthly subscription covers everything—unlimited listings, all features, team accounts, and support. No boost fees, no premium tiers, no surprise charges.",
        keywords: ["hidden", "fees", "extra", "charges"],
      },
      {
        id: "partners-per-listing",
        question: "Do Alifh partners pay per car listing?",
        answer: "No, Alifh partners do not pay per listing. Whether you list 10 cars or 1,000 cars, you pay the same flat monthly subscription fee. There are no per-listing charges or listing limits.",
        keywords: ["per listing", "cost", "unlimited", "fee"],
      },
      // How It Works
      {
        id: "partners-alifh-sells-cars",
        question: "Does Alifh sell cars directly?",
        answer: "No, Alifh does not sell cars. Alifh is a marketplace platform that connects buyers with dealers and private sellers. We never buy, own, or sell inventory—we're your sales channel, not your competitor.",
        keywords: ["sell cars", "compete", "inventory", "Alifh cars"],
      },
      {
        id: "partners-visibility",
        question: "How do buyers find my cars on Alifh?",
        answer: "Buyers find your cars through search, filters, and quality-based ranking. Listings with better photos, complete descriptions, fast response times, and positive reviews rank higher. There are no paid boosts—quality determines visibility.",
        keywords: ["visibility", "find", "buyers", "ranking"],
      },
      {
        id: "partners-messaging",
        question: "How does messaging work for Alifh partners?",
        answer: "Each conversation is tied to a specific car listing. If the same customer inquires about two different cars, you'll have two separate chat threads. This keeps conversations organized and provides context for every inquiry.",
        keywords: ["messaging", "chat", "inbox", "organize"],
      },
      // Dashboard & Team
      {
        id: "partners-dashboard",
        question: "What features are in the Alifh partner dashboard?",
        answer: "The Alifh partner dashboard includes: inventory management, test drive booking calendar, customer messaging, performance analytics, team member management, and your public showroom profile page.",
        keywords: ["dashboard", "features", "tools", "manage"],
      },
      {
        id: "partners-add-staff",
        question: "Can I add staff members to my Alifh partner account?",
        answer: "Yes, you can add unlimited staff members to your partner account. There are two roles: Owner (full access to all listings and data) and Staff (access only to their own listings, bookings, and messages).",
        keywords: ["staff", "team", "employees", "add", "roles"],
      },
      {
        id: "partners-staff-limit",
        question: "How many staff members can I add on Alifh?",
        answer: "You can add unlimited staff members to your Alifh partner account at no extra charge. There is no cap on team size—add as many salespeople or managers as your showroom needs.",
        keywords: ["staff", "limit", "how many", "team size"],
      },
      // Brand & Profile
      {
        id: "partners-profile",
        question: "What does my Alifh partner profile show to buyers?",
        answer: "Your partner profile displays: your showroom name and logo, current inventory, total cars sold, average response time, Google Reviews rating (if synced), location with map, operating hours, and contact information.",
        keywords: ["profile", "brand", "page", "show", "display", "google"],
      },
      {
        id: "partners-sync-reviews",
        question: "Can I sync Google Reviews to my Alifh profile?",
        answer: "Yes, you can sync your Google Reviews to your Alifh partner profile with one tap in settings. Reviews are pulled automatically and displayed on your showroom page, helping build trust with potential buyers.",
        keywords: ["google reviews", "sync", "reviews", "rating"],
      },
      {
        id: "partners-non-uae-specs",
        question: "Can I list imported or non-GCC spec cars on Alifh?",
        answer: "Yes, you can list imported and non-GCC spec vehicles on Alifh. All specs are welcome—American, European, Japanese, or GCC. Just ensure the car is physically in the UAE and the VIN is accurate for buyer transparency.",
        keywords: ["import", "non-gcc", "american spec", "european", "japanese", "specs"],
      },
      {
        id: "partners-cancel-refund",
        question: "Can I cancel my Alifh partner subscription anytime?",
        answer: "Yes, you can cancel your subscription anytime from your dashboard. Cancellation takes effect at the end of your current billing period. For refund eligibility details, visit alifh.ae/refund-policy.",
        keywords: ["cancel", "refund", "subscription", "policy", "money back"],
      },
      {
        id: "partners-multiple-showrooms",
        question: "Can I have multiple showroom branches under one Alifh account?",
        answer: "Currently, each showroom location requires its own subscription. If you have multiple branches and need a custom arrangement, contact us directly—we're happy to discuss options.",
        keywords: ["multiple", "branches", "showrooms", "locations", "one account"],
      },
    ],
  },
  {
    id: "general",
    title: "General",
    description: "About Alifh, the platform, and how things work",
    items: [
      // About Alifh
      {
        id: "general-what-is-alifh",
        question: "What is Alifh?",
        answer: "Alifh is a car marketplace built for the UAE. Free for individuals, subscription-based for dealers. No paid boosts, no ads, no commissions. Just a clean platform where quality determines visibility—not how much you pay.",
        keywords: ["what is", "alifh", "about", "platform"],
        isPopular: true,
      },
      {
        id: "general-why-built",
        question: "Why was Alifh built?",
        answer: "Alifh was built because most car marketplaces prioritize revenue over user experience—selling boosts, running ads, and burying organic listings. We wanted to create a platform where the best listings rise to the top, not the ones that pay the most.",
        keywords: ["why", "built", "created", "purpose", "reason"],
      },
      {
        id: "general-mission",
        question: "What is Alifh's mission?",
        answer: "To make buying and selling cars in the UAE transparent, fair, and efficient. No games, no hidden fees, no pay-to-win. Just a clean marketplace where quality content earns visibility.",
        keywords: ["mission", "goal", "vision", "purpose"],
      },
      {
        id: "general-location",
        question: "Where is Alifh based?",
        answer: "Alifh is based in Dubai, United Arab Emirates. The team is local, the focus is the UAE market, and the platform is built specifically for how people buy and sell cars here.",
        keywords: ["location", "Dubai", "UAE", "based", "where"],
      },
      {
        id: "general-uae-only",
        question: "Is Alifh available outside the UAE?",
        answer: "Currently, Alifh is UAE-only. The platform, support, and features are designed specifically for the Emirates market. There are no immediate plans for expansion.",
        keywords: ["UAE", "country", "region", "available", "expansion"],
      },
      // How It's Different
      {
        id: "general-different",
        question: "How is Alifh different from other car platforms?",
        answer: "Most platforms make money from ads, boosts, and commissions. Alifh doesn't. Individual listings are free. Rankings are quality-based. VIN is visible on every listing. No clutter, no pay-to-play. The business model is dealer subscriptions—that's it.",
        keywords: ["different", "compare", "vs", "dubizzle", "carswitch", "cars24", "yallamotor"],
        isPopular: true,
      },
      {
        id: "general-no-ads",
        question: "Why doesn't Alifh have advertisements?",
        answer: "Because ads degrade the experience. They clutter the interface, slow things down, and create incentives that don't align with users. Alifh is funded by partner subscriptions, not advertising. No banner ads, no pop-ups, no sponsored listings.",
        keywords: ["ads", "advertising", "no ads", "why"],
      },
      {
        id: "general-no-boosts",
        question: "Why doesn't Alifh sell listing boosts?",
        answer: "Paid boosts break fairness. If visibility is for sale, the marketplace becomes pay-to-win. On Alifh, every listing competes on quality—photos, descriptions, pricing, response time. Not budget.",
        keywords: ["boost", "promote", "paid", "featured", "why"],
        isPopular: true,
      },
      {
        id: "general-vin-why",
        question: "Why does Alifh require VIN on every listing?",
        answer: "Transparency. VIN lets buyers independently verify a car's history, specs, and authenticity before reaching out. It reduces fraud, saves time, and builds trust. Every listing—individual or dealer—includes VIN.",
        keywords: ["vin", "why", "required", "transparency"],
      },
      // Trust & Safety
      {
        id: "general-prevent-scams",
        question: "How does Alifh prevent car scams?",
        answer: "VIN on every listing for verification, seller ratings and response time tracking, and review systems. These don't eliminate bad actors entirely, but they make it much harder to hide and much easier for buyers to make informed decisions.",
        keywords: ["scam", "fraud", "safe", "trust", "verify"],
      },
      {
        id: "general-verified",
        question: "Are car listings on Alifh verified?",
        answer: "Every listing includes VIN, which allows buyers to independently verify history and specs. Additional seller verification features are in development. For now, VIN transparency is the primary trust layer.",
        keywords: ["verified", "verification", "real", "legit"],
      },
      // Business Model
      {
        id: "general-business-model",
        question: "How does Alifh make money?",
        answer: "Monthly subscriptions from dealer partners. That's the entire revenue model. No ads, no commissions, no fees from individuals. Dealers pay a flat monthly rate for unlimited listings and full platform access.",
        keywords: ["money", "business model", "revenue", "how"],
      },
      {
        id: "general-sustainable",
        question: "Is Alifh's free model sustainable?",
        answer: "Yes. The model is simple: individuals list free, dealers subscribe. Dealer subscriptions fund the platform. There's no venture-funded growth hack that needs to flip later. Free for individuals is permanent—not a promotion.",
        keywords: ["sustainable", "free", "permanent", "business model"],
      },
      {
        id: "general-always-free",
        question: "Will Alifh ever charge individual sellers?",
        answer: "No, Alifh will never charge individual sellers. Free listings for private sellers is a core principle of the platform, not a temporary promotion. This commitment is permanent.",
        keywords: ["charge", "free", "individuals", "future", "ever"],
      },
      // Contact & Support
      {
        id: "general-contact",
        question: "How do I contact Alifh support?",
        answer: "To contact Alifh support, visit the Contact page on our website or send an email directly. We aim to respond to all inquiries within 24 hours on business days.",
        keywords: ["contact", "support", "help", "email", "reach"],
      },
      {
        id: "general-report",
        question: "How do I report a problem or suspicious listing on Alifh?",
        answer: "To report a problem or suspicious listing, use the Contact page or email our support team directly. Include the listing URL (if applicable), a description of the issue, and any screenshots. Reports are typically reviewed within 24 hours on business days.",
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
        question: "Is there a free trial?",
        answer: "We don't offer free trials. Instead, we focus on transparent pricing, full feature access, and hands-on support from day one.",
        keywords: ["trial", "free", "test", "demo"],
      },
      {
        id: "pricing-price-change",
        question: "Will the price stay at AED 7,000?",
        answer: "Flow is currently priced at AED 7,000 per showroom. As the platform evolves, pricing for new customers may change. Existing partners will always be notified in advance of any updates.",
        keywords: ["price", "change", "increase", "7000", "stay"],
      },
      {
        id: "pricing-payments",
        question: "How are payments handled?",
        answer: "All payments are processed securely via Stripe. Alifh does not store card details. Billing, invoicing, and compliance are handled by Stripe's industry-standard infrastructure.",
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
