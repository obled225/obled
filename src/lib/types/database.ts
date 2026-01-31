export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.1';
  };
  public: {
    Tables: {
      contact_inquiries: {
        Row: {
          company: string | null;
          created_at: string;
          email: string;
          email_dispatch_attempts: number | null;
          email_dispatch_error: string | null;
          email_dispatch_status: string | null;
          id: string;
          message: string;
          name: string;
          updated_at: string;
          url: string | null;
        };
        Insert: {
          company?: string | null;
          created_at?: string;
          email: string;
          email_dispatch_attempts?: number | null;
          email_dispatch_error?: string | null;
          email_dispatch_status?: string | null;
          id?: string;
          message: string;
          name: string;
          updated_at?: string;
          url?: string | null;
        };
        Update: {
          company?: string | null;
          created_at?: string;
          email?: string;
          email_dispatch_attempts?: number | null;
          email_dispatch_error?: string | null;
          email_dispatch_status?: string | null;
          id?: string;
          message?: string;
          name?: string;
          updated_at?: string;
          url?: string | null;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          name: string | null;
          organization: string | null;
          phone: string | null;
          updated_at: string;
          whatsapp: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          name?: string | null;
          organization?: string | null;
          phone?: string | null;
          updated_at?: string;
          whatsapp?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          name?: string | null;
          organization?: string | null;
          phone?: string | null;
          updated_at?: string;
          whatsapp?: string | null;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          created_at: string;
          id: string;
          order_id: string;
          price_per_item: number;
          product_id: string;
          product_image_url: string | null;
          product_slug: string | null;
          product_title: string;
          quantity: number;
          total_amount: number;
          variant_id: string | null;
          variant_title: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          order_id: string;
          price_per_item: number;
          product_id: string;
          product_image_url?: string | null;
          product_slug?: string | null;
          product_title: string;
          quantity: number;
          total_amount: number;
          variant_id?: string | null;
          variant_title?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          order_id?: string;
          price_per_item?: number;
          product_id?: string;
          product_image_url?: string | null;
          product_slug?: string | null;
          product_title?: string;
          quantity?: number;
          total_amount?: number;
          variant_id?: string | null;
          variant_title?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
        ];
      };
      orders: {
        Row: {
          created_at: string;
          currency_code: string;
          customer_id: string;
          discount_amount: number | null;
          email_dispatch_attempts: number | null;
          email_dispatch_error: string | null;
          email_dispatch_status: string | null;
          id: string;
          lomi_checkout_url: string | null;
          lomi_session_id: string | null;
          notes: string | null;
          order_number: string;
          payment_processor_details: Json | null;
          shipping_address: Json | null;
          shipping_fee: number | null;
          status: string;
          tax_amount: number | null;
          total_amount: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          currency_code?: string;
          customer_id: string;
          discount_amount?: number | null;
          email_dispatch_attempts?: number | null;
          email_dispatch_error?: string | null;
          email_dispatch_status?: string | null;
          id?: string;
          lomi_checkout_url?: string | null;
          lomi_session_id?: string | null;
          notes?: string | null;
          order_number: string;
          payment_processor_details?: Json | null;
          shipping_address?: Json | null;
          shipping_fee?: number | null;
          status?: string;
          tax_amount?: number | null;
          total_amount: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          currency_code?: string;
          customer_id?: string;
          discount_amount?: number | null;
          email_dispatch_attempts?: number | null;
          email_dispatch_error?: string | null;
          email_dispatch_status?: string | null;
          id?: string;
          lomi_checkout_url?: string | null;
          lomi_session_id?: string | null;
          notes?: string | null;
          order_number?: string;
          payment_processor_details?: Json | null;
          shipping_address?: Json | null;
          shipping_fee?: number | null;
          status?: string;
          tax_amount?: number | null;
          total_amount?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'orders_customer_id_fkey';
            columns: ['customer_id'];
            isOneToOne: false;
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          },
        ];
      };
      verification_config: {
        Row: {
          config_key: string;
          config_value: string;
          created_at: string | null;
          id: string;
          updated_at: string | null;
        };
        Insert: {
          config_key: string;
          config_value: string;
          created_at?: string | null;
          id?: string;
          updated_at?: string | null;
        };
        Update: {
          config_key?: string;
          config_value?: string;
          created_at?: string | null;
          id?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_order: {
        Args: {
          p_currency_code?: string;
          p_customer_id: string;
          p_discount_amount?: number;
          p_shipping_address?: Json;
          p_shipping_fee?: number;
          p_tax_amount?: number;
          p_total_amount: number;
        };
        Returns: string;
      };
      create_order_item: {
        Args: {
          p_order_id: string;
          p_price_per_item: number;
          p_product_id: string;
          p_product_image_url?: string;
          p_product_slug?: string;
          p_product_title: string;
          p_quantity: number;
          p_total_amount: number;
          p_variant_id?: string;
          p_variant_title?: string;
        };
        Returns: string;
      };
      export_admin_orders_csv: {
        Args: never;
        Returns: {
          currency_code: string;
          customer_email: string;
          customer_name: string;
          customer_phone: string;
          email_dispatch_attempts: string;
          email_dispatch_status: string;
          order_date: string;
          order_id: string;
          order_number: string;
          status: string;
          total_amount: string;
        }[];
      };
      generate_order_number: { Args: never; Returns: string };
      get_admin_orders: {
        Args: never;
        Returns: {
          created_at: string;
          currency_code: string;
          customer_email: string;
          customer_id: string;
          customer_name: string;
          customer_phone: string;
          discount_amount: number;
          email_dispatch_attempts: number;
          email_dispatch_error: string;
          email_dispatch_status: string;
          item_count: number;
          order_id: string;
          order_number: string;
          shipping_fee: number;
          status: string;
          tax_amount: number;
          total_amount: number;
          total_items: number;
          updated_at: string;
        }[];
      };
      get_order_for_email_dispatch: {
        Args: { p_order_id: string };
        Returns: {
          created_at: string;
          currency_code: string;
          customer_email: string;
          customer_name: string;
          customer_phone: string;
          discount_amount: number;
          items: Json;
          order_id: string;
          order_number: string;
          shipping_address: Json;
          shipping_fee: number;
          tax_amount: number;
          total_amount: number;
        }[];
      };
      record_order_payment: {
        Args: {
          p_currency_code: string;
          p_lomi_event_payload: Json;
          p_lomi_session_id: string;
          p_payment_status: string;
          p_total_amount: number;
        };
        Returns: string;
      };
      reset_email_dispatch_status: {
        Args: { p_order_id: string };
        Returns: undefined;
      };
      search_admin_orders: {
        Args: { p_search_query: string };
        Returns: {
          created_at: string;
          currency_code: string;
          customer_email: string;
          customer_id: string;
          customer_name: string;
          customer_phone: string;
          discount_amount: number;
          email_dispatch_attempts: number;
          email_dispatch_error: string;
          email_dispatch_status: string;
          item_count: number;
          order_id: string;
          order_number: string;
          shipping_fee: number;
          status: string;
          tax_amount: number;
          total_amount: number;
          total_items: number;
          updated_at: string;
        }[];
      };
      update_contact_inquiry_email_dispatch_status: {
        Args: {
          p_contact_inquiry_id: string;
          p_email_dispatch_attempts?: number;
          p_email_dispatch_error?: string;
          p_email_dispatch_status?: string;
        };
        Returns: undefined;
      };
      update_customer_for_resend: {
        Args: {
          p_customer_id: string;
          p_new_email: string;
          p_new_name: string;
          p_new_phone?: string;
        };
        Returns: undefined;
      };
      update_email_dispatch_status: {
        Args: {
          p_email_dispatch_attempts?: number;
          p_email_dispatch_error?: string;
          p_email_dispatch_status?: string;
          p_order_id: string;
        };
        Returns: undefined;
      };
      update_order_lomi_session: {
        Args: {
          p_lomi_checkout_url: string;
          p_lomi_session_id: string;
          p_order_id: string;
          p_payment_processor_details?: Json;
        };
        Returns: undefined;
      };
      upsert_customer: {
        Args: {
          p_email: string;
          p_name: string;
          p_organization?: string;
          p_phone?: string;
          p_whatsapp?: string;
        };
        Returns: string;
      };
      verify_staff_pin: { Args: { p_pin: string }; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
