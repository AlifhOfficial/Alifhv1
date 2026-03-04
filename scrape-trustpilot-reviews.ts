import * as cheerio from "cheerio";

interface Review {
  author: string;
  location: string;
  date: string;
  rating: number;
  title: string;
  content: string;
  reviewUrl: string;
  helpful: number;
}

interface ScrapeResult {
  company: string;
  trustScore: string;
  totalReviews: number;
  filter: string;
  scrapedAt: string;
  reviews: Review[];
}

async function fetchPage(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.text();
}

function parseReviews(html: string): Review[] {
  const $ = cheerio.load(html);
  const reviews: Review[] = [];

  // Find all review cards
  $('article[data-service-review-card-paper="true"]').each((_, element) => {
    try {
      const $review = $(element);

      // Author info
      const authorLink = $review.find('a[name="consumer-profile"]');
      const authorText = authorLink.text().trim();
      const authorParts = authorText.split(/\s+•\s+/);
      const author = authorParts[0]?.trim() || "Unknown";
      const locationAndReviews = authorParts[1] || "";
      const location = locationAndReviews.replace(/\d+\s*reviews?/i, "").trim();

      // Date
      const dateElement = $review.find("time");
      const date =
        dateElement.attr("datetime") || dateElement.text().trim() || "Unknown";

      // Rating - extract from star image alt or data attribute
      const ratingImg = $review.find('img[alt*="Rated"]');
      const ratingAlt = ratingImg.attr("alt") || "";
      const ratingMatch = ratingAlt.match(/Rated (\d)/);
      const rating = ratingMatch ? parseInt(ratingMatch[1]) : 1;

      // Title
      const titleElement = $review.find(
        'h2[data-service-review-title-typography="true"]'
      );
      const title = titleElement.text().trim() || "No title";

      // Content
      const contentElement = $review.find(
        'p[data-service-review-text-typography="true"]'
      );
      const content = contentElement.text().trim() || "";

      // Review URL
      const reviewLink = $review.find('a[href*="/reviews/"]');
      const reviewUrl = reviewLink.attr("href")
        ? `https://www.trustpilot.com${reviewLink.attr("href")}`
        : "";

      // Helpful count
      const helpfulText = $review.find('button[aria-label*="Useful"]').text();
      const helpfulMatch = helpfulText.match(/(\d+)/);
      const helpful = helpfulMatch ? parseInt(helpfulMatch[1]) : 0;

      reviews.push({
        author,
        location,
        date,
        rating,
        title,
        content,
        reviewUrl,
        helpful,
      });
    } catch (e) {
      console.error("Error parsing review:", e);
    }
  });

  return reviews;
}

