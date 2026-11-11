import type { BestBuyProduct } from "./types";

const SHOW = "sku,upc,name,modelNumber,manufacturer,salePrice,regularPrice,url,image";

/** 12–14 digits => UPC/GTIN; otherwise treat as a Best Buy SKU. */
export function detectIdType(input: string): "upc" | "sku" {
  return /^\d{12,14}$/.test(input) ? "upc" : "sku";
}

export async function fetchBestBuyProduct(input: string): Promise<BestBuyProduct | null> {
  const key = process.env.BESTBUY_API_KEY;
  if (!key) throw new Error("BESTBUY_API_KEY is not configured");
  const clean = input.replace(/[\s-]/g, "");
  if (!/^\d{5,14}$/.test(clean)) throw new Error("Enter a numeric SKU or UPC");

  const field = detectIdType(clean);
  const url = `https://api.bestbuy.com/v1/products(${field}=${clean})?apiKey=${key}&format=json&show=${SHOW}&pageSize=1`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Best Buy API error (${res.status})`);
  const data = await res.json();
  const p = data.products?.[0];
  if (!p) return null;
  return {
    sku: String(p.sku),
    upc: p.upc ?? null,
    name: p.name,
    modelNumber: p.modelNumber ?? null,
    manufacturer: p.manufacturer ?? null,
    salePrice: p.salePrice ?? null,
    regularPrice: p.regularPrice ?? null,
    url: p.url ?? null,
    image: p.image ?? null,
  };
}
