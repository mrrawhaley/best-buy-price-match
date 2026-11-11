/**
 * Approved price-match vendors. Edit this file to add/remove/change vendors.
 * Verify against Best Buy's current price match policy — it changes.
 *
 * searchUrl: URL template; `{q}` is replaced with the URL-encoded search term
 *            (the UPC when available, otherwise the model number).
 * enabled:   set false to skip a vendor without deleting it.
 */
export interface Vendor {
  id: string;
  name: string;
  searchUrl: string;
  enabled: boolean;
}

export const VENDORS: Vendor[] = [
  { id: "amazon", name: "Amazon", searchUrl: "https://www.amazon.com/s?k={q}", enabled: true },
  { id: "walmart", name: "Walmart", searchUrl: "https://www.walmart.com/search?q={q}", enabled: true },
  { id: "target", name: "Target", searchUrl: "https://www.target.com/s?searchTerm={q}", enabled: true },
  { id: "staples", name: "Staples", searchUrl: "https://www.staples.com/{q}/directory_{q}", enabled: true },
  { id: "newegg", name: "Newegg", searchUrl: "https://www.newegg.com/p/pl?d={q}", enabled: true },
  { id: "bh", name: "B&H Photo", searchUrl: "https://www.bhphotovideo.com/c/search?q={q}", enabled: true },
  { id: "costco", name: "Costco", searchUrl: "https://www.costco.com/CatalogSearch?keyword={q}", enabled: true },
  { id: "apple", name: "Apple", searchUrl: "https://www.apple.com/us/search/{q}", enabled: false },
];