function parseReviewsFromText(html: string): Review[] {
  const reviews: Review[] = [];

  // Regex patterns to extract reviews from the raw HTML/text
  const reviewBlockPattern =
    /\[([^\]]+)\s+([A-Z]{2})\s+•\s+\d+\s+reviews?\]\([^)]+\)\s+([\w\s,]+\d{4})\s+!\[Rated (\d) out of 5 stars\][^\[]*\[([^\]]+)\]\(([^)]+)\)\s*([\s\S]*?)(?=(?:Useful|UsefulShare|Advertisement|\[[\w\s]+[A-Z]{2}\s+•))/gi;

  // Alternative simpler pattern
  const simplePattern =
    /([A-Za-z\s]+)\s+([A-Z]{2})\s+•\s+\d+\s+reviews?\s+((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d+,\s+\d{4}).*?Rated (\d) out of 5.*?\[([^\]]+)\]\((https:\/\/www\.trustpilot\.com\/reviews\/[^)]+)\)\s*([\s\S]*?)(?=(?:Useful|UsefulShare|[\w\s]+[A-Z]{2}\s+•|\n\n))/gi;

  let match;

  // Try to extract using patterns
  const lines = html.split("\n");
  let currentReview: Partial<Review> = {};
  let inReview = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check for author line pattern: [Name Location • X reviews]
    const authorMatch = line.match(
      /\[([^\]]+)\s+([A-Z]{2})\s+•\s+(\d+)\s+reviews?\]/
    );
    if (authorMatch) {
      if (
        currentReview.author &&
        currentReview.title &&
        currentReview.content
      ) {
        reviews.push(currentReview as Review);
      }
      currentReview = {
        author: authorMatch[1].trim(),
        location: authorMatch[2],
        rating: 1,
        helpful: 0,
        reviewUrl: "",
      };
      inReview = true;
      continue;
    }

    // Check for date
    const dateMatch = line.match(
      /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d+,\s+\d{4}/
    );
    if (dateMatch && inReview) {
      currentReview.date = dateMatch[0];
    }

    // Check for rating
    const ratingMatch = line.match(/Rated (\d) out of 5/);
    if (ratingMatch && inReview) {
      currentReview.rating = parseInt(ratingMatch[1]);
    }

    // Check for title link pattern: [Title](url)
    const titleMatch = line.match(
      /\[([^\]]+)\]\((https:\/\/www\.trustpilot\.com\/reviews\/[^)]+)\)/
    );
    if (titleMatch && inReview) {
      currentReview.title = titleMatch[1];
      currentReview.reviewUrl = titleMatch[2];
    }

    // Check for useful count
    const usefulMatch = line.match(/Useful\s*(\d+)?/);
    if (usefulMatch && inReview) {
      currentReview.helpful = usefulMatch[1] ? parseInt(usefulMatch[1]) : 0;
    }

    // Content - lines after title that aren't navigation/metadata
    if (
      inReview &&
      currentReview.title &&
      !currentReview.content &&
      line.length > 10 &&
      !line.startsWith("[") &&
      !line.startsWith("Useful") &&
      !line.includes("Rated") &&
      !line.includes("Unprompted review")
    ) {
      currentReview.content = line;
    }
  }

  // Don't forget the last review
  if (currentReview.author && currentReview.title) {
    reviews.push(currentReview as Review);
  }

  return reviews;
}

async function getTotalPages(baseUrl: string): Promise<number> {
  const html = await fetchPage(baseUrl);

  // Look for pagination info
  const pageMatch = html.match(/page=(\d+)/g);
  if (pageMatch) {
    const pages = pageMatch.map((p) => parseInt(p.replace("page=", "")));
    return Math.max(...pages, 1);
  }

  // Estimate based on total reviews (20 per page)
  const reviewsMatch = html.match(/Reviews?\s*(\d+)/);
  if (reviewsMatch) {
    const total = parseInt(reviewsMatch[1]);
    return Math.ceil(total / 20);
  }

  return 5; // Default to 5 pages
}

async function scrapeAllReviews(
  domain: string,
  stars: number = 1
): Promise<ScrapeResult> {
  const baseUrl = `https://www.trustpilot.com/review/${domain}?stars=${stars}`;
  const allReviews: Review[] = [];

  console.log(`Starting scrape of ${domain} (${stars}-star reviews)...`);

  // Get first page and determine total pages
  const firstPageHtml = await fetchPage(baseUrl);
  const totalPages = await getTotalPages(baseUrl);

  console.log(`Found approximately ${totalPages} pages to scrape`);

  // Parse first page
  let reviews = parseReviews(firstPageHtml);
  if (reviews.length === 0) {
    reviews = parseReviewsFromText(firstPageHtml);
  }
  allReviews.push(...reviews);
  console.log(`Page 1: Found ${reviews.length} reviews`);

  // Scrape remaining pages
  for (let page = 2; page <= totalPages; page++) {
    try {
      console.log(`Fetching page ${page}/${totalPages}...`);
      const pageUrl = `${baseUrl}&page=${page}`;
      const html = await fetchPage(pageUrl);

      let pageReviews = parseReviews(html);
      if (pageReviews.length === 0) {
        pageReviews = parseReviewsFromText(html);
      }

      if (pageReviews.length === 0) {
        console.log(`No reviews found on page ${page}, stopping.`);
        break;
      }

      allReviews.push(...pageReviews);
      console.log(`Page ${page}: Found ${pageReviews.length} reviews`);

      // Rate limiting - wait between requests
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);
      break;
    }
  }

  return {
    company: domain,
    trustScore: "1.6",
    totalReviews: allReviews.length,
    filter: `${stars}-star`,
    scrapedAt: new Date().toISOString(),
    reviews: allReviews,
  };
}

