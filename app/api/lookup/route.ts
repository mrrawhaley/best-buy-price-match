import { NextResponse } from "next/server";
import { fetchBestBuyProduct } from "@/lib/bestbuy";
import { checkAllVendors } from "@/lib/vendors";

export const maxDuration = 30;
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ error: "Missing SKU or UPC" }, { status: 400 });
  try {
    const product = await fetchBestBuyProduct(q);
    if (!product) return NextResponse.json({ error: "No Best Buy product found for that SKU/UPC" }, { status: 404 });
    const results = await checkAllVendors(product);
    return NextResponse.json({ product, results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Lookup failed" }, { status: 500 });
  }
}
