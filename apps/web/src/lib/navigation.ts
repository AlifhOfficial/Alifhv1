/**
 * Centralized Navigation Configuration
 * Single source of truth for navbar, footer, and sitemap
 * 
 * Update this file to automatically sync:
 * - Navbar items
 * - Footer links
 * - Sitemap URLs
 */

export interface NavSubItem {
  label: string;
  href: string;
  description?: string;
}

export interface NavSubmenu {
  title: string;
  items: NavSubItem[];
}

export interface NavItem {
  label: string;
  href: string;
  submenu?: NavSubmenu[];
  hideSubmenu?: boolean; // Show as direct link in navbar, but keep submenu for sitemap
}

// ==========================================
// MAIN NAVIGATION (Navbar)
// ==========================================
export const navItems: NavItem[] = [
  {
    label: "Listings",
    href: "/listings",
    submenu: [
      {
        title: "Explore Listings",
        items: [
          { label: "All Vehicles", href: "/listings" },
          { label: "Black Collection", href: "/listings?black=true" },
          { label: "Black Members", href: "/listings?blackTier=true" },
          { label: "New Arrivals", href: "/listings?sort=newest" },
        ],
      },
      {
        title: "Shop by Type",
        items: [
          { label: "Sedans", href: "/listings?bodyType=sedan" },
          { label: "SUVs", href: "/listings?bodyType=suv" },
          { label: "Coupes", href: "/listings?bodyType=coupe" },
        ],
      },
      {
        title: "More from Listings",
        items: [
          { label: "Under AED 50k", href: "/listings?priceMax=50000" },
          { label: "Under AED 100k", href: "/listings?priceMax=100000" },
          { label: "Low Mileage", href: "/listings?mileageMax=50000" },
          { label: "Negotiable", href: "/listings?negotiable=true" },
        ],
      },
    ],
  },
  {
    label: "Black",
    href: "/black",
  },
  {
    label: "Partners",
    href: "/partner",
    submenu: [
      {
        title: "For Dealers",
        items: [
          { label: "Partner with Revvup", href: "/partner" },
          { label: "Partnership Guide", href: "/dealer-partners" },
          { label: "Pricing", href: "/pricing" },
        ],
      },
    ],
  },
  {
    label: "About",
    href: "/about",
    submenu: [
      {
        title: "Company",
        items: [
          { label: "About Revvup", href: "/about" },
          { label: "How Ranking Works", href: "/how-ranking-works" },
          { label: "Badges", href: "/badges" },
          { label: "Vision 2031", href: "/vision" },
        ],
      },
    ],
  },
  {
    label: "Help",
    href: "/faq",
  },
  {
    label: "Tools",
    href: "/tools",
    hideSubmenu: true,
    submenu: [
      {
        title: "Valuation",
        items: [
          { label: "Car Valuation", href: "/tools/car-valuation-uae", description: "Get accurate market value" },
          { label: "Is It Overpriced?", href: "/tools/is-car-overpriced", description: "Check if a deal is fair" },
        ],
      },
      {
        title: "Financial",
        items: [
          { label: "Loan Calculator", href: "/tools/loan-calculator", description: "Calculate EMI payments" },
          { label: "Depreciation Calculator", href: "/tools/depreciation-calculator", description: "5-year value projection" },
          { label: "Ownership Cost", href: "/tools/ownership-cost-calculator", description: "True cost of ownership" },
        ],
      },
      {
        title: "Running Costs",
        items: [
          { label: "Fuel Cost Calculator", href: "/tools/fuel-cost-calculator", description: "Monthly fuel expenses" },
          { label: "Insurance Estimator", href: "/tools/insurance-estimator", description: "Insurance quote estimates" },
          { label: "Registration Fees", href: "/tools/registration-fee-calculator", description: "RTA fees by emirate" },
        ],
      },
      {
        title: "Guides & Fun",
        items: [
          { label: "Buying Checklist", href: "/tools/buying-checklist", description: "Pre-purchase inspection" },
          { label: "Car Personality Quiz", href: "/tools/car-personality-quiz", description: "Find your perfect match" },
          { label: "Dream Car Matcher", href: "/tools/dream-car-matcher", description: "AI-powered recommendations" },
        ],
      },
    ],
  },
];

