import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
  merchantId: string
  merchantName: string
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { items } = get()
        const existingIndex = items.findIndex(i => i.productId === item.productId)
        
        if (existingIndex >= 0) {
          const newItems = [...items]
          newItems[existingIndex].quantity += item.quantity
          set({ items: newItems })
        } else {
          set({ items: [...items, { ...item, id: crypto.randomUUID() }] })
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter(i => i.productId !== productId) })
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set({
          items: get().items.map(i =>
            i.productId === productId ? { ...i, quantity } : i
          )
        })
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      }
    }),
    {
      name: 'shops-cart'
    }
  )
)
