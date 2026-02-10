import { create } from 'zustand'
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, updateDoc, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuthStore } from './authStore'
import { useCartStore } from './cartStore'

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled'

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  merchantId: string
  merchantName: string
}

export interface Order {
  id: string
  customerId: string
  customerEmail: string
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  deliveryAddress: string
  deliveryPhone: string
  notes?: string
  createdAt: Date
  updatedAt: Date
  assignedDeliveryId?: string
  assignedDeliveryName?: string
}

interface OrderState {
  orders: Order[]
  loading: boolean
  currentOrder: Order | null
  
  // Customer functions
  createOrder: (address: string, phone: string, notes?: string) => Promise<string>
  cancelOrder: (orderId: string) => Promise<void>
  loadCustomerOrders: () => Promise<void>
  
  // Merchant functions
  loadMerchantOrders: () => Promise<void>
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>
  
  // Delivery functions
  loadDeliveryOrders: () => Promise<void>
  acceptOrder: (orderId: string) => Promise<void>
  completeDelivery: (orderId: string) => Promise<void>
  
  // Common
  loadOrderDetails: (orderId: string) => Promise<Order | null>
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  loading: false,
  currentOrder: null,

  createOrder: async (address, phone, notes) => {
    const user = useAuthStore.getState().user
    const { items, clearCart, getTotal } = useCartStore.getState()
    
    if (!user) throw new Error('Must be logged in')
    if (items.length === 0) throw new Error('Cart is empty')
    
    const orderId = crypto.randomUUID()
    const order: Order = {
      id: orderId,
      customerId: user.uid,
      customerEmail: user.email || '',
      items: items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        merchantId: item.merchantId,
        merchantName: item.merchantName
      })),
      totalAmount: getTotal(),
      status: 'pending',
      deliveryAddress: address,
      deliveryPhone: phone,
      notes,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    await setDoc(doc(db, 'orders', orderId), order)
    clearCart()
    set({ orders: [order, ...get().orders] })
    return orderId
  },

  cancelOrder: async (orderId) => {
    const { doc, updateDoc } = await import('firebase/firestore')
    await updateDoc(doc(db, 'orders', orderId), {
      status: 'cancelled',
      updatedAt: new Date()
    })
    
    set({
      orders: get().orders.map(o =>
        o.id === orderId ? { ...o, status: 'cancelled' } : o
      )
    })
  },

  loadCustomerOrders: async () => {
    const user = useAuthStore.getState().user
    if (!user) return
    
    set({ loading: true })
    try {
      const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore')
      const q = query(
        collection(db, 'orders'),
        where('customerId', '==', user.uid),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[]
      set({ orders })
    } finally {
      set({ loading: false })
    }
  },

  loadMerchantOrders: async () => {
    const user = useAuthStore.getState().user
    const profile = useAuthStore.getState().profile
    
    if (!user || profile?.role !== 'merchant') return
    
    set({ loading: true })
    try {
      const { collection, getDocs, query, orderBy } = await import('firebase/firestore')
      // TODO: Fix arrayContains query for merchant orders
      const q = query(
        collection(db, 'orders'),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[]
      set({ orders })
    } finally {
      set({ loading: false })
    }
  },

  updateOrderStatus: async (orderId, status) => {
    const { doc, updateDoc } = await import('firebase/firestore')
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      updatedAt: new Date()
    })
    
    set({
      orders: get().orders.map(o =>
        o.id === orderId ? { ...o, status } : o
      )
    })
  },

  loadDeliveryOrders: async () => {
    const user = useAuthStore.getState().user
    const profile = useAuthStore.getState().profile
    
    if (!user || profile?.role !== 'delivery') return
    
    set({ loading: true })
    try {
      const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore')
      
      // Load available orders and my assigned orders
      const availableQuery = query(
        collection(db, 'orders'),
        where('status', 'in', ['pending', 'ready']),
        orderBy('createdAt', 'desc')
      )
      const availableSnapshot = await getDocs(availableQuery)
      const availableOrders = availableSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[]
      
      const myQuery = query(
        collection(db, 'orders'),
        where('assignedDeliveryId', '==', user.uid),
        orderBy('createdAt', 'desc')
      )
      const mySnapshot = await getDocs(myQuery)
      const myOrders = mySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[]
      
      set({ orders: [...availableOrders, ...myOrders] })
    } finally {
      set({ loading: false })
    }
  },

  acceptOrder: async (orderId) => {
    const user = useAuthStore.getState().user
    if (!user) throw new Error('Must be logged in')
    
    const { doc, updateDoc } = await import('firebase/firestore')
    await updateDoc(doc(db, 'orders', orderId), {
      status: 'delivering',
      assignedDeliveryId: user.uid,
      updatedAt: new Date()
    })
    
    set({
      orders: get().orders.map(o =>
        o.id === orderId ? { ...o, status: 'delivering', assignedDeliveryId: user.uid } : o
      )
    })
  },

  completeDelivery: async (orderId) => {
    const { doc, updateDoc } = await import('firebase/firestore')
    await updateDoc(doc(db, 'orders', orderId), {
      status: 'delivered',
      updatedAt: new Date()
    })
    
    set({
      orders: get().orders.map(o =>
        o.id === orderId ? { ...o, status: 'delivered' } : o
      )
    })
  },

  loadOrderDetails: async (orderId) => {
    const { doc, getDoc } = await import('firebase/firestore')
    const snapshot = await getDoc(doc(db, 'orders', orderId))
    
    if (snapshot.exists()) {
      const order = { id: snapshot.id, ...snapshot.data() } as Order
      set({ currentOrder: order })
      return order
    }
    return null
  }
}))
