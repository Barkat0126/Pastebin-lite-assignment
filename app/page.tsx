"use client";

import { useState } from "react";

export default function HomePage() {
  const [content, setContent] = useState("");
  const [ttlMinutes, setTtlMinutes] = useState("60");
  const [nowMsOverride, setNowMsOverride] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/pastes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, ttlMinutes: Number(ttlMinutes) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create paste");
      const url = data.url as string;
      setMessage(`Paste created! \n\n${url}`);
      setContent("");
    } catch (err: any) {
      setMessage(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="card">
      <div className="card-header">
        <h1 className="card-title">Create a Paste</h1>
        <div className="card-subtitle">Save text quickly with a shareable link.</div>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <label>
          Paste Content
          <textarea
            className="textarea"
            placeholder="Type or paste your text here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </label>

        <div className="row">
          <label>
            TTL (minutes)
            <input
              className="input"
              type="number"
              min={1}
              max={10080}
              value={ttlMinutes}
              onChange={(e) => setTtlMinutes(e.target.value)}
            />
          </label>
          <label>
            Optional nowMs (for testing)
            <input
              className="input"
              type="number"
              value={nowMsOverride}
              onChange={(e) => setNowMsOverride(e.target.value)}
              placeholder="Leave empty for real time"
            />
          </label>
        </div>

        <button className="button" type="submit" disabled={loading || !content.trim()}>
          {loading ? "Saving..." : "Create Paste"}
        </button>

        {message && (
          <div className="message">
            {message.split("\n").map((line, i) => {
              const t = line.trim();
              if (!t) return null;
              const isUrl = /^https?:\/\//.test(t);
              return (
                <div key={i}>
                  {isUrl ? <a className="link" href={t} rel="noopener noreferrer">{t}</a> : t}
                </div>
              );
            })}
          </div>
        )}
      </form>
    </main>
  );
}