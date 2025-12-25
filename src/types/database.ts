export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'teacher' | 'student'
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced'
export type AssignmentStatus = 'pending' | 'submitted' | 'reviewed'
export type FileType = 'pdf' | 'audio' | 'video'
export type LessonStatus = 'scheduled' | 'completed' | 'cancelled'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: UserRole
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role: UserRole
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: UserRole
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      teacher_profiles: {
        Row: {
          id: string
          user_id: string
          studio_name: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          studio_name?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          studio_name?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      student_profiles: {
        Row: {
          id: string
          user_id: string
          teacher_id: string
          instrument: string | null
          skill_level: SkillLevel | null
          notes: string | null
          weekly_practice_goal_minutes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          teacher_id: string
          instrument?: string | null
          skill_level?: SkillLevel | null
          notes?: string | null
          weekly_practice_goal_minutes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          teacher_id?: string
          instrument?: string | null
          skill_level?: SkillLevel | null
          notes?: string | null
          weekly_practice_goal_minutes?: number
          created_at?: string
          updated_at?: string
        }
      }
      invites: {
        Row: {
          id: string
          teacher_id: string
          email: string | null
          token: string
          expires_at: string
          used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          email?: string | null
          token: string
          expires_at: string
          used_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          email?: string | null
          token?: string
          expires_at?: string
          used_at?: string | null
          created_at?: string
        }
      }
      assignments: {
        Row: {
          id: string
          teacher_id: string
          title: string
          description: string | null
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          title: string
          description?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          title?: string
          description?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      assignment_students: {
        Row: {
          id: string
          assignment_id: string
          student_id: string
          status: AssignmentStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          assignment_id: string
          student_id: string
          status?: AssignmentStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          assignment_id?: string
          student_id?: string
          status?: AssignmentStatus
          created_at?: string
          updated_at?: string
        }
      }
      assignment_files: {
        Row: {
          id: string
          assignment_id: string
          file_url: string
          file_type: FileType
          file_name: string
          created_at: string
        }
        Insert: {
          id?: string
          assignment_id: string
          file_url: string
          file_type: FileType
          file_name: string
          created_at?: string
        }
        Update: {
          id?: string
          assignment_id?: string
          file_url?: string
          file_type?: FileType
          file_name?: string
          created_at?: string
        }
      }
      submissions: {
        Row: {
          id: string
          assignment_id: string
          student_id: string
          file_url: string
          file_type: FileType
          notes: string | null
          submitted_at: string
        }
        Insert: {
          id?: string
          assignment_id: string
          student_id: string
          file_url: string
          file_type: FileType
          notes?: string | null
          submitted_at?: string
        }
        Update: {
          id?: string
          assignment_id?: string
          student_id?: string
          file_url?: string
          file_type?: FileType
          notes?: string | null
          submitted_at?: string
        }
      }
      feedback: {
        Row: {
          id: string
          submission_id: string
          teacher_id: string
          content: string
          rating: number | null
          created_at: string
        }
        Insert: {
          id?: string
          submission_id: string
          teacher_id: string
          content: string
          rating?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          submission_id?: string
          teacher_id?: string
          content?: string
          rating?: number | null
          created_at?: string
        }
      }
      practice_logs: {
        Row: {
          id: string
          student_id: string
          date: string
          duration_minutes: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          date: string
          duration_minutes: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          date?: string
          duration_minutes?: number
          notes?: string | null
          created_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          teacher_id: string
          student_id: string
          start_time: string
          end_time: string
          status: LessonStatus
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          student_id: string
          start_time: string
          end_time: string
          status?: LessonStatus
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          student_id?: string
          start_time?: string
          end_time?: string
          status?: LessonStatus
          notes?: string | null
          created_at?: string
        }
      }
      resources: {
        Row: {
          id: string
          teacher_id: string
          title: string
          file_url: string
          file_type: string
          created_at: string
        }
        Insert: {
          id?: string
          teacher_id: string
          title: string
          file_url: string
          file_type: string
          created_at?: string
        }
        Update: {
          id?: string
          teacher_id?: string
          title?: string
          file_url?: string
          file_type?: string
          created_at?: string
        }
      }
      assignment_resources: {
        Row: {
          id: string
          assignment_id: string
          resource_id: string
          created_at: string
        }
        Insert: {
          id?: string
          assignment_id: string
          resource_id: string
          created_at?: string
        }
        Update: {
          id?: string
          assignment_id?: string
          resource_id?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          read_at?: string | null
          created_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          title: string
          description: string
          icon_key: string
          criteria_type: string
          threshold: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          icon_key: string
          criteria_type: string
          threshold: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          icon_key?: string
          criteria_type?: string
          threshold?: number
          created_at?: string
        }
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          earned_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          content: string | null
          link: string | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          content?: string | null
          link?: string | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          content?: string | null
          link?: string | null
          read_at?: string | null
          created_at?: string
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
      user_role: UserRole
      skill_level: SkillLevel
      assignment_status: AssignmentStatus
      file_type: FileType
      lesson_status: LessonStatus
    }
  }
}

// Convenience types for common use
export type User = Database['public']['Tables']['users']['Row']
export type TeacherProfile = Database['public']['Tables']['teacher_profiles']['Row']
export type StudentProfile = Database['public']['Tables']['student_profiles']['Row']
export type Invite = Database['public']['Tables']['invites']['Row']
export type Assignment = Database['public']['Tables']['assignments']['Row']
export type AssignmentStudent = Database['public']['Tables']['assignment_students']['Row']
export type AssignmentFile = Database['public']['Tables']['assignment_files']['Row']
export type Submission = Database['public']['Tables']['submissions']['Row']
export type Feedback = Database['public']['Tables']['feedback']['Row']
export type PracticeLog = Database['public']['Tables']['practice_logs']['Row']
export type Lesson = Database['public']['Tables']['lessons']['Row']
export type Resource = Database['public']['Tables']['resources']['Row']
export type AssignmentResource = Database['public']['Tables']['assignment_resources']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Badge = Database['public']['Tables']['badges']['Row']
export type UserBadge = Database['public']['Tables']['user_badges']['Row']
