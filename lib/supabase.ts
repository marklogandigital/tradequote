import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mkkxliseigxorfrbklsc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ra3hsaXNlaWd4b3JmcmJrbHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMTkxNzcsImV4cCI6MjA4MjY5NTE3N30.z03w_I0C4tGVLLBUEQcR73cXBya69_BqBoIjarvXieU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

