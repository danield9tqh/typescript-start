import { App } from "backend/server";
import { hc } from "hono/client";
import { useState } from "react";
import { CornerDownLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { colors, fontFamily, fontFamilyMono } from "../styles";

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
        backgroundColor: colors.background,
        position: "relative",
        fontFamily,
      }}
    >
      <Link
        to="/login"
        style={{
          position: "absolute",
          top: 24,
          right: 24,
          color: colors.textPrimary,
          textDecoration: "none",
          fontSize: 16,
          fontWeight: 500,
          fontFamily,
        }}
      >
        Login
      </Link>
      <div
        style={{
          marginTop: "40vh",
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          fontSize: 48,
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
            fontSize: 48,
            fontWeight: "bold",
            color: colors.textPrimary,
            caretColor: "black",
            border: "none",
            outline: "none",
            background: "transparent",
            width: 200,
            textAlign: "left",
            padding: 0,
            margin: 0,
            fontFamily,
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
              padding: 0,
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
            marginTop: 40,
            paddingLeft: 24,
            paddingRight: 24,
            paddingTop: 16,
            paddingBottom: 16,
            backgroundColor: colors.darkSurface,
            borderRadius: 8,
            boxShadow: "0 4px 13px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontFamily: fontFamilyMono,
          }}
        >
          <span style={{ color: colors.textMuted, fontSize: 15 }}>
            POST /api/hello
          </span>
          <span style={{ color: colors.darkText, fontSize: 15 }}>
            {response}
          </span>
        </div>
      )}
    </div>
  );
}
