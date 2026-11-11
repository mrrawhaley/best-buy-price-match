export interface BestBuyProduct {
  sku: string;
  upc: string | null;
  name: string;
  modelNumber: string | null;
  manufacturer: string | null;
  salePrice: number | null;
  regularPrice: number | null;
  url: string | null;
  image: string | null;
}

export interface VendorResult {
  vendorId: string;
  vendor: string;
  status: "found" | "not_found" | "error";
  name?: string;
  price?: number;
  sku?: string;
  url?: string;
  matchedBy?: "upc" | "model";
  lowerThanBestBuy?: boolean;
  savings?: number;
  error?: string;
}

export interface LookupResponse {
  product: BestBuyProduct;
  results: VendorResult[];
}
