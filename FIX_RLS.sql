-- Fix RLS Policy for insert operations
ALTER TABLE signals DISABLE ROW LEVEL SECURITY;

-- Veya alternatif olarak insert policy ekle:
CREATE POLICY "Allow insert signals" ON signals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read signals" ON signals
  FOR SELECT USING (true);
