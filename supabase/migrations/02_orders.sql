-- RPC Function to upsert customer (create or update)
CREATE OR REPLACE FUNCTION public.upsert_customer(
    p_name TEXT,
    p_email TEXT,
    p_phone TEXT DEFAULT NULL,
    p_whatsapp TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    customer_id UUID;
BEGIN
    -- First try to get existing customer by email
    SELECT id INTO customer_id
    FROM public.customers
    WHERE email = p_email;

    IF customer_id IS NOT NULL THEN
        -- Update existing customer
        UPDATE public.customers
        SET 
            name = p_name,
            phone = COALESCE(p_phone, phone),
            whatsapp = COALESCE(p_whatsapp, whatsapp),
            updated_at = NOW()
        WHERE id = customer_id;
    ELSE
        -- Create new customer
        INSERT INTO public.customers (name, email, phone, whatsapp)
        VALUES (p_name, p_email, p_phone, p_whatsapp)
        RETURNING id INTO customer_id;
    END IF;

    RETURN customer_id;
END;
$$;

COMMENT ON FUNCTION public.upsert_customer(TEXT, TEXT, TEXT, TEXT)
IS 'Creates a new customer or updates existing customer by email. Returns customer ID.';

-- Function to generate unique order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    year_prefix TEXT;
    sequence_num INTEGER;
    order_num TEXT;
BEGIN
    -- Get current year
    year_prefix := TO_CHAR(NOW(), 'YYYY');
    
    -- Get the next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 9) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM public.orders
    WHERE order_number LIKE 'KYS-' || year_prefix || '-%';
    
    -- Format order number: KYS-YYYY-XXX (e.g., KYS-2024-001)
    order_num := 'KYS-' || year_prefix || '-' || LPAD(sequence_num::TEXT, 3, '0');
    
    RETURN order_num;
END;
$$;

COMMENT ON FUNCTION public.generate_order_number()
IS 'Generates a unique order number in the format KYS-YYYY-XXX.';

