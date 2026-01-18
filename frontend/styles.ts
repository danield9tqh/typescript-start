import { createTheme } from "@mui/material/styles";

// Color palette
export const colors = {
  // Primary colors
  primary: "rgb(248, 145, 37)", // Orange accent
  primaryLight: "#ffa726",
  primaryDark: "#f57c00",

  // Neutral colors
  background: "#fdf6ed", // Warm cream background
  surface: "#ffffff",
  textPrimary: "rgb(26, 26, 26)",
  textSecondary: "#666666",
  textMuted: "#888888",

  // Status colors
  success: "#4caf50",
  error: "#f44336",

  // Dark surface (for cards/code blocks)
  darkSurface: "#1a1a1a",
  darkText: "#f8f8f8",
} as const;

// Spacing values
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Border radius
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
} as const;

// Shadow presets
export const shadows = {
  card: "0 4px 13px rgba(0,0,0,0.1)",
  elevated: "0 8px 24px rgba(0,0,0,0.12)",
} as const;

// MUI Theme
export const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary,
      light: colors.primaryLight,
      dark: colors.primaryDark,
      contrastText: "#ffffff",
    },
    secondary: {
      main: colors.textPrimary,
    },
    background: {
      default: colors.background,
      paper: colors.surface,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
    },
    success: {
      main: colors.success,
    },
    error: {
      main: colors.error,
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: borderRadius.md,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.md,
          padding: "10px 20px",
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: shadows.card,
          },
        },
        outlined: {
          borderWidth: 2,
          "&:hover": {
            borderWidth: 2,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: borderRadius.md,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.lg,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.md,
        },
      },
    },
  },
});

// Common style objects for reuse
export const commonStyles = {
  centeredContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: colors.background,
    padding: spacing.md,
  },
  card: {
    padding: spacing.lg,
    width: 400,
  },
  flexColumn: {
    display: "flex",
    flexDirection: "column" as const,
    gap: spacing.md,
  },
  flexCenter: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
} as const;
