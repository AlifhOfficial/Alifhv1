#!/bin/bash
# SEO Testing Script - Quick validation of all SEO pages
# Run from apps/web directory

echo "🧪 Testing SEO Implementation..."
echo ""

# Use environment variable or default to localhost
BASE_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"

echo "📄 Testing Money Pages..."
curl -s -o /dev/null -w "✓ /sell: %{http_code}\n" "$BASE_URL/sell"
curl -s -o /dev/null -w "✓ /listings: %{http_code}\n" "$BASE_URL/listings"
curl -s -o /dev/null -w "✓ /cars: %{http_code}\n" "$BASE_URL/cars"

echo ""
echo "📍 Testing Location Hubs..."
curl -s -o /dev/null -w "✓ /cars/dubai: %{http_code}\n" "$BASE_URL/cars/dubai"
curl -s -o /dev/null -w "✓ /cars/abu_dhabi: %{http_code}\n" "$BASE_URL/cars/abu_dhabi"
curl -s -o /dev/null -w "✓ /cars/sharjah: %{http_code}\n" "$BASE_URL/cars/sharjah"

echo ""
echo "🚗 Testing Brand Hubs..."
curl -s -o /dev/null -w "✓ /cars/toyota: %{http_code}\n" "$BASE_URL/cars/toyota"
curl -s -o /dev/null -w "✓ /cars/nissan: %{http_code}\n" "$BASE_URL/cars/nissan"
curl -s -o /dev/null -w "✓ /cars/mercedes-benz: %{http_code}\n" "$BASE_URL/cars/mercedes-benz"

echo ""
echo "🎯 Testing Model Hubs..."
curl -s -o /dev/null -w "✓ /cars/toyota/land-cruiser: %{http_code}\n" "$BASE_URL/cars/toyota/land-cruiser"
curl -s -o /dev/null -w "✓ /cars/nissan/patrol: %{http_code}\n" "$BASE_URL/cars/nissan/patrol"
curl -s -o /dev/null -w "✓ /cars/lexus/lx: %{http_code}\n" "$BASE_URL/cars/lexus/lx"

echo ""
echo "� Testing Regional Specs Pages..."
curl -s -o /dev/null -w "✓ /cars/gcc-specs: %{http_code}\n" "$BASE_URL/cars/gcc-specs"
curl -s -o /dev/null -w "✓ /cars/american-specs: %{http_code}\n" "$BASE_URL/cars/american-specs"
curl -s -o /dev/null -w "✓ /cars/european-specs: %{http_code}\n" "$BASE_URL/cars/european-specs"
curl -s -o /dev/null -w "✓ /cars/japanese-specs: %{http_code}\n" "$BASE_URL/cars/japanese-specs"

echo ""echo "⚫ Testing Black Verified Listings..."
curl -s -o /dev/null -w "✓ /cars/black-listings: %{http_code}\n" "$BASE_URL/cars/black-listings"

echo ""echo "�🏢 Testing Partner/Dealer Pages..."
curl -s -o /dev/null -w "✓ /black: %{http_code}\n" "$BASE_URL/black"
# Test showroom pages (add actual partner slugs if available)
curl -s -o /dev/null -w "✓ /showroom/[test-slug]: %{http_code}\n" "$BASE_URL/showroom/test-dealer"

echo ""
echo "✅ All pages should return 200 or 307 (redirect)"
echo ""
echo "🤖 Testing Noindex on Low-Value Filter Combinations..."
echo -n "✓ Multiple filters (make+emirate): "
curl -s "$BASE_URL/listings?make=Toyota&emirate=dubai" | grep -q 'name="robots" content="noindex' && echo "noindex ✓" || echo "FAIL"
echo -n "✓ Price ranges: "
curl -s "$BASE_URL/listings?minPrice=50000&maxPrice=100000" | grep -q 'name="robots" content="noindex' && echo "noindex ✓" || echo "FAIL"
echo -n "✓ Pagination: "
curl -s "$BASE_URL/listings?page=2" | grep -q 'name="robots" content="noindex' && echo "noindex ✓" || echo "FAIL"
echo -n "✓ Base /listings (should be indexable): "
curl -s "$BASE_URL/listings" | grep -q 'name="robots"' && echo "FAIL (has noindex)" || echo "indexable ✓"

echo ""
echo "🗺️  Testing Sitemap..."
echo -n "✓ Sitemap accessible: "
curl -s "$BASE_URL/sitemap.xml" | grep -q '<urlset' && echo "200 ✓" || echo "FAIL"
echo -n "✓ Contains Black listings: "
curl -s "$BASE_URL/sitemap.xml" | grep -q 'black-listings' && echo "found ✓" || echo "FAIL"
echo -n "✓ Contains regional specs: "
curl -s "$BASE_URL/sitemap.xml" | grep -q 'gcc-specs' && echo "found ✓" || echo "FAIL"

echo ""
echo "🔍 Check structured data:"
echo "curl -s $BASE_URL | grep 'application/ld+json' -A 20"
