/**
 * Test sitemap URLs for 404 errors
 */

const BASE_URL = 'http://localhost:3000';

async function testSitemap() {
  console.log('🔍 Fetching sitemap...\n');
  
  try {
    // Fetch sitemap
    const response = await fetch(`${BASE_URL}/sitemap.xml`);
    const xml = await response.text();
    
    // Extract URLs from XML
    const urlMatches = xml.matchAll(/<loc>(.*?)<\/loc>/g);
    const urls = Array.from(urlMatches).map(match => 
      match[1].replace('https://revvup.ae', BASE_URL)
    );
    
    console.log(`📊 Found ${urls.length} URLs in sitemap\n`);
    
    // Test ALL URLs
    const testUrls = urls;
    
    console.log(`🧪 Testing all ${testUrls.length} URLs...\n`);
    
    const results = {
      success: [] as string[],
      notFound: [] as string[],
      error: [] as string[],
    };
    
    for (const url of testUrls) {
      try {
        const res = await fetch(url, { redirect: 'manual' });
        
        if (res.status === 404) {
          results.notFound.push(url);
          console.log(`❌ 404: ${url}`);
        } else if (res.status >= 200 && res.status < 400) {
          const location = res.headers.get('location');
          if (location) {
            results.success.push(url);
            console.log(`✅ ${res.status}: ${url} → ${location}`);
          } else {
            results.success.push(url);
            console.log(`✅ ${res.status}: ${url}`);
          }
        } else {
          results.error.push(url);
          console.log(`⚠️  ${res.status}: ${url}`);
        }
      } catch (err) {
        results.error.push(url);
        console.log(`❌ ERROR: ${url} - ${err}`);
      }
      
      // Progress indicator every 50 URLs
      if ((results.success.length + results.notFound.length + results.error.length) % 50 === 0) {
        console.log(`\n📊 Progress: ${results.success.length + results.notFound.length + results.error.length}/${testUrls.length} tested...\n`);
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📈 SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Success: ${results.success.length}`);
    console.log(`❌ Not Found (404): ${results.notFound.length}`);
    console.log(`⚠️  Errors: ${results.error.length}`);
    console.log(`📊 Total Tested: ${testUrls.length}`);
    console.log(`📑 Total in Sitemap: ${urls.length}`);
    
    if (results.notFound.length > 0) {
      console.log('\n❌ URLs returning 404:');
      results.notFound.forEach(u => console.log(`  - ${u}`));
    }
    
    if (results.error.length > 0) {
      console.log('\n⚠️  URLs with errors:');
      results.error.forEach(u => console.log(`  - ${u}`));
    }
    
  } catch (err) {
    console.error('❌ Failed to test sitemap:', err);
    console.log('\nMake sure dev server is running: bun run dev');
  }
}

testSitemap();
