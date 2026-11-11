import * as cheerio from "cheerio";
import { VENDORS, type Vendor } from "@/config/vendors";
import type { BestBuyProduct, VendorResult } from "./types";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

interface Candidate {
  name?: string;
  price?: number;
  sku?: string;
  url?: string;
  gtins: string[];
  mpn?: string;
}

const digits = (s: unknown) => String(s ?? "").replace(/\D/g, "").replace(/^0+/, "");
const norm = (s: unknown) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

/** Walk JSON-LD and collect every schema.org Product. */
function collectProducts(node: any, out: any[]) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) return node.forEach((n) => collectProducts(n, out));
  const type = ([] as string[]).concat(node["@type"] ?? []);
  if (type.includes("Product")) out.push(node);
  for (const v of Object.values(node)) collectProducts(v, out);
}

function toCandidate(p: any, base: string): Candidate {
  const offers = ([] as any[]).concat(p.offers ?? []).flatMap((o) => ([] as any[]).concat(o.offers ?? o));
  const prices = offers
    .map((o) => parseFloat(o.price ?? o.lowPrice))
    .filter((n) => Number.isFinite(n));
  let url: string | undefined = p.url ?? offers[0]?.url;
  try { if (url) url = new URL(url, base).toString(); } catch {}
  return {
    name: p.name,
    price: prices.length ? Math.min(...prices) : undefined,
    sku: p.sku ? String(p.sku) : undefined,
    url,
    gtins: [p.gtin, p.gtin12, p.gtin13, p.gtin14, p.gtin8, p.upc].filter(Boolean).map(digits),
    mpn: p.mpn ? String(p.mpn) : undefined,
  };
}

function extractCandidates(html: string, base: string): Candidate[] {
  const $ = cheerio.load(html);
  const found: any[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try { collectProducts(JSON.parse($(el).text()), found); } catch {}
  });
  return found.map((p) => toCandidate(p, base));
}

async function checkVendor(v: Vendor, bb: BestBuyProduct): Promise<VendorResult> {
  const base: VendorResult = { vendorId: v.id, vendor: v.name, status: "not_found" };
  const term = bb.upc ?? bb.modelNumber;
  if (!term) return { ...base, status: "error", error: "No UPC or model number to search with" };

  try {
    const res = await fetch(v.searchUrl.replace(/\{q\}/g, encodeURIComponent(term)), {
      headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml", "accept-language": "en-US,en;q=0.9" },
      signal: AbortSignal.timeout(8000),
      redirect: "follow",
    });
    if (!res.ok) return { ...base, status: "error", error: `HTTP ${res.status} (site may block automated requests)` };
    const html = await res.text();
    const cands = extractCandidates(html, res.url);

    const upc = digits(bb.upc);
    const model = norm(bb.modelNumber);
    for (const c of cands) {
      let matchedBy: "upc" | "model" | undefined;
      if (upc && c.gtins.includes(upc)) matchedBy = "upc";
      else if (model.length >= 4 && (norm(c.mpn) === model || norm(c.sku) === model)) matchedBy = "model";
      if (!matchedBy || c.price === undefined) continue;

      const best = bb.salePrice ?? bb.regularPrice;
      const lower = best !== null && c.price < best;
      return {
        ...base,
        status: "found",
        name: c.name,
        price: c.price,
        sku: c.sku,
        url: c.url ?? res.url,
        matchedBy,
        lowerThanBestBuy: lower,
        savings: lower ? Math.round((best! - c.price) * 100) / 100 : 0,
      };
    }
    return base;
  } catch (e: any) {
    return { ...base, status: "error", error: e?.name === "TimeoutError" ? "Timed out" : e?.message ?? "Request failed" };
  }
}

export async function checkAllVendors(bb: BestBuyProduct): Promise<VendorResult[]> {
  return Promise.all(VENDORS.filter((v) => v.enabled).map((v) => checkVendor(v, bb)));
}
