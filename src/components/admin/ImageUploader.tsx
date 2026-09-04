"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ProductVisual from "@/components/ProductVisual";

export default function ImageUploader({
  value,
  onChange,
  colorway,
  isBox,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  colorway: string;
  isBox: boolean;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Elegí un archivo de imagen (JPG, PNG o WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede pesar más de 5MB.");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (uploadError) {
      setError("No se pudo subir la imagen. Probá de nuevo.");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-forest/70">Imagen del producto</span>
      <div className="flex items-center gap-4">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-line bg-cream-2">
          <ProductVisual colorway={colorway} isBox={isBox} imageUrl={value} size={44} />
        </div>
        <div className="flex flex-col gap-2">
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-full border-2 border-forest px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {uploading ? "Subiendo..." : value ? "Cambiar imagen" : "Subir imagen"}
          </button>
          {value && !uploading && (
            <button type="button" onClick={() => onChange(null)} className="text-left text-xs font-semibold text-clay">
              Quitar y usar ilustración
            </button>
          )}
          <p className="text-xs text-forest/50">JPG, PNG o WEBP. Máximo 5MB. Si no subís nada, se usa la ilustración de abajo.</p>
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-clay">{error}</p>}
    </div>
  );
}
