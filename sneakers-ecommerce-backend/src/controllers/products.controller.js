import { supabase }           from '../config/supabase.js'
import { uploadToCloudinary } from '../middleware/upload.middleware.js'

export const getProducts = async (req, res) => {
  const { category, search, page = 1, limit = 12 } = req.query
  const offset = (page - 1) * limit

  let categoryId = null
  if (category) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', category).single()
    if (!cat) return res.json({ data: [], total: 0, page: Number(page), limit: Number(limit) })
    categoryId = cat.id
  }

  let query = supabase
    .from('products')
    .select('*, categories(name, slug)', { count: 'exact' })
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + Number(limit) - 1)

  if (categoryId) query = query.eq('category_id', categoryId)
  if (search)     query = query.ilike('name', `%${search}%`)

  const { data, error, count } = await query
  if (error) return res.status(500).json({ error: error.message })
  res.json({ data, total: count, page: Number(page), limit: Number(limit) })
}

export const getProductBySlug = async (req, res) => {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('slug', req.params.slug)
    .eq('is_active', true)
    .single()

  if (error) return res.status(404).json({ error: 'Producto no encontrado' })
  res.json(data)
}

export const createProduct = async (req, res) => {
  const body = { ...req.body }
  const image_url = req.file ? (await uploadToCloudinary(req.file.buffer)).secure_url : null
  const sizes = body.sizes && typeof body.sizes === 'string' ? JSON.parse(body.sizes) : []

  const { data, error } = await supabase.rpc('insert_product', {
    p_name:        body.name,
    p_price:       Number(body.price),
    p_category_id: body.category_id,
    p_description: body.description || null,
    p_stock:       Number(body.stock) || 0,
    p_brand:       body.brand        || null,
    p_sizes:       sizes,
    p_image_url:   image_url
  })

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
}

export const updateProduct = async (req, res) => {
  const body = { ...req.body }
  const image_url = req.file ? (await uploadToCloudinary(req.file.buffer)).secure_url : null
  const sizes = body.sizes && typeof body.sizes === 'string' ? JSON.parse(body.sizes) : undefined

  const { data, error } = await supabase.rpc('update_product', {
    p_id:          req.params.id,
    p_name:        body.name        || null,
    p_description: body.description || null,
    p_price:       body.price       ? Number(body.price) : null,
    p_stock:       body.stock       ? Number(body.stock) : null,
    p_brand:       body.brand       || null,
    p_category_id: body.category_id || null,
    p_sizes:       sizes            || null,
    p_image_url:   image_url        || null,
    p_is_active:   body.is_active !== undefined ? body.is_active === 'true' : null
  })

  if (error) return res.status(500).json({ error: error.message })
  if (!data)  return res.status(404).json({ error: 'Producto no encontrado' })
  res.json(data)
}

export const deleteProduct = async (req, res) => {
  const { id } = req.params
  const { data: existing, error: findError } = await supabase.from('products').select('id, name').eq('id', id).single()

  if (findError || !existing) return res.status(404).json({ error: 'Producto no encontrado' })

  const { error } = await supabase.rpc('soft_delete_product', { product_id: id })
  if (error) return res.status(500).json({ error: error.message })
  res.json({ message: `Producto "${existing.name}" desactivado correctamente` })
}
