-- ==========================================
-- SUPABASE POSTGRESQL SCHEMA FOR NUTRIKART
-- ==========================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS FOR CONSTANT VALUES (Idempotent safe creation)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'vendor', 'customer', 'delivery');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE restaurant_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('placed', 'confirmed', 'preparing', 'picked', 'delivered');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT UNIQUE NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. RESTAURANTS TABLE (Updated to match specific Vendor Onboarding fields)
CREATE TABLE IF NOT EXISTS restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),          -- (restaurant_id)
    vendor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Restaurant Info
    name TEXT NOT NULL,                                      -- (restaurant_name)
    restaurant_type TEXT NOT NULL,
    cuisine_type TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    service_radius NUMERIC,
    
    -- FSSAI
    fssai_number TEXT NOT NULL,
    fssai_type TEXT NOT NULL,
    fssai_expiry DATE,
    
    -- Trade License
    trade_license_number TEXT NOT NULL,
    trade_license_expiry DATE,
    
    -- Aadhaar
    aadhaar_number TEXT NOT NULL,
    
    -- Extra media/info
    food_category TEXT NOT NULL,
    restaurant_logo TEXT,
    restaurant_cover TEXT,
    
    status restaurant_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Included to ensure frontend integration operates perfectly with extended fields requested by UI
    owner_name TEXT NOT NULL,
    owner_phone TEXT NOT NULL,
    owner_email TEXT NOT NULL,
    owner_address TEXT,
    contact_number TEXT NOT NULL,
    opening_time TIME,
    closing_time TIME,
    prep_time NUMERIC,
    trade_authority TEXT,
    fssai_doc_url TEXT,
    trade_doc_url TEXT,
    aadhaar_front_url TEXT,
    aadhaar_back_url TEXT,
    kitchen_photo TEXT,
    allergen_info TEXT,
    cooking_oil_type TEXT
);

-- 4. FOOD ITEMS TABLE
CREATE TABLE IF NOT EXISTS food_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    weight NUMERIC(10, 2) NOT NULL,
    nutrients JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    delivery_boy_id UUID REFERENCES users(id) ON DELETE SET NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_type TEXT DEFAULT 'COD',
    status order_status DEFAULT 'placed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    food_item_id UUID NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL
);
