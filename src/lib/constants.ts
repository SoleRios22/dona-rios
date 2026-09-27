export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://www.xn--doarios-5za.com.ar"
    : "http://localhost:3000");
export const SITE_NAME = "Doña Ríos — Almacén Saludable";
export const SITE_DESCRIPTION =
  "Selección de productos keto, low carb y sin gluten en Río Cuarto, Córdoba. No vendemos de todo. Elegimos lo mejor.";

export const BUSINESS = {
  name: "Doña Ríos - Almacén Saludable",
  whatsapp: "5493584315332",
  whatsappDisplay: "+54 358 431-5332",
 instagram: "donariosok",
  city: "Río Cuarto",
  region: "Córdoba",
  country: "AR",
   
};
