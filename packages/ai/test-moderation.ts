/**
 * AI Moderation Test Script
 * Tests the moderation service with various scenarios
 */

import { moderateListing, type ModerationInput } from './src/moderation';

// Test cases
const testCases: Array<{ name: string; input: ModerationInput }> = [
  {
    name: "1. VAGUE/MINIMAL DATA (should flag for low confidence)",
    input: {
      make: "Toyota",
      model: "Camry",
      year: 2015,
      price: 35000, // 35k AED (API expects whole AED, not cents)
      mileage: 150000,
      specs: "gcc",
      emirate: "dubai",
      bodyType: "sedan",
      fuelType: "petrol",
      transmission: "automatic",
      description: "Car for sale", // Very vague
      imageCount: 1,
      hasVideo: false,
    }
  },
  {
    name: "2. SUSPICIOUSLY LOW PRICE (should flag or reject)",
    input: {
      make: "Mercedes-Benz",
      model: "S-Class",
      year: 2022,
      price: 20000, // 20k AED for 2022 S-Class - too cheap
      mileage: 15000,
      specs: "gcc",
      emirate: "dubai",
      bodyType: "sedan",
      fuelType: "petrol",
      transmission: "automatic",
      description: "Urgent sale! Must sell today! Contact me on WhatsApp 05xxxxxxxx",
      imageCount: 2,
      hasVideo: false,
    }
  },
  {
    name: "3. CONTACT INFO IN DESCRIPTION (should reject)",
    input: {
      make: "Nissan",
      model: "Patrol",
      year: 2020,
      price: 150000, // 150k AED
      mileage: 60000,
      specs: "gcc",
      emirate: "abu_dhabi",
      bodyType: "suv",
      fuelType: "petrol",
      transmission: "automatic",
      description: "Excellent condition. Call me at 050-123-4567 or email test@example.com",
      imageCount: 5,
      hasVideo: true,
    }
  },
  {
    name: "4. FAKE/IMPOSSIBLE DATA (should reject)",
    input: {
      make: "Ferrari",
      model: "LaFerrari",
      year: 2030, // Future year
      price: 500, // 500 AED for Ferrari - obviously fake
      mileage: 10,
      specs: "gcc",
      emirate: "dubai",
      bodyType: "coupe",
      fuelType: "petrol",
      transmission: "automatic",
      description: "Brand new Ferrari for cheap!",
      imageCount: 1,
      hasVideo: false,
    }
  },
  {
    name: "5. GOOD COMPLETE LISTING (should approve with high confidence)",
    input: {
      make: "Toyota",
      model: "Land Cruiser",
      year: 2021,
      trim: "GXR V6",
      price: 185000, // 185k AED
      mileage: 45000,
      specs: "gcc",
      emirate: "dubai",
      city: "Al Barsha",
      bodyType: "suv",
      fuelType: "petrol",
      transmission: "automatic",
      description: "Excellent condition Toyota Land Cruiser GXR with full service history. GCC specs with local warranty. Well maintained, single owner. Non-smoker. All service done at official dealer.",
      imageCount: 8,
      hasVideo: true,
      isNegotiable: true,
      extras: ["leather_seats", "sunroof", "parking_sensors", "rear_camera", "navigation"],
      tags: ["single_owner", "full_service_history"],
    }
  },
  {
    name: "6. MISSING IMAGES (should flag)",
    input: {
      make: "Honda",
      model: "Accord",
      year: 2019,
      price: 55000, // 55k AED
      mileage: 80000,
      specs: "american",
      emirate: "sharjah",
      bodyType: "sedan",
      fuelType: "petrol",
      transmission: "automatic",
      description: "Good condition, well maintained",
      imageCount: 0, // No images
      hasVideo: false,
    }
  },
  {
    name: "7. PROFANITY/INAPPROPRIATE CONTENT (should reject)",
    input: {
      make: "BMW",
      model: "X5",
      year: 2020,
      price: 120000,
      mileage: 55000,
      specs: "gcc",
      emirate: "dubai",
      bodyType: "suv",
      fuelType: "petrol",
      transmission: "automatic",
      description: "Fuck you! This car is shit. Don't waste my time with lowball offers you idiots!",
      imageCount: 3,
      hasVideo: false,
    }
  },
  {
    name: "8. SPAM/PROMOTIONAL CONTENT (should flag or reject)",
    input: {
      make: "Toyota",
      model: "Corolla",
      year: 2018,
      price: 45000,
      mileage: 90000,
      specs: "gcc",
      emirate: "dubai",
      bodyType: "sedan",
      fuelType: "petrol",
      transmission: "automatic",
      description: "🔥🔥🔥 BEST DEAL EVER!!! 🔥🔥🔥 CLICK HERE TO BUY NOW!!! LIMITED TIME OFFER!!! BUY 2 GET 1 FREE!!! www.scamsite.com CALL NOW 24/7 FINANCING AVAILABLE!!!",
      imageCount: 2,
      hasVideo: false,
    }
  },
];

// Run tests
async function runTests() {
  console.log('\n🤖 AI MODERATION TEST SUITE\n');
  console.log('='.repeat(80));
  
  for (const testCase of testCases) {
    console.log(`\n${testCase.name}`);
    console.log('-'.repeat(80));
    
    try {
      const result = await moderateListing(testCase.input);
      
      // Display result
      console.log(`✓ Decision: ${result.decision.toUpperCase()}`);
      console.log(`✓ Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      console.log(`✓ Processing time: ${result.processingTimeMs}ms`);
      
      if (result.flags.length > 0) {
        console.log(`✓ Flags:`);
        result.flags.forEach(flag => {
          const icon = flag.severity === 'high' ? '🚨' : flag.severity === 'medium' ? '⚠️' : 'ℹ️';
          console.log(`  ${icon} [${flag.severity.toUpperCase()}] ${flag.code}: ${flag.message}`);
        });
      }
      
      console.log(`✓ Reasoning: ${result.reasoning}`);
      
      // Auto-approve/reject analysis
      if (result.decision === 'approve' && result.confidence >= 0.85 && !result.flags.some(f => f.severity === 'high')) {
        console.log(`\n🟢 WOULD AUTO-APPROVE (confidence >= 85%, no high-severity flags)`);
      } else if (result.decision === 'reject' && result.confidence >= 0.9) {
        console.log(`\n🔴 WOULD AUTO-REJECT (reject + confidence >= 90%)`);
      } else {
        console.log(`\n🟡 WOULD FLAG FOR MANUAL REVIEW`);
      }
      
    } catch (error) {
      console.error(`✗ ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('✓ All tests completed\n');
}

// Run
runTests().catch(console.error);
