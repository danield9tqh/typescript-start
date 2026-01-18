import { App } from "backend/server";
import { hc } from "hono/client";
import { useState } from "react";
import { CornerDownLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { colors, shadows } from "../styles";

const client = hc<App>("/api");

export function Home() {
  const [name, setName] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || loading) {
      setResponse(null);
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const res = await client.hello.$post({
        json: { name },
      });

      if (!res.ok) {
        setResponse("Error: " + res.statusText);
      } else {
        const data = await res.json();
        setResponse(data.message);
      }
    } catch (error) {
      setResponse(
        "Error: " + (error instanceof Error ? error.message : "Unknown error"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        background: colors.background,
        position: "relative",
      }}
    >
      <Link
        to="/login"
        style={{
          position: "absolute",
          top: "24px",
          right: "24px",
          color: colors.textPrimary,
          textDecoration: "none",
          fontSize: "16px",
          fontWeight: 500,
        }}
      >
        Login
      </Link>
      <div
        style={{
          marginTop: "40vh",
          display: "flex",
          alignItems: "baseline",
          gap: "10px",
          fontSize: "48px",
          fontWeight: "bold",
          color: colors.primary,
        }}
      >
        <span>Hello,</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          autoFocus
          style={{
            fontSize: "48px",
            fontWeight: "bold",
            color: colors.textPrimary,
            caretColor: "black",
            caretShape: "block",
            border: "none",
            outline: "none",
            background: "transparent",
            width: "200px",
            textAlign: "left",
            padding: "0",
            margin: "0",
          }}
        />
        {name.trim() && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background: "none",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              padding: "0",
              display: "flex",
              alignItems: "center",
              opacity: loading ? 0.5 : 1,
            }}
          >
            <CornerDownLeft size={32} color={colors.textPrimary} />
          </button>
        )}
      </div>
      {response && (
        <div
          style={{
            marginTop: "40px",
            padding: "18px 26px",
            background: colors.darkSurface,
            borderRadius: "9px",
            boxShadow: shadows.card,
            display: "flex",
            alignItems: "center",
            gap: "18px",
            fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
          }}
        >
          <span
            style={{
              color: colors.textMuted,
              fontSize: "15px",
            }}
          >
            POST /api/hello
          </span>
          <span
            style={{
              color: colors.darkText,
              fontSize: "15px",
            }}
          >
            {response}
          </span>
        </div>
      )}
    </div>
  );
}
