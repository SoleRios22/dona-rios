"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ProductVisual from "@/components/ProductVisual";

export default function ImageUploader({
  value,
  onChange,
  colorway,
  isBox,
  kind = "product",
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  colorway: string;
  isBox: boolean;
  kind?: "product" | "nutrition";
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isNutrition = kind === "nutrition";

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    const extensions: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };

    const extension = extensions[file.type];

    if (!extension) {
      setError("Elegí un archivo de imagen JPG, PNG o WEBP.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede pesar más de 5MB.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setUploading(true);

    try {
      const supabase = createClient();
      const path = `${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        setError("No se pudo subir la imagen. Probá de nuevo.");
        return;
      }

      const { data } = supabase.storage
        .from("product-images")
        .getPublicUrl(path);

      onChange(data.publicUrl);
    } catch {
      setError("No se pudo subir la imagen. Probá de nuevo.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-forest/70">
        {isNutrition
          ? "Imagen de la etiqueta nutricional"
          : "Imagen del producto"}
      </span>

      <div className="flex flex-wrap items-center gap-4">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-line bg-cream-2">
          {isNutrition && !value ? (
            <div className="flex h-full items-center justify-center px-2 text-center text-xs text-forest/60">
              Sin imagen nutricional
            </div>
          ) : (
            <ProductVisual
              colorway={colorway}
              isBox={isNutrition ? false : isBox}
              imageUrl={value}
              size={44}
              alt={
                isNutrition
                  ? "Vista previa de la etiqueta nutricional"
                  : "Vista previa de la imagen del producto"
              }
              imageSizes="96px"
            />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-label={
              isNutrition
                ? "Seleccionar imagen de la etiqueta nutricional"
                : "Seleccionar imagen del producto"
            }
            onChange={handleFile}
            disabled={uploading}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="self-start rounded-full border-2 border-forest px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {uploading
              ? "Subiendo..."
              : value
                ? "Cambiar imagen"
                : "Subir imagen"}
          </button>

          {value && !uploading && (
            <button
              type="button"
              onClick={() => {
                setError(null);
                onChange(null);
              }}
              className="self-start text-left text-xs font-semibold text-clay"
            >
              {isNutrition
                ? "Quitar imagen nutricional"
                : "Quitar y usar ilustración"}
            </button>
          )}

          <p className="text-xs text-forest/50">
            JPG, PNG o WEBP. Máximo 5MB.{" "}
            {isNutrition
              ? "Usá una foto nítida, con los datos nutricionales legibles."
              : "Si no subís nada, se usa la ilustración de abajo."}
          </p>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs text-clay">
          {error}
        </p>
      )}
    </div>
  );
}