import { useState } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    CircularProgress,
    Divider,
    Alert,
    Container,
    Paper,
} from "@mui/material";
import { Fingerprint, LogOut, Check } from "lucide-react";
import { anonymousClient } from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client";
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
    baseURL: `${window.location.origin}/api/auth`,
    plugins: [
        anonymousClient(),
        passkeyClient(),
    ],
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
            <Container maxWidth="xs" sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
                <CircularProgress />
            </Container>
        );
    }

    if (session?.user) {
        return (
            <Container maxWidth="xs" sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
                <Paper elevation={3} sx={{ p: 4, textAlign: "center", width: "100%" }}>
                    <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
                        <Check size={48} color="#4caf50" />
                    </Box>
                    <Typography variant="h5" gutterBottom>
                        Welcome back!
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                        Signed in as <strong>{session.user.name || session.user.email}</strong>
                    </Typography>
                    <Button variant="outlined" startIcon={<LogOut size={18} />} onClick={handleSignOut} fullWidth>
                        Sign out
                    </Button>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="xs" sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
            <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
                <Typography variant="h5" gutterBottom>
                    {step === "creating" && "Setting things up..."}
                    {step === "done" && "You're all set!"}
                </Typography>

                {step !== "name" && (
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                        {step === "creating" && "Just a moment"}
                        {step === "done" && "Your account is ready"}
                    </Typography>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {step === "name" && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
                        >
                            Sign up
                        </Button>
                        <Divider>or</Divider>
                        <Button
                            variant="outlined"
                            startIcon={<Fingerprint size={18} />}
                            onClick={handleSignInWithPasskey}
                            fullWidth
                        >
                            Sign in with passkey
                        </Button>
                    </Box>
                )}

                {step === "creating" && (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                        <CircularProgress />
                    </Box>
                )}

                {step === "done" && (
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                        <Check size={48} color="#4caf50" />
                        <Button variant="outlined" startIcon={<LogOut size={18} />} onClick={handleSignOut} fullWidth>
                            Sign out
                        </Button>
                    </Box>
                )}
            </Paper>
        </Container>
    );
}