-- RPC Function to create an order
CREATE OR REPLACE FUNCTION public.create_order(
    p_customer_id UUID,
    p_total_amount NUMERIC,
    p_currency_code TEXT DEFAULT 'XOF',
    p_shipping_fee NUMERIC DEFAULT 0,
    p_tax_amount NUMERIC DEFAULT 0,
    p_discount_amount NUMERIC DEFAULT 0,
    p_shipping_address JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    order_id UUID;
    order_num TEXT;
BEGIN
    -- Generate unique order number
    order_num := public.generate_order_number();
    
    INSERT INTO public.orders (
        customer_id,
        order_number,
        total_amount,
        currency_code,
        shipping_fee,
        tax_amount,
        discount_amount,
        shipping_address,
        status
    )
    VALUES (
        p_customer_id,
        order_num,
        p_total_amount,
        p_currency_code,
        p_shipping_fee,
        p_tax_amount,
        p_discount_amount,
        p_shipping_address,
        'pending_payment'
    )
    RETURNING id INTO order_id;

    RETURN order_id;
END;
$$;

COMMENT ON FUNCTION public.create_order(UUID, NUMERIC, TEXT, NUMERIC, NUMERIC, NUMERIC, JSONB)
IS 'Creates a new order record with pending_payment status. Returns order ID.';

-- RPC Function to create an order item
CREATE OR REPLACE FUNCTION public.create_order_item(
    p_order_id UUID,
    p_product_id TEXT,
    p_product_title TEXT,
    p_quantity INTEGER,
    p_price_per_item NUMERIC,
    p_total_amount NUMERIC,
    p_product_slug TEXT DEFAULT NULL,
    p_variant_id TEXT DEFAULT NULL,
    p_variant_title TEXT DEFAULT NULL,
    p_product_image_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    order_item_id UUID;
BEGIN
    INSERT INTO public.order_items (
        order_id,
        product_id,
        product_title,
        product_slug,
        variant_id,
        variant_title,
        quantity,
        price_per_item,
        total_amount,
        product_image_url
    )
    VALUES (
        p_order_id,
        p_product_id,
        p_product_title,
        p_product_slug,
        p_variant_id,
        p_variant_title,
        p_quantity,
        p_price_per_item,
        p_total_amount,
        p_product_image_url
    )
    RETURNING id INTO order_item_id;

    RETURN order_item_id;
END;
$$;

COMMENT ON FUNCTION public.create_order_item(UUID, TEXT, TEXT, INTEGER, NUMERIC, NUMERIC, TEXT, TEXT, TEXT, TEXT)
IS 'Creates an order item (line item) for an order. Returns order_item ID.';

-- RPC Function to update order with lomi session details
CREATE OR REPLACE FUNCTION public.update_order_lomi_session(
    p_order_id UUID,
    p_lomi_session_id TEXT,
    p_lomi_checkout_url TEXT,
    p_payment_processor_details JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Only update if the order doesn't already have a lomi session ID
    -- This prevents duplicate key errors when the same checkout is retried
    UPDATE public.orders
    SET
        lomi_session_id = p_lomi_session_id,
        lomi_checkout_url = p_lomi_checkout_url,
        payment_processor_details = COALESCE(p_payment_processor_details, payment_processor_details),
        updated_at = NOW()
    WHERE id = p_order_id
      AND (lomi_session_id IS NULL OR lomi_session_id = '');

    IF NOT FOUND THEN
        -- Check if the order exists but already has a session ID
        IF EXISTS (SELECT 1 FROM public.orders WHERE id = p_order_id) THEN
            RAISE WARNING 'Order ID % already has a lomi session ID, skipping update', p_order_id;
        ELSE
            RAISE WARNING 'Order ID % not found during lomi session update', p_order_id;
        END IF;
    END IF;
END;
$$;

COMMENT ON FUNCTION public.update_order_lomi_session(UUID, TEXT, TEXT, JSONB)
IS 'Updates order record with lomi session details after checkout session creation.';

-- RPC Function to record order payment from webhook
CREATE OR REPLACE FUNCTION public.record_order_payment(
    p_lomi_session_id TEXT,
    p_payment_status TEXT,
    p_total_amount NUMERIC,
    p_currency_code TEXT,
    p_lomi_event_payload JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    order_id UUID;
    final_status TEXT;
BEGIN
    -- Map payment status to order status
    IF p_payment_status = 'paid' THEN
        final_status := 'paid';
    ELSIF p_payment_status = 'payment_failed' THEN
        final_status := 'payment_failed';
    ELSE
        final_status := 'pending_payment';
    END IF;

    -- Find order by lomi_session_id
    SELECT id INTO order_id
    FROM public.orders
    WHERE lomi_session_id = p_lomi_session_id;

    IF order_id IS NULL THEN
        RAISE WARNING 'Order not found for lomi_session_id: %', p_lomi_session_id;
        RETURN NULL;
    END IF;

    -- Update order with payment details
    UPDATE public.orders
    SET 
        status = final_status,
        total_amount = p_total_amount,
        currency_code = p_currency_code,
        payment_processor_details = p_lomi_event_payload,
        updated_at = NOW()
    WHERE id = order_id;

    RETURN order_id;
END;
$$;

COMMENT ON FUNCTION public.record_order_payment(TEXT, TEXT, NUMERIC, TEXT, JSONB)
IS 'Records the outcome of a lomi. payment for an order, updating status and storing lomi. transaction details. Returns order_id.';

-- Grant execute permissions to service_role
GRANT EXECUTE ON FUNCTION public.upsert_customer(TEXT, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.generate_order_number() TO service_role;
GRANT EXECUTE ON FUNCTION public.create_order(UUID, NUMERIC, TEXT, NUMERIC, NUMERIC, NUMERIC, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.create_order_item(UUID, TEXT, TEXT, INTEGER, NUMERIC, NUMERIC, TEXT, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.update_order_lomi_session(UUID, TEXT, TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.record_order_payment(TEXT, TEXT, NUMERIC, TEXT, JSONB) TO service_role;
