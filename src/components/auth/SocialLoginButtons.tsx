"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

type Provider = "google" | "facebook";

export default function SocialLoginButtons({ redirectTo = "/" }: { redirectTo?: string }) {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);
  const supabase = createClient();

  async function handleLogin(provider: Provider) {
    setLoadingProvider(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
    if (error) setLoadingProvider(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => handleLogin("google")}
        disabled={loadingProvider !== null}
        className="flex items-center justify-center gap-3 rounded-full border-2 border-forest bg-white px-6 py-3.5 font-semibold text-forest transition hover:-translate-y-0.5 disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A10.99 10.99 0 0012 23z" />
          <path fill="#FBBC05" d="M5.84 14.09A6.6 6.6 0 015.5 12c0-.73.13-1.43.34-2.09V7.06H2.18A11 11 0 001 12c0 1.77.43 3.45 1.18 4.94l3.66-2.85z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85C6.71 7.31 9.14 5.38 12 5.38z" />
        </svg>
        {loadingProvider === "google" ? "Conectando..." : "Continuar con Google"}
      </button>

      <button
        onClick={() => handleLogin("facebook")}
        disabled={loadingProvider !== null}
        className="flex items-center justify-center gap-3 rounded-full bg-[#1877F2] px-6 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.86c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z" />
        </svg>
        {loadingProvider === "facebook" ? "Conectando..." : "Continuar con Facebook"}
      </button>
    </div>
  );
}