// ==========================================
// FOOTER LINKS
// ==========================================
export interface FooterSection {
  title: string;
  links: { label: string; href: string }[];
}

export const footerSections: FooterSection[] = [
  {
    title: "Browse",
    links: [
      { label: "Cars", href: "/listings" },
      { label: "Sell", href: "/user-dashboard/listings/new" },
      { label: "Black", href: "/black" },
      { label: "Tools", href: "/tools" },
    ],
  },
  {
    title: "Partners",
    links: [
      { label: "Become a Partner", href: "/partner" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Vision 2031", href: "/vision" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/terms-of-service" },
      { label: "Privacy", href: "/privacy-policy" },
    ],
  },
];

export const footerBottomLinks = [
  { label: "Dealer Agreement", href: "/dealer-agreement" },
  { label: "Acceptable Use", href: "/acceptable-use-policy" },
  { label: "IP Policy", href: "/intellectual-property" },
  { label: "Refunds", href: "/refund-policy" },
  { label: "Disclaimer", href: "/disclaimer" },
];

// ==========================================
// TOOLS (for sitemap)
// ==========================================
export const toolPages = [
  "car-valuation-uae",
  "is-car-overpriced",
  "loan-calculator",
  "buying-checklist",
  "depreciation-calculator",
  "ownership-cost-calculator",
  "fuel-cost-calculator",
  "insurance-estimator",
  "registration-fee-calculator",
  "car-personality-quiz",
  "what-your-car-says",
  "dream-car-matcher",
];

// ==========================================
// STATIC PAGES (for sitemap)
// ==========================================
export const staticPages = [
  { url: "/", priority: 1.0, changeFrequency: "daily" as const },
  { url: "/sell", priority: 0.9, changeFrequency: "weekly" as const },
  { url: "/listings", priority: 0.9, changeFrequency: "hourly" as const },
  { url: "/showcase", priority: 0.8, changeFrequency: "daily" as const },
  { url: "/black", priority: 0.8, changeFrequency: "weekly" as const },
  { url: "/partner", priority: 0.8, changeFrequency: "monthly" as const },
  { url: "/pricing", priority: 0.7, changeFrequency: "monthly" as const },
  { url: "/about", priority: 0.7, changeFrequency: "monthly" as const },
  { url: "/vision", priority: 0.7, changeFrequency: "monthly" as const },
  { url: "/badges", priority: 0.7, changeFrequency: "monthly" as const },
  { url: "/how-ranking-works", priority: 0.7, changeFrequency: "monthly" as const },
  { url: "/alternatives", priority: 0.8, changeFrequency: "weekly" as const },
  { url: "/faq", priority: 0.6, changeFrequency: "monthly" as const },
  { url: "/contact", priority: 0.5, changeFrequency: "monthly" as const },
  // Legal pages
  { url: "/terms-of-service", priority: 0.4, changeFrequency: "yearly" as const },
  { url: "/privacy-policy", priority: 0.4, changeFrequency: "yearly" as const },
  { url: "/refund-policy", priority: 0.4, changeFrequency: "yearly" as const },
  { url: "/dealer-agreement", priority: 0.3, changeFrequency: "yearly" as const },
  { url: "/acceptable-use-policy", priority: 0.3, changeFrequency: "yearly" as const },
  { url: "/intellectual-property", priority: 0.3, changeFrequency: "yearly" as const },
  { url: "/disclaimer", priority: 0.3, changeFrequency: "yearly" as const },
];

// ==========================================
// HELPER: Get all sitemap-worthy URLs from nav/footer
// ==========================================
export function getAllSitemapUrls(): string[] {
  const urls = new Set<string>();

  // From navItems
  navItems.forEach((item) => {
    // Only add paths without query params
    if (!item.href.includes("?")) {
      urls.add(item.href);
    }
    item.submenu?.forEach((section) => {
      section.items.forEach((subItem) => {
        if (!subItem.href.includes("?")) {
          urls.add(subItem.href);
        }
      });
    });
  });

  // From footer sections
  footerSections.forEach((section) => {
    section.links.forEach((link) => {
      if (!link.href.includes("?") && !link.href.includes("/user-dashboard")) {
        urls.add(link.href);
      }
    });
  });

  // From footer bottom links
  footerBottomLinks.forEach((link) => {
    urls.add(link.href);
  });

  return Array.from(urls);
}
