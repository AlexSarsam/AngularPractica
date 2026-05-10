import { supabase } from '../config/supabase.js'

export const getCategories = async (req, res) => {
  const { data, error } = await supabase.from('categories').select('*').order('name')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}
