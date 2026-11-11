"use client";
import { useState } from "react";
import type { LookupResponse } from "@/lib/types";

const money = (n?: number | null) => (n == null ? "—" : `$${n.toFixed(2)}`);
const card: React.CSSProperties = { background: "#fff", borderRadius: 8, padding: 16, marginTop: 16, boxShadow: "0 1px 3px #0002" };

export default function Home() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<LookupResponse | null>(null);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(""); setData(null);
    try {
      const res = await fetch(`/api/lookup?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const p = data?.product;
  const found = data?.results.filter((r) => r.status === "found") ?? [];
  const others = data?.results.filter((r) => r.status !== "found") ?? [];

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <h1>Best Buy Price Match Finder</h1>
      <form onSubmit={search} style={{ display: "flex", gap: 8 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Best Buy SKU or UPC"
          inputMode="numeric"
          style={{ flex: 1, padding: 10, fontSize: 16 }}
        />
        <button disabled={loading || !q.trim()} style={{ padding: "10px 20px", fontSize: 16 }}>
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {error && <div style={{ ...card, color: "#b00020" }}>{error}</div>}

      {p && (
        <div style={{ ...card, display: "flex", gap: 16 }}>
          {p.image && <img src={p.image} alt="" width={120} height={120} style={{ objectFit: "contain" }} />}
          <div>
            <h2 style={{ margin: 0 }}>{p.name}</h2>
            <p style={{ margin: "8px 0" }}>
              SKU {p.sku} · UPC {p.upc ?? "n/a"} · Model {p.modelNumber ?? "n/a"} · {p.manufacturer ?? ""}
            </p>
            <p style={{ margin: "8px 0", fontSize: 20 }}>
              <b>{money(p.salePrice)}</b>
              {p.regularPrice !== p.salePrice && <s style={{ marginLeft: 8, color: "#777" }}>{money(p.regularPrice)}</s>}
            </p>
            {p.url && <a href={p.url} target="_blank" rel="noreferrer">View at Best Buy</a>}
          </div>
        </div>
      )}

      {data && (
        <div style={card}>
          <h3 style={{ marginTop: 0 }}>Approved vendors with this item</h3>
          {found.length === 0 && <p>No approved vendor listing found.</p>}
          {found.map((r) => (
            <div key={r.vendorId} style={{ padding: "8px 0", borderTop: "1px solid #eee", background: r.lowerThanBestBuy ? "#e8f7ec" : undefined }}>
              <b>{r.vendor}</b> — {money(r.price)}
              {r.lowerThanBestBuy ? <b style={{ color: "#0a7a2f" }}> · ${r.savings?.toFixed(2)} lower — price match eligible</b> : <span style={{ color: "#777" }}> · not lower</span>}
              <div style={{ fontSize: 13, color: "#555" }}>
                {r.name} · SKU {r.sku ?? "n/a"} · matched by {r.matchedBy} ·{" "}
                <a href={r.url} target="_blank" rel="noreferrer">Open listing</a>
              </div>
            </div>
          ))}
          {others.length > 0 && (
            <details style={{ marginTop: 12 }}>
              <summary>Not found / unavailable ({others.length})</summary>
              <ul>
                {others.map((r) => (
                  <li key={r.vendorId}>{r.vendor}: {r.status === "error" ? r.error : "not found"}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </main>
  );
}
