-- Enable real-time for the nexus_points table
-- This needs to be run in the Supabase SQL editor

-- First, check if the table is already in the publication
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' AND tablename = 'nexus_points';

-- If not found, add it to the publication
ALTER PUBLICATION supabase_realtime ADD TABLE nexus_points;

-- Verify it was added
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' AND tablename = 'nexus_points';