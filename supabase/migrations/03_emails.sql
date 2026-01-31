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

-- Create the 'contact_inquiries' table
CREATE TABLE public.contact_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    url TEXT,
    message TEXT NOT NULL,
    email_dispatch_status TEXT DEFAULT 'PENDING',
    email_dispatch_attempts INTEGER DEFAULT 0,
    email_dispatch_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT contact_email_valid CHECK (email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
);

COMMENT ON COLUMN public.contact_inquiries.email IS 'Email address of the person submitting the contact inquiry.';
COMMENT ON COLUMN public.contact_inquiries.message IS 'Message content from the contact form.';
COMMENT ON COLUMN public.contact_inquiries.email_dispatch_status IS 'Status of email dispatch: PENDING, DISPATCH_IN_PROGRESS, SENT_SUCCESSFULLY, DISPATCH_FAILED';

-- Create indexes for common query patterns
CREATE INDEX idx_contact_inquiries_email ON public.contact_inquiries(email);
CREATE INDEX idx_contact_inquiries_created_at ON public.contact_inquiries(created_at);
CREATE INDEX idx_contact_inquiries_email_dispatch_status ON public.contact_inquiries(email_dispatch_status);

-- Enable Row Level Security (RLS) on the contact_inquiries table
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access on contact_inquiries
CREATE POLICY "Allow service_role full access on contact_inquiries"
ON public.contact_inquiries
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Allow anonymous users to insert contact inquiries
CREATE POLICY "Allow anonymous insert on contact_inquiries"
ON public.contact_inquiries
FOR INSERT
TO anon
WITH CHECK (true);

-- Apply the trigger to the contact_inquiries table for updates
CREATE TRIGGER set_contact_inquiry_updated_at
BEFORE UPDATE ON public.contact_inquiries
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- RPC Function to update email dispatch status for contact inquiries
CREATE OR REPLACE FUNCTION public.update_contact_inquiry_email_dispatch_status(
    p_contact_inquiry_id UUID,
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
    UPDATE public.contact_inquiries
    SET
        email_dispatch_status = COALESCE(p_email_dispatch_status, email_dispatch_status),
        email_dispatch_error = COALESCE(p_email_dispatch_error, email_dispatch_error),
        email_dispatch_attempts = COALESCE(p_email_dispatch_attempts, email_dispatch_attempts),
        updated_at = NOW()
    WHERE id = p_contact_inquiry_id;

    IF NOT FOUND THEN
        RAISE WARNING 'Contact inquiry ID % not found during email dispatch status update', p_contact_inquiry_id;
    END IF;
END;
$$;

COMMENT ON FUNCTION public.update_contact_inquiry_email_dispatch_status(UUID, TEXT, TEXT, INTEGER)
IS 'Updates email dispatch status and tracking information for a contact inquiry.';

-- Grant execute permissions to service_role
GRANT EXECUTE ON FUNCTION public.update_contact_inquiry_email_dispatch_status(UUID, TEXT, TEXT, INTEGER) TO service_role;
