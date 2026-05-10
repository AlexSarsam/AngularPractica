export interface User { id: string; email: string; full_name: string; role: 'user' | 'admin'; }

export interface Category { id: string; name: string; slug: string; }

export interface Product { id: string; category_id: string; name: string; slug: string; description: string | null; price: number; stock: number; image_url: string | null; brand: string | null; sizes: string[]; categories?: { name: string; slug: string; }; }

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export interface OrderItem { id: string; quantity: number; unit_price: number; size: string | null; products?: { name: string; image_url: string | null; brand: string | null; }; }
export interface Order { id: string; user_id: string; status: OrderStatus; total_amount: number; shipping_address: string | null; notes: string | null; created_at: string; order_items?: OrderItem[]; }
export interface CreateOrderPayload { items: { product_id: string; quantity: number; size: string | null; }[]; shipping_address: string; notes?: string; }

export interface CartItem { product: Product; quantity: number; size: string | null; }
