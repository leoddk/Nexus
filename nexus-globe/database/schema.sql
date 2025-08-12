-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create nexus_points table for military hub locations
CREATE TABLE IF NOT EXISTS nexus_points (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    latitude REAL NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
    longitude REAL NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
    status TEXT NOT NULL DEFAULT 'green' CHECK (status IN ('green', 'yellow', 'red')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nexus_points ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Nexus points policies
CREATE POLICY "Authenticated users can view all points" ON nexus_points
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin users can insert points" ON nexus_points
    FOR INSERT TO authenticated 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admin users can update points" ON nexus_points
    FOR UPDATE TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admin users can delete points" ON nexus_points
    FOR DELETE TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_nexus_points_updated_at 
    BEFORE UPDATE ON nexus_points 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();