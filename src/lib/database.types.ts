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
      workspaces: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string | null
          created_by: string
          is_public: boolean | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string | null
          created_by: string
          is_public?: boolean | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string | null
          created_by?: string
          is_public?: boolean | null
        }
      }
      workspace_members: {
        Row: {
          workspace_id: string
          user_id: string
          role: string
          created_at: string | null
        }
        Insert: {
          workspace_id: string
          user_id: string
          role?: string
          created_at?: string | null
        }
        Update: {
          workspace_id?: string
          user_id?: string
          role?: string
          created_at?: string | null
        }
      }
      boards: {
        Row: {
          id: string
          workspace_id: string
          name: string
          description: string | null
          background: string | null
          created_at: string | null
          created_by: string
          is_public: boolean | null
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          description?: string | null
          background?: string | null
          created_at?: string | null
          created_by: string
          is_public?: boolean | null
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          description?: string | null
          background?: string | null
          created_at?: string | null
          created_by?: string
          is_public?: boolean | null
        }
      }
      lists: {
        Row: {
          id: string
          board_id: string
          name: string
          position: number
          created_at: string | null
          created_by: string
        }
        Insert: {
          id?: string
          board_id: string
          name: string
          position: number
          created_at?: string | null
          created_by: string
        }
        Update: {
          id?: string
          board_id?: string
          name?: string
          position?: number
          created_at?: string | null
          created_by?: string
        }
      }
      cards: {
        Row: {
          id: string
          list_id: string
          title: string
          description: string | null
          position: number
          due_date: string | null
          created_at: string | null
          created_by: string
        }
        Insert: {
          id?: string
          list_id: string
          title: string
          description?: string | null
          position: number
          due_date?: string | null
          created_at?: string | null
          created_by: string
        }
        Update: {
          id?: string
          list_id?: string
          title?: string
          description?: string | null
          position?: number
          due_date?: string | null
          created_at?: string | null
          created_by?: string
        }
      }
      labels: {
        Row: {
          id: string
          board_id: string
          name: string | null
          color: string
          created_at: string | null
          created_by: string
        }
        Insert: {
          id?: string
          board_id: string
          name?: string | null
          color: string
          created_at?: string | null
          created_by: string
        }
        Update: {
          id?: string
          board_id?: string
          name?: string | null
          color?: string
          created_at?: string | null
          created_by?: string
        }
      }
      card_labels: {
        Row: {
          card_id: string
          label_id: string
          created_at: string | null
        }
        Insert: {
          card_id: string
          label_id: string
          created_at?: string | null
        }
        Update: {
          card_id?: string
          label_id?: string
          created_at?: string | null
        }
      }
      checklists: {
        Row: {
          id: string
          card_id: string
          title: string
          position: number
          created_at: string | null
          created_by: string
        }
        Insert: {
          id?: string
          card_id: string
          title: string
          position: number
          created_at?: string | null
          created_by: string
        }
        Update: {
          id?: string
          card_id?: string
          title?: string
          position?: number
          created_at?: string | null
          created_by?: string
        }
      }
      checklist_items: {
        Row: {
          id: string
          checklist_id: string
          title: string
          is_completed: boolean
          position: number
          created_at: string | null
          created_by: string
        }
        Insert: {
          id?: string
          checklist_id: string
          title: string
          is_completed?: boolean
          position: number
          created_at?: string | null
          created_by: string
        }
        Update: {
          id?: string
          checklist_id?: string
          title?: string
          is_completed?: boolean
          position?: number
          created_at?: string | null
          created_by?: string
        }
      }
      comments: {
        Row: {
          id: string
          card_id: string
          content: string
          created_at: string | null
          created_by: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          card_id: string
          content: string
          created_at?: string | null
          created_by: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          card_id?: string
          content?: string
          created_at?: string | null
          created_by?: string
          updated_at?: string | null
        }
      }
      card_members: {
        Row: {
          card_id: string
          user_id: string
          created_at: string | null
        }
        Insert: {
          card_id: string
          user_id: string
          created_at?: string | null
        }
        Update: {
          card_id?: string
          user_id?: string
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}