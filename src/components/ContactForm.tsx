"use client";

import { useState, useTransition } from "react";
import { submitContactMessage } from "@/lib/actions/contact";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await submitContactMessage(name, email, message);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      setName("");
      setEmail("");
      setMessage("");
    });
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-line bg-white p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-avocado">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FBF6EA" strokeWidth="2.5">
            <path d="M5 12l5 5L20 7" />
          </svg>
        </div>
        <h2 className="mb-2 text-xl">¡Mensaje enviado!</h2>
        <p className="mb-5 text-sm text-forest/60">Te vamos a responder a la brevedad.</p>
        <button onClick={() => setSuccess(false)} className="text-sm font-semibold text-avocado-dark underline">
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-white p-6 sm:p-8">
      {error && <p className="mb-5 rounded-xl bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p>}

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-forest/70">Nombre</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm"
        />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-forest/70">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="w-full rounded-xl border border-line px-3.5 py-2.5 text-sm"
        />
      </div>

      <div className="mb-6">
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-forest/70">Mensaje</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Contanos en qué te podemos ayudar..."
          className="min-h-[130px] w-full resize-y rounded-xl border border-line px-3.5 py-3 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-avocado py-3.5 font-semibold text-cream shadow-[0_5px_0_var(--color-avocado-dark)] disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {isPending ? "Enviando..." : "Enviar mensaje"}
      </button>
    </form>
  );
}