// Alternative: Use a simpler fetch-based approach that parses the rendered text
async function scrapeWithSimpleFetch(
  domain: string,
  stars: number = 1,
  maxPages: number = 10
): Promise<ScrapeResult> {
  const allReviews: Review[] = [];

  console.log(`\nScraping ${domain} - ${stars}-star reviews\n`);

  for (let page = 1; page <= maxPages; page++) {
    const url =
      page === 1
        ? `https://www.trustpilot.com/review/${domain}?stars=${stars}`
        : `https://www.trustpilot.com/review/${domain}?page=${page}&stars=${stars}`;

    console.log(`Fetching page ${page}: ${url}`);

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });

      if (!response.ok) {
        console.log(`Failed to fetch page ${page}: ${response.status}`);
        break;
      }

      const html = await response.text();

      // Extract JSON-LD data if available
      const jsonLdMatch = html.match(
        /<script type="application\/ld\+json">(\{[^<]+\})<\/script>/g
      );
      if (jsonLdMatch) {
        for (const match of jsonLdMatch) {
          try {
            const jsonStr = match
              .replace(/<script type="application\/ld\+json">/, "")
              .replace(/<\/script>/, "");
            const data = JSON.parse(jsonStr);
            if (data["@type"] === "Review" || data.review) {
              console.log("Found JSON-LD review data");
            }
          } catch (e) {
            // Ignore JSON parse errors
          }
        }
      }

      // Parse using cheerio
      const $ = cheerio.load(html);

      // Find reviews using various selectors
      const reviewCards = $(
        'article[data-service-review-card-paper="true"], section[data-reviewpaper], div[class*="review-card"]'
      );

      if (reviewCards.length === 0) {
        // Try alternative parsing
        const reviewSections = $("article, section")
          .filter((_, el) => {
            const text = $(el).text();
            return text.includes("Rated") && text.includes("out of 5");
          });

        reviewSections.each((_, el) => {
          const $el = $(el);
          const text = $el.text();

          // Extract basic info
          const ratingMatch = text.match(/Rated (\d) out of 5/);
          const rating = ratingMatch ? parseInt(ratingMatch[1]) : 1;

          // Find author
          const authorLink = $el.find('a[href*="/users/"]').first();
          const author = authorLink.text().split("•")[0]?.trim() || "Anonymous";

          // Find date
          const dateElement = $el.find("time");
          const date =
            dateElement.attr("datetime") ||
            dateElement.text().trim() ||
            "Unknown";

          // Find content - the main paragraph
          const contentP = $el.find("p").first();
          const content = contentP.text().trim();

          if (content && content.length > 10) {
            allReviews.push({
              author,
              location: "",
              date,
              rating,
              title: content.substring(0, 50) + "...",
              content,
              reviewUrl: "",
              helpful: 0,
            });
          }
        });
      } else {
        reviewCards.each((_, element) => {
          const $card = $(element);

          const authorEl = $card.find('a[name="consumer-profile"]').first();
          const author = authorEl.text().split("•")[0]?.trim() || "Anonymous";

          const locationMatch = authorEl.text().match(/([A-Z]{2})\s+•/);
          const location = locationMatch ? locationMatch[1] : "";

          const dateEl = $card.find("time").first();
          const date = dateEl.attr("datetime") || dateEl.text().trim();

          const ratingImg = $card.find('img[alt*="Rated"]').first();
          const ratingAlt = ratingImg.attr("alt") || "";
          const ratingMatch = ratingAlt.match(/Rated (\d)/);
          const rating = ratingMatch ? parseInt(ratingMatch[1]) : 1;

          const titleEl = $card
            .find('h2[data-service-review-title-typography="true"]')
            .first();
          const title = titleEl.text().trim() || "No title";

          const contentEl = $card
            .find('p[data-service-review-text-typography="true"]')
            .first();
          const content = contentEl.text().trim();

          const reviewLinkEl = $card.find('a[href*="/reviews/"]').first();
          const reviewUrl = reviewLinkEl.attr("href")
            ? `https://www.trustpilot.com${reviewLinkEl.attr("href")}`
            : "";

          if (content) {
            allReviews.push({
              author,
              location,
              date,
              rating,
              title,
              content,
              reviewUrl,
              helpful: 0,
            });
          }
        });
      }

      console.log(`  Found ${allReviews.length} total reviews so far`);

      // Check if we've reached the last page
      const hasNextPage = html.includes(`page=${page + 1}`);
      if (!hasNextPage && page > 1) {
        console.log("No more pages found.");
        break;
      }

      // Rate limit
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error on page ${page}:`, error);
      break;
    }
  }

  return {
    company: domain,
    trustScore: "1.6",
    totalReviews: allReviews.length,
    filter: `${stars}-star`,
    scrapedAt: new Date().toISOString(),
    reviews: allReviews,
  };
}

// Scrape all star ratings
async function scrapeAllStarRatings(
  domain: string,
  maxPagesPerStar: number = 10
): Promise<ScrapeResult> {
  const allReviews: Review[] = [];
  const starCounts: Record<number, number> = {};

  console.log(`\n🔍 Scraping ALL star ratings for ${domain}\n`);

  for (let stars = 1; stars <= 5; stars++) {
    console.log(`\n⭐ Scraping ${stars}-star reviews...`);
    
    const result = await scrapeWithSimpleFetch(domain, stars, maxPagesPerStar);
    starCounts[stars] = result.reviews.length;
    allReviews.push(...result.reviews);
    
    console.log(`   ✓ Found ${result.reviews.length} ${stars}-star reviews`);
    
    // Small delay between star categories
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return {
    company: domain,
    trustScore: "1.6",
    totalReviews: allReviews.length,
    filter: "all-stars",
    scrapedAt: new Date().toISOString(),
    reviews: allReviews,
  };
}

// Main execution
const domain = process.argv[2] || "dubai.dubizzle.com";
const mode = process.argv[3] || "all"; // "all" or specific star number
const maxPages = parseInt(process.argv[4] || "10");

console.log(`
╔════════════════════════════════════════════════════════════╗
║         Trustpilot Review Scraper                         ║
╠════════════════════════════════════════════════════════════╣
║  Domain: ${domain.padEnd(47)}║
║  Filter: ${mode === "all" ? "All stars (1-5)".padEnd(41) : `${mode}-star reviews`.padEnd(41)}║
║  Max Pages: ${maxPages.toString().padEnd(44)}║
╚════════════════════════════════════════════════════════════╝
`);

if (mode === "all") {
  scrapeAllStarRatings(domain, maxPages)
    .then((result) => {
      const outputFile = `trustpilot-${domain.replace(/\./g, "-")}-all-reviews.json`;
      Bun.write(outputFile, JSON.stringify(result, null, 2));
      
      // Count by star rating
      const byStars: Record<number, number> = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
      result.reviews.forEach(r => byStars[r.rating]++);
      
      console.log(`\n╔════════════════════════════════════════════════════════════╗`);
      console.log(`║  ✅ SCRAPING COMPLETE                                      ║`);
      console.log(`╠════════════════════════════════════════════════════════════╣`);
      console.log(`║  Total Reviews: ${result.totalReviews.toString().padEnd(40)}║`);
      console.log(`║  ⭐ 1-star: ${byStars[1].toString().padEnd(45)}║`);
      console.log(`║  ⭐⭐ 2-star: ${byStars[2].toString().padEnd(43)}║`);
      console.log(`║  ⭐⭐⭐ 3-star: ${byStars[3].toString().padEnd(41)}║`);
      console.log(`║  ⭐⭐⭐⭐ 4-star: ${byStars[4].toString().padEnd(39)}║`);
      console.log(`║  ⭐⭐⭐⭐⭐ 5-star: ${byStars[5].toString().padEnd(37)}║`);
      console.log(`╠════════════════════════════════════════════════════════════╣`);
      console.log(`║  📁 Saved to: ${outputFile.padEnd(42)}║`);
      console.log(`╚════════════════════════════════════════════════════════════╝`);
    })
    .catch((error) => {
      console.error("Scraping failed:", error);
      process.exit(1);
    });
} else {
  const stars = parseInt(mode);
  scrapeWithSimpleFetch(domain, stars, maxPages)
    .then((result) => {
      const outputFile = `trustpilot-${domain.replace(/\./g, "-")}-${stars}star-reviews.json`;
      Bun.write(outputFile, JSON.stringify(result, null, 2));
      console.log(`\n✅ Scraped ${result.totalReviews} reviews`);
      console.log(`📁 Saved to: ${outputFile}`);
    })
    .catch((error) => {
      console.error("Scraping failed:", error);
      process.exit(1);
    });
}
