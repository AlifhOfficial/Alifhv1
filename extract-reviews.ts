// Extract only title and content from scraped reviews

const inputFile = process.argv[2] || "trustpilot-dubai-dubizzle-com-all-reviews.json";
const outputFile = process.argv[3] || inputFile.replace(".json", "-simplified.json");

interface Review {
  title: string;
  content: string;
}

const data = await Bun.file(inputFile).json();

const simplified: Review[] = data.reviews.map((r: any) => ({
  title: r.title,
  content: r.content,
}));

await Bun.write(outputFile, JSON.stringify(simplified, null, 2));

console.log(`✅ Extracted ${simplified.length} reviews (title + content only)`);
console.log(`📁 Saved to: ${outputFile}`);
