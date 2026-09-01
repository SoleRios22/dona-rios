import { getContactMessages } from "@/lib/actions/contact";
import ResolvedToggle from "@/components/admin/ResolvedToggle";

export default async function AdminMessagesPage() {
  const messages = await getContactMessages();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl">Mensajes de contacto</h1>
        <p className="mt-1 text-sm text-forest/60">{messages.length} mensajes recibidos</p>
      </div>

      {messages.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-10 text-center text-sm text-forest/60">
          Todavía no recibiste ningún mensaje.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {messages.map((m) => (
            <div key={m.id} className="rounded-2xl border border-line bg-white p-6">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{m.name}</p>
                  <a href={`mailto:${m.email}`} className="text-xs text-avocado-dark underline">
                    {m.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-forest/40">
                    {new Date(m.created_at).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                  </span>
                  <ResolvedToggle id={m.id} resolved={m.resolved} />
                </div>
              </div>
              <p className="text-sm text-forest/70">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
