export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string
          title: string
          content: string
          category: string
          tags: string[]
          file_url: string | null
          file_type: string | null
          metadata: Json
          created_by: string
          created_at: string
          updated_at: string
          is_archived: boolean
        }
        Insert: {
          id?: string
          title: string
          content: string
          category?: string
          tags?: string[]
          file_url?: string | null
          file_type?: string | null
          metadata?: Json
          created_by: string
          created_at?: string
          updated_at?: string
          is_archived?: boolean
        }
        Update: {
          id?: string
          title?: string
          content?: string
          category?: string
          tags?: string[]
          file_url?: string | null
          file_type?: string | null
          metadata?: Json
          created_by?: string
          created_at?: string
          updated_at?: string
          is_archived?: boolean
        }
      }
      search_history: {
        Row: {
          id: string
          user_id: string
          query: string
          results_count: number
          selected_result_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          query: string
          results_count?: number
          selected_result_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          query?: string
          results_count?: number
          selected_result_id?: string | null
          created_at?: string
        }
      }
      document_views: {
        Row: {
          id: string
          document_id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          document_id: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          user_id?: string
          viewed_at?: string
        }
      }
    }
  }
}
