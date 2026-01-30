-- Create verification config table for storing secure settings (PIN)
CREATE TABLE IF NOT EXISTS public.verification_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key TEXT UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on the verification_config table
ALTER TABLE public.verification_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for verification_config
CREATE POLICY "Allow service_role full access on verification_config"
ON public.verification_config
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow authenticated users to read verification config (needed for staff PIN verification)
CREATE POLICY "Allow authenticated read on verification_config"
ON public.verification_config
FOR SELECT
TO authenticated
USING (true);

-- Insert the verification PIN (can be updated later)
INSERT INTO public.verification_config (config_key, config_value) 
VALUES ('staff_verification_pin', '2603')
ON CONFLICT (config_key) DO UPDATE SET 
    config_value = EXCLUDED.config_value,
    updated_at = NOW();

-- RPC Function to verify staff PIN
CREATE OR REPLACE FUNCTION public.verify_staff_pin(
    p_pin TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    stored_pin TEXT;
BEGIN
    -- Get the stored PIN from config
    SELECT config_value INTO stored_pin
    FROM public.verification_config
    WHERE config_key = 'staff_verification_pin';
    
    -- Return true if PIN matches
    RETURN (stored_pin = p_pin);
END;
$$;

-- Function to get all orders for admin view
CREATE OR REPLACE FUNCTION public.get_admin_orders()
RETURNS TABLE(
    order_id UUID,
    order_number TEXT,
    customer_id UUID,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    total_amount NUMERIC,
    currency_code TEXT,
    shipping_fee NUMERIC,
    tax_amount NUMERIC,
    discount_amount NUMERIC,
    status TEXT,
    email_dispatch_status TEXT,
    email_dispatch_attempts INTEGER,
    email_dispatch_error TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    item_count INTEGER,
    total_items INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id as order_id,
        o.order_number,
        o.customer_id,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        o.total_amount,
        o.currency_code,
        o.shipping_fee,
        o.tax_amount,
        o.discount_amount,
        o.status,
        o.email_dispatch_status,
        o.email_dispatch_attempts,
        o.email_dispatch_error,
        o.created_at,
        o.updated_at,
        COUNT(DISTINCT oi.id)::INTEGER as item_count,
        SUM(oi.quantity)::INTEGER as total_items
    FROM public.orders o
    INNER JOIN public.customers c ON o.customer_id = c.id
    LEFT JOIN public.order_items oi ON o.id = oi.order_id
    GROUP BY o.id, o.order_number, o.customer_id, c.name, c.email, c.phone,
             o.total_amount, o.currency_code, o.shipping_fee, o.tax_amount,
             o.discount_amount, o.status, o.email_dispatch_status,
             o.email_dispatch_attempts, o.email_dispatch_error,
             o.created_at, o.updated_at
    ORDER BY o.created_at DESC
    LIMIT 100; -- Limit to prevent performance issues
END;
$$;

-- Function to search orders for admin view
CREATE OR REPLACE FUNCTION public.search_admin_orders(
    p_search_query TEXT
)
RETURNS TABLE(
    order_id UUID,
    order_number TEXT,
    customer_id UUID,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    total_amount NUMERIC,
    currency_code TEXT,
    shipping_fee NUMERIC,
    tax_amount NUMERIC,
    discount_amount NUMERIC,
    status TEXT,
    email_dispatch_status TEXT,
    email_dispatch_attempts INTEGER,
    email_dispatch_error TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    item_count INTEGER,
    total_items INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id as order_id,
        o.order_number,
        o.customer_id,
        c.name as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        o.total_amount,
        o.currency_code,
        o.shipping_fee,
        o.tax_amount,
        o.discount_amount,
        o.status,
        o.email_dispatch_status,
        o.email_dispatch_attempts,
        o.email_dispatch_error,
        o.created_at,
        o.updated_at,
        COUNT(DISTINCT oi.id)::INTEGER as item_count,
        SUM(oi.quantity)::INTEGER as total_items
    FROM public.orders o
    INNER JOIN public.customers c ON o.customer_id = c.id
    LEFT JOIN public.order_items oi ON o.id = oi.order_id
    WHERE 
        LOWER(c.name) LIKE LOWER('%' || p_search_query || '%') OR
        LOWER(c.email) LIKE LOWER('%' || p_search_query || '%') OR
        LOWER(o.order_number) LIKE LOWER('%' || p_search_query || '%') OR
        LOWER(o.id::text) LIKE LOWER('%' || p_search_query || '%')
    GROUP BY o.id, o.order_number, o.customer_id, c.name, c.email, c.phone,
             o.total_amount, o.currency_code, o.shipping_fee, o.tax_amount,
             o.discount_amount, o.status, o.email_dispatch_status,
             o.email_dispatch_attempts, o.email_dispatch_error,
             o.created_at, o.updated_at
    ORDER BY o.created_at DESC
    LIMIT 50; -- Limit search results
END;
$$;

-- Function to update customer information for resending emails
CREATE OR REPLACE FUNCTION public.update_customer_for_resend(
    p_customer_id UUID,
    p_new_email TEXT,
    p_new_name TEXT,
    p_new_phone TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    existing_customer_id UUID;
    current_customer_record RECORD;
BEGIN
    -- Get current customer details
    SELECT id, name, email, phone INTO current_customer_record
    FROM public.customers
    WHERE id = p_customer_id;

    IF NOT FOUND THEN
        RAISE WARNING 'Customer ID % not found during update_customer_for_resend', p_customer_id;
        RETURN;
    END IF;

    -- Check if the new email already exists for another customer
    SELECT id INTO existing_customer_id
    FROM public.customers
    WHERE email = p_new_email AND id != p_customer_id;

    IF FOUND THEN
        -- Email exists for another customer, check if details are very similar
        IF LOWER(TRIM(COALESCE(current_customer_record.name, ''))) = LOWER(TRIM(COALESCE(p_new_name, '')))
           AND (
               (current_customer_record.phone IS NULL AND (p_new_phone IS NULL OR p_new_phone = '')) OR
               (p_new_phone IS NOT NULL AND p_new_phone != '' AND current_customer_record.phone = p_new_phone)
           ) THEN
            -- Very similar customer details, assume it's the same person
            -- Reassign this order to the existing customer and delete the duplicate
            UPDATE public.orders
            SET customer_id = existing_customer_id, updated_at = NOW()
            WHERE customer_id = p_customer_id;

            -- Delete the duplicate customer record
            DELETE FROM public.customers WHERE id = p_customer_id;

            RAISE NOTICE 'Merged duplicate customer % into existing customer % (same email and matching details)', p_customer_id, existing_customer_id;
        ELSE
            -- Email exists but details don't match - cannot automatically merge
            RAISE EXCEPTION 'Email % already exists for a different customer. Manual review required.', p_new_email;
        END IF;
    ELSE
        -- Email doesn't exist, safe to update normally
        UPDATE public.customers
        SET
            email = p_new_email,
            name = p_new_name,
            phone = COALESCE(NULLIF(p_new_phone, ''), phone),
            updated_at = NOW()
        WHERE id = p_customer_id;
    END IF;
END;
$$;

-- Function to reset email dispatch status to allow resending
CREATE OR REPLACE FUNCTION public.reset_email_dispatch_status(
    p_order_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.orders
    SET 
        email_dispatch_status = 'PENDING',
        email_dispatch_error = NULL,
        updated_at = NOW()
    WHERE id = p_order_id;

    IF NOT FOUND THEN
        RAISE WARNING 'Order ID % not found during reset_email_dispatch_status', p_order_id;
    END IF;
END;
$$;

-- Function to get orders data for CSV export
CREATE OR REPLACE FUNCTION public.export_admin_orders_csv()
RETURNS TABLE(
    order_id TEXT,
    order_number TEXT,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    total_amount TEXT,
    currency_code TEXT,
    status TEXT,
    email_dispatch_status TEXT,
    email_dispatch_attempts TEXT,
    order_date TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id::TEXT as order_id,
        o.order_number,
        c.name as customer_name,
        c.email as customer_email,
        COALESCE(c.phone, '') as customer_phone,
        o.total_amount::TEXT,
        o.currency_code,
        o.status,
        o.email_dispatch_status,
        o.email_dispatch_attempts::TEXT,
        o.created_at::TEXT as order_date
    FROM public.orders o
    INNER JOIN public.customers c ON o.customer_id = c.id
    ORDER BY o.created_at DESC;
END;
$$;

-- Grant execute permissions to service_role
GRANT EXECUTE ON FUNCTION public.verify_staff_pin(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_admin_orders() TO service_role;
GRANT EXECUTE ON FUNCTION public.search_admin_orders(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.update_customer_for_resend(UUID, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.reset_email_dispatch_status(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.export_admin_orders_csv() TO service_role;

-- Comments
COMMENT ON FUNCTION public.verify_staff_pin(TEXT)
IS 'Verifies staff PIN for admin panel access';

COMMENT ON FUNCTION public.get_admin_orders()
IS 'Retrieves all orders for admin panel with customer information';

COMMENT ON FUNCTION public.search_admin_orders(TEXT)
IS 'Searches orders by customer name, email, order number, or order ID';

COMMENT ON FUNCTION public.update_customer_for_resend(UUID, TEXT, TEXT, TEXT)
IS 'Updates customer information when resending emails. Handles duplicate emails by merging customers with matching details.';

COMMENT ON FUNCTION public.reset_email_dispatch_status(UUID)
IS 'Resets email dispatch status to allow resending order confirmation emails';

COMMENT ON FUNCTION public.export_admin_orders_csv()
IS 'Exports all orders data in CSV-friendly format for admin download';
