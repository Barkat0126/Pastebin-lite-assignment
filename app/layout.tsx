import "./globals.css"

export const metadata = { title: "Pastebin‑Lite" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="header" aria-label="Site header">
            <div style={{ flex: 1 }}>
              <div className="brand">Pastebin‑Lite</div>
              <div className="brand-accent" />
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}