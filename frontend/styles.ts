import type { CSSProperties } from "react";

export const colors = {
  primary: "rgb(248, 145, 37)",
  background: "#fdf6ed",
  textPrimary: "rgb(26, 26, 26)",
  textSecondary: "#666666",
  textMuted: "#888888",
  success: "#4caf50",
  error: "#f44336",
  darkSurface: "#1a1a1a",
  darkText: "#f8f8f8",
  surface: "#ffffff",
} as const;

export const fontFamily =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif';

export const fontFamilyMono =
  "'SF Mono', 'Fira Code', 'Consolas', monospace";

export const pageContainer: CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.background,
  fontFamily,
};

export const card: CSSProperties = {
  backgroundColor: colors.surface,
  borderRadius: 12,
  padding: 32,
  boxShadow: "0 4px 13px rgba(0,0,0,0.1)",
  width: "100%",
  maxWidth: 400,
};
