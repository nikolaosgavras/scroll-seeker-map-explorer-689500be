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
      treasures: {
        Row: {
          id: string
          name: string
          clue: string
          x: number
          y: number
          description: string
          picture_url: string | null
        }
        Insert: {
          id?: string
          name: string
          clue: string
          x: number
          y: number
          description: string
          picture_url?: string | null
        }
        Update: {
          id?: string
          name?: string
          clue?: string
          x?: number
          y?: number
          description?: string
          picture_url?: string | null
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