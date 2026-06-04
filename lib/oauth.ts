export type OAuthProvider = "google" | "apple";

export function isOAuthProvider(value: string): value is OAuthProvider {
  return value === "google" || value === "apple";
}

export function oauthConfig(provider: OAuthProvider) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  if (provider === "google") {
    return {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirectUri: process.env.GOOGLE_REDIRECT_URI || `${appUrl}/api/auth/oauth/callback/google`,
      scope: "openid email profile",
      authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token"
    };
  }

  return {
    clientId: process.env.APPLE_CLIENT_ID || "",
    clientSecret: process.env.APPLE_CLIENT_SECRET || "",
    redirectUri: process.env.APPLE_REDIRECT_URI || `${appUrl}/api/auth/oauth/callback/apple`,
    scope: "openid email name",
    authorizeUrl: "https://appleid.apple.com/auth/authorize",
    tokenUrl: "https://appleid.apple.com/auth/token"
  };
}

export function buildOAuthUrl(provider: OAuthProvider, state: string) {
  const config = oauthConfig(provider);
  if (!config.clientId) return null;
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: config.scope,
    state
  });
  if (provider === "apple") params.set("response_mode", "form_post");
  return `${config.authorizeUrl}?${params.toString()}`;
}

export async function exchangeCode(provider: OAuthProvider, code: string) {
  const config = oauthConfig(provider);
  if (!config.clientId || !config.clientSecret) return null;
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: config.redirectUri
  });
  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!response.ok) return null;
  return response.json() as Promise<{ id_token?: string }>;
}

export function decodeIdToken(idToken?: string): { sub: string; email: string; name?: string } | null {
  if (!idToken) return null;
  const [, payload] = idToken.split(".");
  if (!payload) return null;
  try {
    const json = Buffer.from(payload, "base64url").toString("utf8");
    const data = JSON.parse(json) as { sub?: string; email?: string; name?: string };
    if (!data.sub || !data.email) return null;
    return { sub: data.sub, email: data.email, name: data.name };
  } catch {
    return null;
  }
}
