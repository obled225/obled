-- RPC Function to get order details for email dispatch
CREATE OR REPLACE FUNCTION public.get_order_for_email_dispatch(
    p_order_id UUID
)
RETURNS TABLE (
    order_id UUID,
    order_number TEXT,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    total_amount NUMERIC,
    currency_code TEXT,
    shipping_fee NUMERIC,
    tax_amount NUMERIC,
    discount_amount NUMERIC,
    shipping_address JSONB,
    items JSON,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.id AS order_id,
        o.order_number,
        c.name AS customer_name,
        c.email AS customer_email,
        c.phone AS customer_phone,
        o.total_amount,
        o.currency_code,
        o.shipping_fee,
        o.tax_amount,
        o.discount_amount,
        o.shipping_address,
        (
            SELECT json_agg(
                json_build_object(
                    'id', oi.id,
                    'product_id', oi.product_id,
                    'product_title', oi.product_title,
                    'product_slug', oi.product_slug,
                    'variant_id', oi.variant_id,
                    'variant_title', oi.variant_title,
                    'quantity', oi.quantity,
                    'price_per_item', oi.price_per_item,
                    'total_amount', oi.total_amount,
                    'product_image_url', oi.product_image_url
                )
            )
            FROM public.order_items oi
            WHERE oi.order_id = o.id
        ) AS items,
        o.created_at
    FROM
        public.orders o
    JOIN
        public.customers c ON o.customer_id = c.id
    WHERE
        o.id = p_order_id;
END;
$$;

COMMENT ON FUNCTION public.get_order_for_email_dispatch(UUID)
IS 'Retrieves complete order details with customer and items for email dispatch.';

-- RPC Function to update email dispatch status
CREATE OR REPLACE FUNCTION public.update_email_dispatch_status(
    p_order_id UUID,
    p_email_dispatch_status TEXT DEFAULT NULL,
    p_email_dispatch_error TEXT DEFAULT NULL,
    p_email_dispatch_attempts INTEGER DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.orders
    SET
        email_dispatch_status = COALESCE(p_email_dispatch_status, email_dispatch_status),
        email_dispatch_error = COALESCE(p_email_dispatch_error, email_dispatch_error),
        email_dispatch_attempts = COALESCE(p_email_dispatch_attempts, email_dispatch_attempts),
        updated_at = NOW()
    WHERE id = p_order_id;

    IF NOT FOUND THEN
        RAISE WARNING 'Order ID % not found during email dispatch status update', p_order_id;
    END IF;
END;
$$;

COMMENT ON FUNCTION public.update_email_dispatch_status(UUID, TEXT, TEXT, INTEGER)
IS 'Updates email dispatch status and tracking information for an order.';

-- RPC Function to reset email dispatch status (for retries)
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
        RAISE WARNING 'Order ID % not found during email dispatch status reset', p_order_id;
    END IF;
END;
$$;

COMMENT ON FUNCTION public.reset_email_dispatch_status(UUID)
IS 'Resets email dispatch status to PENDING to allow retrying email dispatch.';

-- Grant execute permissions to service_role
GRANT EXECUTE ON FUNCTION public.get_order_for_email_dispatch(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.update_email_dispatch_status(UUID, TEXT, TEXT, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.reset_email_dispatch_status(UUID) TO service_role;
