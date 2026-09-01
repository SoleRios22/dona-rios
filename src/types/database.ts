export type CategoryTag = "keto" | "low-carb" | "sin-gluten" | "sin-azucar" | "seleccion";

export const CATEGORY_LABELS: Record<CategoryTag, { label: string; emoji: string }> = {
  keto: { label: "Keto", emoji: "🥑" },
  "low-carb": { label: "Low carb", emoji: "🌱" },
  "sin-gluten": { label: "Sin gluten", emoji: "🌾" },
  "sin-azucar": { label: "Sin azúcar", emoji: "💚" },
  seleccion: { label: "Selección Doña Ríos", emoji: "⭐" },
};

export type UserRole = "customer" | "admin";
export type OrderFulfillment = "envio" | "retiro";
export type OrderPayment = "efectivo" | "transferencia" | "mercadopago" | "tarjeta";
export type OrderStatus = "pendiente" | "confirmado" | "entregado" | "cancelado";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          role: UserRole;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          short_description: string | null;
          description: string | null;
          price: number;
          old_price: number | null;
          unit: string | null;
          origin: string | null;
          suitable_for: string | null;
          colorway: string;
          is_box: boolean;
          is_active: boolean;
          stock: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["products"]["Row"]> & {
          slug: string;
          name: string;
          price: number;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Row"]>;
      };
      product_tags: {
        Row: { product_id: string; tag: CategoryTag };
        Insert: { product_id: string; tag: CategoryTag };
        Update: Partial<{ product_id: string; tag: CategoryTag }>;
      };
      product_variants: {
        Row: { id: string; product_id: string; label: string; price_delta: number; is_default: boolean };
        Insert: Partial<Database["public"]["Tables"]["product_variants"]["Row"]> & {
          product_id: string;
          label: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_variants"]["Row"]>;
      };
      product_nutrition: {
        Row: { product_id: string; label: string; value: string; sort_order: number };
        Insert: { product_id: string; label: string; value: string; sort_order?: number };
        Update: Partial<{ label: string; value: string; sort_order: number }>;
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          rating: number;
          comment: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id: string;
          rating: number;
          comment: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Row"]>;
      };
      carts: {
        Row: { id: string; user_id: string; updated_at: string };
        Insert: { id?: string; user_id: string; updated_at?: string };
        Update: Partial<{ updated_at: string }>;
      };
      cart_items: {
        Row: {
          id: string;
          cart_id: string;
          product_id: string;
          variant_id: string | null;
          quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          cart_id: string;
          product_id: string;
          variant_id?: string | null;
          quantity?: number;
        };
        Update: Partial<{ quantity: number }>;
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          fulfillment: OrderFulfillment;
          payment_method: OrderPayment;
          address: string | null;
          neighborhood: string | null;
          pickup_point: string | null;
          shipping_cost: number;
          total: number;
          status: OrderStatus;
          whatsapp_message: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["orders"]["Row"]> & {
          fulfillment: OrderFulfillment;
          payment_method: OrderPayment;
          total: number;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          variant_id: string | null;
          product_name_snapshot: string;
          unit_price: number;
          quantity: number;
        };
        Insert: Partial<Database["public"]["Tables"]["order_items"]["Row"]> & {
          order_id: string;
          product_name_snapshot: string;
          unit_price: number;
          quantity: number;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Row"]>;
      };
    };
  };
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  parent_tag: CategoryTag;
}

// Tipos "planos" convenientes para usar en componentes (con relaciones ya resueltas)
export interface ProductWithRelations {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  price: number;
  old_price: number | null;
  unit: string | null;
  origin: string | null;
  suitable_for: string | null;
  colorway: string;
  is_box: boolean;
  stock: number;
  tags: CategoryTag[];
  subcategories: { id: string; name: string; slug: string }[];
  variants: { id: string; label: string; price_delta: number; is_default: boolean }[];
  nutrition: { label: string; value: string }[];
  rating: number;
  reviewCount: number;
}
