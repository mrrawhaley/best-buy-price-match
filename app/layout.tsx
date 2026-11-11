export const metadata = { title: "Best Buy Price Match Finder" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, background: "#f5f6f8", color: "#111" }}>
        {children}
      </body>
    </html>
  );
}
