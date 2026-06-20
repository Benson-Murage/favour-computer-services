export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_email: string | null
          admin_id: string | null
          created_at: string
          details: Json | null
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          admin_email?: string | null
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          admin_email?: string | null
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          created_at: string
          email: string
          event_date: string | null
          event_location: string | null
          event_type: string | null
          id: string
          internal_notes: string | null
          name: string
          package: string | null
          phone: string
          requirements: string | null
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          event_date?: string | null
          event_location?: string | null
          event_type?: string | null
          id?: string
          internal_notes?: string | null
          name: string
          package?: string | null
          phone: string
          requirements?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          event_date?: string | null
          event_location?: string | null
          event_type?: string | null
          id?: string
          internal_notes?: string | null
          name?: string
          package?: string | null
          phone?: string
          requirements?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      business_settings: {
        Row: {
          account_number: string | null
          address: string | null
          business_description: string | null
          company_name: string
          created_at: string
          email: string | null
          id: string
          paybill_number: string | null
          payment_instructions: string | null
          phone: string | null
          pickup_location: string | null
          singleton: boolean
          till_number: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          account_number?: string | null
          address?: string | null
          business_description?: string | null
          company_name?: string
          created_at?: string
          email?: string | null
          id?: string
          paybill_number?: string | null
          payment_instructions?: string | null
          phone?: string | null
          pickup_location?: string | null
          singleton?: boolean
          till_number?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          account_number?: string | null
          address?: string | null
          business_description?: string | null
          company_name?: string
          created_at?: string
          email?: string | null
          id?: string
          paybill_number?: string | null
          payment_instructions?: string | null
          phone?: string | null
          pickup_location?: string | null
          singleton?: boolean
          till_number?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      inventory_movements: {
        Row: {
          admin_id: string | null
          created_at: string
          delta: number
          id: string
          product_id: string
          reason: string
          reference_id: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          delta: number
          id?: string
          product_id: string
          reason?: string
          reference_id?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          delta?: number
          id?: string
          product_id?: string
          reason?: string
          reference_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          delivery_address: string | null
          fulfillment: Database["public"]["Enums"]["fulfillment_method"]
          id: string
          items: Json
          notes: string | null
          pickup_code: string | null
          reservation_number: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone: string
          delivery_address?: string | null
          fulfillment?: Database["public"]["Enums"]["fulfillment_method"]
          id?: string
          items?: Json
          notes?: string | null
          pickup_code?: string | null
          reservation_number?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          delivery_address?: string | null
          fulfillment?: Database["public"]["Enums"]["fulfillment_method"]
          id?: string
          items?: Json
          notes?: string | null
          pickup_code?: string | null
          reservation_number?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          archived_at: string | null
          brand_id: string | null
          category_id: string | null
          compare_at_price: number | null
          condition: Database["public"]["Enums"]["product_condition"]
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          images: Json | null
          is_best_seller: boolean | null
          is_featured: boolean | null
          is_new_arrival: boolean | null
          is_on_offer: boolean | null
          name: string
          offer_ends_at: string | null
          offer_percent: number | null
          offer_price: number | null
          offer_starts_at: string | null
          price: number
          processor: string | null
          ram: string | null
          rating: number | null
          review_count: number | null
          slug: string
          sort_order: number | null
          specs: Json | null
          stock: number
          storage: string | null
          updated_at: string
          warranty: string | null
        }
        Insert: {
          archived_at?: string | null
          brand_id?: string | null
          category_id?: string | null
          compare_at_price?: number | null
          condition?: Database["public"]["Enums"]["product_condition"]
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          images?: Json | null
          is_best_seller?: boolean | null
          is_featured?: boolean | null
          is_new_arrival?: boolean | null
          is_on_offer?: boolean | null
          name: string
          offer_ends_at?: string | null
          offer_percent?: number | null
          offer_price?: number | null
          offer_starts_at?: string | null
          price: number
          processor?: string | null
          ram?: string | null
          rating?: number | null
          review_count?: number | null
          slug: string
          sort_order?: number | null
          specs?: Json | null
          stock?: number
          storage?: string | null
          updated_at?: string
          warranty?: string | null
        }
        Update: {
          archived_at?: string | null
          brand_id?: string | null
          category_id?: string | null
          compare_at_price?: number | null
          condition?: Database["public"]["Enums"]["product_condition"]
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          images?: Json | null
          is_best_seller?: boolean | null
          is_featured?: boolean | null
          is_new_arrival?: boolean | null
          is_on_offer?: boolean | null
          name?: string
          offer_ends_at?: string | null
          offer_percent?: number | null
          offer_price?: number | null
          offer_starts_at?: string | null
          price?: number
          processor?: string | null
          ram?: string | null
          rating?: number | null
          review_count?: number | null
          slug?: string
          sort_order?: number | null
          specs?: Json | null
          stock?: number
          storage?: string | null
          updated_at?: string
          warranty?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          active: boolean
          created_at: string
          ends_at: string | null
          id: string
          name: string
          percent_off: number | null
          price_override: number | null
          product_id: string | null
          starts_at: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          ends_at?: string | null
          id?: string
          name: string
          percent_off?: number | null
          price_override?: number | null
          product_id?: string | null
          starts_at?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          ends_at?: string | null
          id?: string
          name?: string
          percent_off?: number | null
          price_override?: number | null
          product_id?: string | null
          starts_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          created_at: string
          email: string
          id: string
          internal_notes: string | null
          location: string | null
          message: string | null
          metadata: Json | null
          name: string
          package: string | null
          phone: string
          product_id: string | null
          service_type: string | null
          source: Database["public"]["Enums"]["quote_source"]
          status: Database["public"]["Enums"]["quote_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          internal_notes?: string | null
          location?: string | null
          message?: string | null
          metadata?: Json | null
          name: string
          package?: string | null
          phone: string
          product_id?: string | null
          service_type?: string | null
          source?: Database["public"]["Enums"]["quote_source"]
          status?: Database["public"]["Enums"]["quote_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          internal_notes?: string | null
          location?: string | null
          message?: string | null
          metadata?: Json | null
          name?: string
          package?: string | null
          phone?: string
          product_id?: string | null
          service_type?: string | null
          source?: Database["public"]["Enums"]["quote_source"]
          status?: Database["public"]["Enums"]["quote_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      service_packages: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          equipment: Json | null
          features: Json | null
          id: string
          kind: Database["public"]["Enums"]["service_kind"]
          name: string
          price: number | null
          price_label: string | null
          sort_order: number | null
          tagline: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          equipment?: Json | null
          features?: Json | null
          id?: string
          kind: Database["public"]["Enums"]["service_kind"]
          name: string
          price?: number | null
          price_label?: string | null
          sort_order?: number | null
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          equipment?: Json | null
          features?: Json | null
          id?: string
          kind?: Database["public"]["Enums"]["service_kind"]
          name?: string
          price?: number | null
          price_label?: string | null
          sort_order?: number | null
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_first_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "customer"
      booking_status:
        | "new"
        | "contacted"
        | "quoted"
        | "confirmed"
        | "completed"
        | "cancelled"
      fulfillment_method: "delivery" | "pickup"
      order_status:
        | "pending"
        | "paid"
        | "ready"
        | "picked_up"
        | "delivered"
        | "cancelled"
      product_condition:
        | "new"
        | "certified_refurbished"
        | "refurbished_a"
        | "refurbished_b"
        | "open_box"
      quote_source: "cctv" | "livestream" | "product" | "contact" | "general"
      quote_status: "new" | "contacted" | "quoted" | "converted" | "cancelled"
      service_kind: "cctv" | "livestream"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff", "customer"],
      booking_status: [
        "new",
        "contacted",
        "quoted",
        "confirmed",
        "completed",
        "cancelled",
      ],
      fulfillment_method: ["delivery", "pickup"],
      order_status: [
        "pending",
        "paid",
        "ready",
        "picked_up",
        "delivered",
        "cancelled",
      ],
      product_condition: [
        "new",
        "certified_refurbished",
        "refurbished_a",
        "refurbished_b",
        "open_box",
      ],
      quote_source: ["cctv", "livestream", "product", "contact", "general"],
      quote_status: ["new", "contacted", "quoted", "converted", "cancelled"],
      service_kind: ["cctv", "livestream"],
    },
  },
} as const
