import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Divider,
  Alert,
  Paper,
  Container,
  Stack,
  ThemeProvider,
} from "@mui/material";
import { Fingerprint, LogOut, Check } from "lucide-react";
import { anonymousClient } from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client";
import { createAuthClient } from "better-auth/react";
import { theme, colors } from "../styles";

const authClient = createAuthClient({
  baseURL: `${window.location.origin}/api/auth`,
  plugins: [anonymousClient(), passkeyClient()],
});

type Step = "name" | "creating" | "done";

export function Login() {
  const { data: session, isPending } = authClient.useSession();
  const [name, setName] = useState("");
  const [step, setStep] = useState<Step>("name");
  const [error, setError] = useState<string | null>(null);

  const handleCreateAccount = async () => {
    if (!name.trim()) return;

    setError(null);
    setStep("creating");

    try {
      const result = await authClient.signIn.anonymous();

      if (result.error) {
        setError(result.error.message || "Failed to create account");
        setStep("name");
        return;
      }

      await authClient.updateUser({ name: name.trim() });

      const passkeyResult = await authClient.passkey.addPasskey({
        name: `${name.trim()}'s passkey`,
      });

      if (passkeyResult.error) {
        console.warn("Passkey not added:", passkeyResult.error.message);
      }

      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("name");
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    setStep("name");
    setName("");
  };

  const handleSignInWithPasskey = async () => {
    setError(null);
    setStep("creating");

    try {
      const result = await authClient.signIn.passkey();

      if (result.error) {
        setError(result.error.message || "Failed to sign in");
        setStep("name");
        return;
      }

      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
      setStep("name");
    }
  };

  if (isPending) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.default",
          }}
        >
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  if (session?.user) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.default",
          }}
        >
          <Container maxWidth="xs">
            <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  bgcolor: `${colors.success}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 3,
                }}
              >
                <Check size={32} color={colors.success} />
              </Box>
              <Typography variant="h5" gutterBottom>
                Welcome back!
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 4 }}>
                Signed in as{" "}
                <strong>{session.user.name || session.user.email}</strong>
              </Typography>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<LogOut size={18} />}
                onClick={handleSignOut}
                fullWidth
                size="large"
              >
                Sign out
              </Button>
            </Paper>
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
        }}
      >
        <Container maxWidth="xs">
          <Paper elevation={3} sx={{ p: 4 }}>
            {step === "creating" && (
              <>
                <Typography variant="h5" gutterBottom>
                  Unlock Passkey...
                </Typography>
              </>
            )}

            {step === "done" && (
              <>
                <Typography variant="h5" gutterBottom>
                  You're all set!
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  Your account is ready
                </Typography>
              </>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {step === "name" && (
              <Stack spacing={2}>
                <TextField
                  label="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateAccount()}
                  fullWidth
                  autoFocus
                />
                <Button
                  variant="contained"
                  onClick={handleCreateAccount}
                  disabled={!name.trim()}
                  fullWidth
                  size="large"
                >
                  Sign up
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<Fingerprint size={20} />}
                  onClick={handleSignInWithPasskey}
                  fullWidth
                  size="large"
                >
                  Sign in with passkey
                </Button>
              </Stack>
            )}

            {step === "creating" && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {step === "done" && (
              <Stack spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    bgcolor: `${colors.success}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Check size={36} color={colors.success} />
                </Box>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<LogOut size={18} />}
                  onClick={handleSignOut}
                  fullWidth
                  size="large"
                >
                  Sign out
                </Button>
              </Stack>
            )}
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
