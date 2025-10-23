/*
  # Internal Search Engine Schema

  ## Overview
  Creates a comprehensive knowledge base system for company-wide document search and AI-powered retrieval.

  ## New Tables
  
  ### 1. `documents`
  Stores all searchable documents and content
  - `id` (uuid, primary key) - Unique document identifier
  - `title` (text) - Document title
  - `content` (text) - Full document content
  - `category` (text) - Document category (wiki, support, docs, etc.)
  - `tags` (text[]) - Array of tags for filtering
  - `file_url` (text, nullable) - URL to original file if uploaded
  - `file_type` (text, nullable) - Type of file (pdf, docx, txt, etc.)
  - `metadata` (jsonb) - Additional metadata
  - `created_by` (uuid) - User who created the document
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  - `is_archived` (boolean) - Whether document is archived

  ### 2. `search_history`
  Tracks all searches for analytics and improvements
  - `id` (uuid, primary key) - Unique search identifier
  - `user_id` (uuid) - User who performed search
  - `query` (text) - Search query text
  - `results_count` (integer) - Number of results returned
  - `selected_result_id` (uuid, nullable) - Which result was clicked
  - `created_at` (timestamptz) - When search was performed

  ### 3. `document_views`
  Tracks document access for popularity metrics
  - `id` (uuid, primary key) - Unique view identifier
  - `document_id` (uuid) - Document that was viewed
  - `user_id` (uuid) - User who viewed the document
  - `viewed_at` (timestamptz) - When document was viewed

  ## Security
  
  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Authenticated users can read all documents
  - Only document creators can update/delete their documents
  - All authenticated users can create documents
  - Search history is private to each user
  - Document views are tracked for all authenticated users

  ## Important Notes
  1. Documents support full-text search capabilities
  2. Tags enable flexible categorization
  3. Search history enables AI improvements over time
  4. Document views track engagement metrics
*/

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  tags text[] DEFAULT '{}',
  file_url text,
  file_type text,
  metadata jsonb DEFAULT '{}',
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_archived boolean DEFAULT false
);

-- Create search_history table
CREATE TABLE IF NOT EXISTS search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  query text NOT NULL,
  results_count integer DEFAULT 0,
  selected_result_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Create document_views table
CREATE TABLE IF NOT EXISTS document_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  viewed_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_created_by ON documents(created_by);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_views_document_id ON document_views(document_id);
CREATE INDEX IF NOT EXISTS idx_document_views_user_id ON document_views(user_id);

-- Enable full-text search on documents
CREATE INDEX IF NOT EXISTS idx_documents_content_fts ON documents USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_documents_title_fts ON documents USING gin(to_tsvector('english', title));

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_views ENABLE ROW LEVEL SECURITY;

-- Documents policies
CREATE POLICY "Authenticated users can view non-archived documents"
  ON documents FOR SELECT
  TO authenticated
  USING (is_archived = false);

CREATE POLICY "Authenticated users can create documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Document creators can update their documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Document creators can delete their documents"
  ON documents FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Search history policies
CREATE POLICY "Users can view their own search history"
  ON search_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create search history"
  ON search_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Document views policies
CREATE POLICY "Users can view their own document views"
  ON document_views FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create document views"
  ON document_views FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);