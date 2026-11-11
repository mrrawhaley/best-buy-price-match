# Best Buy Price Match Finder

Enter a Best Buy SKU or UPC; the app fetches the product from Best Buy, searches approved vendors, and flags vendors whose price is lower.

## Setup
1. Get a free API key at https://developer.bestbuy.com/ and set `BESTBUY_API_KEY` (copy `.env.example` to `.env.local` for local dev; add it as an Environment Variable in Vercel).
2. `npm install && npm run dev`
3. Deploy: import the repo in Vercel (no other config needed).

## Approved vendors
Edit `config/vendors.ts`. Verify the list against Best Buy's current price match policy.

## How vendor matching works
For each vendor the server fetches its search page (by UPC, else model number) and reads schema.org JSON-LD `Product` data. A listing counts only if its GTIN/UPC (or MPN/model) matches Best Buy's item and it has a price.

**Limitations:** many retailers (Amazon, Walmart, Costco, etc.) block automated requests or render results client-side, so they may show as "unavailable". For reliable coverage, replace `checkVendor` for a vendor with an official API or a paid product-data/scraping API. Always confirm the price and item on the vendor's site before requesting a price match.
