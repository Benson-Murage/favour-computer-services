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
          about_mission: string | null
          about_story: string | null
          about_vision: string | null
          account_number: string | null
          address: string | null
          business_description: string | null
          company_name: string
          contact_hours: string | null
          created_at: string
          email: string | null
          facebook_url: string | null
          hero_cta_primary_label: string | null
          hero_cta_primary_url: string | null
          hero_cta_secondary_label: string | null
          hero_cta_secondary_url: string | null
          hero_subtitle: string | null
          hero_title: string | null
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          paybill_number: string | null
          payment_instructions: string | null
          phone: string | null
          pickup_location: string | null
          sender_email: string | null
          sender_name: string | null
          singleton: boolean
          tagline: string | null
          tiktok_url: string | null
          till_number: string | null
          twitter_url: string | null
          updated_at: string
          whatsapp: string | null
          whatsapp_url: string | null
          youtube_url: string | null
        }
        Insert: {
          about_mission?: string | null
          about_story?: string | null
          about_vision?: string | null
          account_number?: string | null
          address?: string | null
          business_description?: string | null
          company_name?: string
          contact_hours?: string | null
          created_at?: string
          email?: string | null
          facebook_url?: string | null
          hero_cta_primary_label?: string | null
          hero_cta_primary_url?: string | null
          hero_cta_secondary_label?: string | null
          hero_cta_secondary_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          paybill_number?: string | null
          payment_instructions?: string | null
          phone?: string | null
          pickup_location?: string | null
          sender_email?: string | null
          sender_name?: string | null
          singleton?: boolean
          tagline?: string | null
          tiktok_url?: string | null
          till_number?: string | null
          twitter_url?: string | null
          updated_at?: string
          whatsapp?: string | null
          whatsapp_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          about_mission?: string | null
          about_story?: string | null
          about_vision?: string | null
          account_number?: string | null
          address?: string | null
          business_description?: string | null
          company_name?: string
          contact_hours?: string | null
          created_at?: string
          email?: string | null
          facebook_url?: string | null
          hero_cta_primary_label?: string | null
          hero_cta_primary_url?: string | null
          hero_cta_secondary_label?: string | null
          hero_cta_secondary_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          paybill_number?: string | null
          payment_instructions?: string | null
          phone?: string | null
          pickup_location?: string | null
          sender_email?: string | null
          sender_name?: string | null
          singleton?: boolean
          tagline?: string | null
          tiktok_url?: string | null
          till_number?: string | null
          twitter_url?: string | null
          updated_at?: string
          whatsapp?: string | null
          whatsapp_url?: string | null
          youtube_url?: string | null
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
      email_log: {
        Row: {
          created_at: string
          error: string | null
          id: string
          payload: Json
          provider_message_id: string | null
          recipient: string
          related_id: string | null
          related_type: string | null
          sent_at: string | null
          status: string
          subject: string
          template: string | null
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          payload?: Json
          provider_message_id?: string | null
          recipient: string
          related_id?: string | null
          related_type?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          template?: string | null
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          payload?: Json
          provider_message_id?: string | null
          recipient?: string
          related_id?: string | null
          related_type?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          template?: string | null
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
      newsletter_subscribers: {
        Row: {
          confirmed: boolean
          created_at: string
          email: string
          id: string
          name: string | null
          source: string | null
        }
        Insert: {
          confirmed?: boolean
          created_at?: string
          email: string
          id?: string
          name?: string | null
          source?: string | null
        }
        Update: {
          confirmed?: boolean
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          source?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          channel: string
          created_at: string
          id: string
          kind: string
          metadata: Json
          recipient_email: string | null
          related_id: string | null
          related_type: string | null
          subject: string | null
          user_id: string | null
        }
        Insert: {
          body?: string | null
          channel?: string
          created_at?: string
          id?: string
          kind: string
          metadata?: Json
          recipient_email?: string | null
          related_id?: string | null
          related_type?: string | null
          subject?: string | null
          user_id?: string | null
        }
        Update: {
          body?: string | null
          channel?: string
          created_at?: string
          id?: string
          kind?: string
          metadata?: Json
          recipient_email?: string | null
          related_id?: string | null
          related_type?: string | null
          subject?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          delivery_address: string | null
          delivery_lat: number | null
          delivery_lng: number | null
          delivery_note: string | null
          fulfillment: Database["public"]["Enums"]["fulfillment_method"]
          id: string
          invoice_number: string | null
          items: Json
          notes: string | null
          payment_status: Database["public"]["Enums"]["order_payment_status"]
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
          delivery_lat?: number | null
          delivery_lng?: number | null
          delivery_note?: string | null
          fulfillment?: Database["public"]["Enums"]["fulfillment_method"]
          id?: string
          invoice_number?: string | null
          items?: Json
          notes?: string | null
          payment_status?: Database["public"]["Enums"]["order_payment_status"]
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
          delivery_lat?: number | null
          delivery_lng?: number | null
          delivery_note?: string | null
          fulfillment?: Database["public"]["Enums"]["fulfillment_method"]
          id?: string
          invoice_number?: string | null
          items?: Json
          notes?: string | null
          payment_status?: Database["public"]["Enums"]["order_payment_status"]
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
      payments: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          id: string
          method: string | null
          order_id: string
          proof_mime: string | null
          proof_path: string | null
          reference: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["payment_proof_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          id?: string
          method?: string | null
          order_id: string
          proof_mime?: string | null
          proof_path?: string | null
          reference?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["payment_proof_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          id?: string
          method?: string | null
          order_id?: string
          proof_mime?: string | null
          proof_path?: string | null
          reference?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["payment_proof_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
          image_urls: Json
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
          image_urls?: Json
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
          image_urls?: Json
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
      user_addresses: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          id: string
          is_default: boolean
          label: string | null
          latitude: number | null
          line1: string
          line2: string | null
          longitude: number | null
          phone: string | null
          postal_code: string | null
          recipient_name: string | null
          region: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string | null
          latitude?: number | null
          line1: string
          line2?: string | null
          longitude?: number | null
          phone?: string | null
          postal_code?: string | null
          recipient_name?: string | null
          region?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string | null
          latitude?: number | null
          line1?: string
          line2?: string | null
          longitude?: number | null
          phone?: string | null
          postal_code?: string | null
          recipient_name?: string | null
          region?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          disabled: boolean
          full_name: string | null
          last_login_at: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          disabled?: boolean
          full_name?: string | null
          last_login_at?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          disabled?: boolean
          full_name?: string | null
          last_login_at?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
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
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "staff" | "customer" | "super_admin"
      booking_status:
        | "new"
        | "contacted"
        | "quoted"
        | "confirmed"
        | "completed"
        | "cancelled"
      fulfillment_method: "delivery" | "pickup"
      order_payment_status:
        | "unpaid"
        | "awaiting_verification"
        | "paid"
        | "refunded"
      order_status:
        | "pending"
        | "paid"
        | "ready"
        | "picked_up"
        | "delivered"
        | "cancelled"
      payment_proof_status: "pending" | "approved" | "rejected"
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
      app_role: ["admin", "staff", "customer", "super_admin"],
      booking_status: [
        "new",
        "contacted",
        "quoted",
        "confirmed",
        "completed",
        "cancelled",
      ],
      fulfillment_method: ["delivery", "pickup"],
      order_payment_status: [
        "unpaid",
        "awaiting_verification",
        "paid",
        "refunded",
      ],
      order_status: [
        "pending",
        "paid",
        "ready",
        "picked_up",
        "delivered",
        "cancelled",
      ],
      payment_proof_status: ["pending", "approved", "rejected"],
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
