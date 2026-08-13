-- 1. Function for parsing Clerk JWT (From Browser Subagent)
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS TEXT AS $$
    SELECT NULLIF(
        current_setting('request.jwt.claims', true)::json->>'sub',
        ''
    )::text;
$$ LANGUAGE SQL STABLE;

-- 2. Create Category Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Material Table
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  unit TEXT NOT NULL,
  balance INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Transaction Table
CREATE TYPE transaction_type AS ENUM ('INBOUND', 'OUTBOUND');
CREATE TYPE transaction_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Clerk User ID
  type transaction_type NOT NULL,
  quantity INTEGER NOT NULL,
  status transaction_status DEFAULT 'COMPLETED'::transaction_status NOT NULL,
  remark TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 6. Basic RLS Policies (Requires more strict auth checks depending on Clerk role sync, but for now allow read access to authenticated users)
CREATE POLICY "Allow read access to all authenticated users for categories"
ON categories FOR SELECT
TO authenticated
USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Allow read access to all authenticated users for materials"
ON materials FOR SELECT
TO authenticated
USING (requesting_user_id() IS NOT NULL);

CREATE POLICY "Allow users to view their own transactions"
ON transactions FOR SELECT
TO authenticated
USING (requesting_user_id() = user_id);

CREATE POLICY "Allow users to insert their own transactions (Request material)"
ON transactions FOR INSERT
TO authenticated
WITH CHECK (requesting_user_id() = user_id);
