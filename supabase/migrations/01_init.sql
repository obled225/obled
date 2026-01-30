-- Create the 'customers' table
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    whatsapp TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT customer_email_valid CHECK (email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
);

COMMENT ON COLUMN public.customers.email IS 'Email is used to identify and link customer orders.';

-- Enable Row Level Security (RLS) on the customers table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access on customers
CREATE POLICY "Allow service_role full access on customers"
ON public.customers
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.trigger_set_timestamp() IS 'Trigger function to update updated_at timestamp';

-- Apply the trigger to the customers table for updates
CREATE TRIGGER set_customer_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- Create the 'orders' table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    order_number TEXT UNIQUE NOT NULL,
    total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
    currency_code TEXT DEFAULT 'XOF' NOT NULL,
    shipping_fee NUMERIC DEFAULT 0 CHECK (shipping_fee >= 0),
    tax_amount NUMERIC DEFAULT 0 CHECK (tax_amount >= 0),
    discount_amount NUMERIC DEFAULT 0 CHECK (discount_amount >= 0),
    shipping_address JSONB,
    lomi_session_id TEXT UNIQUE,
    lomi_checkout_url TEXT,
    status TEXT DEFAULT 'pending_payment' NOT NULL,
    payment_processor_details JSONB,
    email_dispatch_status TEXT DEFAULT 'PENDING',
    email_dispatch_attempts INTEGER DEFAULT 0,
    email_dispatch_error TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT valid_status CHECK (status IN ('pending_payment', 'paid', 'payment_failed', 'processing', 'shipped', 'delivered', 'cancelled'))
);

COMMENT ON COLUMN public.orders.customer_id IS 'Links to the customer who made the order.';
COMMENT ON COLUMN public.orders.order_number IS 'Human-readable order number (e.g., KYS-2024-001).';
COMMENT ON COLUMN public.orders.lomi_session_id IS 'Unique ID from Lomi for the checkout session. Used to reconcile webhook events.';
COMMENT ON COLUMN public.orders.status IS 'Tracks the state of the order and payment process.';
COMMENT ON COLUMN public.orders.shipping_address IS 'JSONB object containing shipping address details: name, address, city, country, postal_code, phone.';

-- Create indexes for common query patterns
CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_lomi_session_id ON public.orders(lomi_session_id);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_customers_email ON public.customers(email);

-- Enable Row Level Security (RLS) on the orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow full access for the service_role
CREATE POLICY "Allow service_role full access on orders"
ON public.orders
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Apply the trigger to the orders table for updates
CREATE TRIGGER set_order_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- Create the 'order_items' table
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    product_title TEXT NOT NULL,
    product_slug TEXT,
    variant_id TEXT,
    variant_title TEXT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_per_item NUMERIC NOT NULL CHECK (price_per_item >= 0),
    total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
    product_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON COLUMN public.order_items.product_id IS 'Product ID from Sanity CMS.';
COMMENT ON COLUMN public.order_items.variant_id IS 'Variant ID if product has variants (size, color, etc.).';
COMMENT ON COLUMN public.order_items.variant_title IS 'Human-readable variant name (e.g., "Large - Red").';

-- Create indexes for order_items
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);

-- Enable Row Level Security (RLS) on the order_items table
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Allow full access for the service_role
CREATE POLICY "Allow service_role full access on order_items"
ON public.order_items
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
