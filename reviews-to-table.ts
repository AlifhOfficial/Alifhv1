// Convert reviews JSON to markdown table

const inputFile = process.argv[2] || "trustpilot-dubai-dubizzle-com-all-reviews-simplified.json";

interface Review {
  title: string;
  content: string;
}

const data: Review[] = await Bun.file(inputFile).json();

// Generate markdown table
let markdown = `# Dubizzle Trustpilot Reviews (${data.length} total)\n\n`;
markdown += `| # | Title | Content |\n`;
markdown += `|---|-------|--------|\n`;

data.forEach((review, index) => {
  // Escape pipe characters and truncate content for readability
  const title = review.title.replace(/\|/g, "\\|").replace(/\n/g, " ");
  const content = review.content.replace(/\|/g, "\\|").replace(/\n/g, " ");
  markdown += `| ${index + 1} | ${title} | ${content} |\n`;
});

const outputFile = inputFile.replace(".json", "-table.md");
await Bun.write(outputFile, markdown);

console.log(`✅ Created table with ${data.length} reviews`);
console.log(`📁 Saved to: ${outputFile}`);
