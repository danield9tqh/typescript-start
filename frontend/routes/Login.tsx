import { useState, type CSSProperties } from "react";
import { Input } from "@base-ui-components/react/input";
import { Button } from "@base-ui-components/react/button";
import { Fingerprint, LogOut, Check } from "lucide-react";
import { anonymousClient } from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client";
import { createAuthClient } from "better-auth/react";
import { colors, fontFamily, pageContainer, card } from "../styles";

const authClient = createAuthClient({
  baseURL: `${window.location.origin}/api/auth`,
  plugins: [anonymousClient(), passkeyClient()],
});

type Step = "name" | "creating" | "done";

// Component-specific styles
const inputStyle: CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  fontSize: 16,
  fontFamily,
  border: `2px solid #ddd`,
  borderRadius: 8,
  outline: "none",
  boxSizing: "border-box",
};

const buttonBase: CSSProperties = {
  width: "100%",
  padding: "12px 20px",
  fontSize: 16,
  fontWeight: 500,
  fontFamily,
  borderRadius: 8,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  border: "none",
  transition: "opacity 0.15s",
};

const primaryButton: CSSProperties = {
  ...buttonBase,
  backgroundColor: colors.primary,
  color: "#ffffff",
};

const secondaryButton: CSSProperties = {
  ...buttonBase,
  backgroundColor: "transparent",
  color: colors.textPrimary,
  border: `2px solid ${colors.textPrimary}`,
};

const successCircle: CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: "50%",
  backgroundColor: `${colors.success}20`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const spinner: CSSProperties = {
  width: 40,
  height: 40,
  border: `3px solid ${colors.background}`,
  borderTopColor: colors.primary,
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};

const alertError: CSSProperties = {
  padding: "12px 16px",
  backgroundColor: `${colors.error}15`,
  color: colors.error,
  borderRadius: 8,
  fontSize: 14,
  marginBottom: 16,
};

export function Login() {
  const { data: session, isPending } = authClient.useSession();
  const [name, setName] = useState("");
  const [step, setStep] = useState<Step>("name");
  const [error, setError] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);

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
      <div style={pageContainer}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={spinner} />
      </div>
    );
  }

  if (session?.user) {
    return (
      <div style={pageContainer}>
        <div style={{ ...card, textAlign: "center" }}>
          <div
            style={{
              ...successCircle,
              margin: "0 auto 24px",
            }}
          >
            <Check size={32} color={colors.success} />
          </div>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 600,
              marginBottom: 8,
              color: colors.textPrimary,
            }}
          >
            Welcome back!
          </h2>
          <p
            style={{
              color: colors.textSecondary,
              marginBottom: 32,
              fontSize: 16,
            }}
          >
            Signed in as{" "}
            <strong>{session.user.name || session.user.email}</strong>
          </p>
          <Button onClick={handleSignOut} style={secondaryButton}>
            <LogOut size={18} />
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={pageContainer}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={card}>
        {step === "creating" && (
          <h2
            style={{
              fontSize: 24,
              fontWeight: 600,
              marginBottom: 16,
              color: colors.textPrimary,
            }}
          >
            Unlock Passkey...
          </h2>
        )}

        {step === "done" && (
          <>
            <h2
              style={{
                fontSize: 24,
                fontWeight: 600,
                marginBottom: 8,
                color: colors.textPrimary,
              }}
            >
              You're all set!
            </h2>
            <p
              style={{
                color: colors.textSecondary,
                marginBottom: 24,
                fontSize: 16,
              }}
            >
              Your account is ready
            </p>
          </>
        )}

        {error && <div style={alertError}>{error}</div>}

        {step === "name" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateAccount()}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              autoFocus
              style={{
                ...inputStyle,
                borderColor: inputFocused ? colors.primary : "#ddd",
              }}
            />
            <Button
              onClick={handleCreateAccount}
              disabled={!name.trim()}
              style={{
                ...primaryButton,
                opacity: !name.trim() ? 0.5 : 1,
                cursor: !name.trim() ? "not-allowed" : "pointer",
              }}
            >
              Sign up
            </Button>
            <Button onClick={handleSignInWithPasskey} style={secondaryButton}>
              <Fingerprint size={20} />
              Sign in with passkey
            </Button>
          </div>
        )}

        {step === "creating" && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "32px 0",
            }}
          >
            <div style={spinner} />
          </div>
        )}

        {step === "done" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div style={{ ...successCircle, width: 72, height: 72 }}>
              <Check size={36} color={colors.success} />
            </div>
            <Button onClick={handleSignOut} style={secondaryButton}>
              <LogOut size={18} />
              Sign out
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
