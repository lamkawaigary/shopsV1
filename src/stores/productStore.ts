import { create } from 'zustand'
import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, deleteDoc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '@/config/firebase'
import { useAuthStore } from './authStore'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
  stock: number
  merchantId: string
  merchantName: string
  createdAt: Date
  updatedAt: Date
}

interface ProductState {
  products: Product[]
  loading: boolean
  currentProduct: Product | null
  
  // Merchant functions
  createProduct: (product: Omit<Product, 'id' | 'merchantId' | 'merchantName' | 'createdAt' | 'updatedAt'>, image?: File) => Promise<string>
  updateProduct: (id: string, data: Partial<Product>, image?: File) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  loadMerchantProducts: () => Promise<void>
  
  // Customer functions
  loadAllProducts: () => Promise<void>
  loadProductsByCategory: (category: string) => Promise<void>
  searchProducts: (keyword: string) => Promise<Product[]>
  
  // Common
  setCurrentProduct: (product: Product | null) => void
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: false,
  currentProduct: null,

  createProduct: async (productData, image) => {
    const user = useAuthStore.getState().user
    const profile = useAuthStore.getState().profile
    
    if (!user || profile?.role !== 'merchant') throw new Error('Must be logged in as merchant')
    
    const id = crypto.randomUUID()
    let imageUrl = productData.imageUrl
    
    // Upload image if provided
    if (image) {
      const imageRef = ref(storage, `products/${user.uid}/${id}/${image.name}`)
      await uploadBytes(imageRef, image)
      imageUrl = await getDownloadURL(imageRef)
    }
    
    const product: Product = {
      ...productData,
      id,
      imageUrl,
      merchantId: user.uid,
      merchantName: profile.shopName || profile.email || 'Unknown Shop',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    await setDoc(doc(db, 'products', id), product)
    set({ products: [product, ...get().products] })
    return id
  },

  updateProduct: async (id, data, image) => {
    const user = useAuthStore.getState().user
    if (!user) throw new Error('Must be logged in')
    
    let imageUrl = data.imageUrl
    
    if (image) {
      const imageRef = ref(storage, `products/${user.uid}/${id}/${image.name}`)
      await uploadBytes(imageRef, image)
      imageUrl = await getDownloadURL(imageRef)
    }
    
    const { doc, updateDoc } = await import('firebase/firestore')
    await updateDoc(doc(db, 'products', id), {
      ...data,
      imageUrl,
      updatedAt: new Date()
    })
    
    set({
      products: get().products.map(p =>
        p.id === id ? { ...p, ...data, imageUrl } : p
      )
    })
  },

  deleteProduct: async (id) => {
    const { doc, deleteDoc } = await import('firebase/firestore')
    await deleteDoc(doc(db, 'products', id))
    set({ products: get().products.filter(p => p.id !== id) })
  },

  loadMerchantProducts: async () => {
    const user = useAuthStore.getState().user
    const profile = useAuthStore.getState().profile
    
    if (!user || profile?.role !== 'merchant') return
    
    set({ loading: true })
    try {
      const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore')
      const q = query(
        collection(db, 'products'),
        where('merchantId', '==', user.uid),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[]
      set({ products })
    } finally {
      set({ loading: false })
    }
  },

  loadAllProducts: async () => {
    set({ loading: true })
    try {
      const { collection, getDocs, orderBy, limit } = await import('firebase/firestore')
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(50))
      const snapshot = await getDocs(q)
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[]
      set({ products })
    } finally {
      set({ loading: false })
    }
  },

  loadProductsByCategory: async (category) => {
    set({ loading: true })
    try {
      const { collection, getDocs, query, where, orderBy } = await import('firebase/firestore')
      const q = query(
        collection(db, 'products'),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[]
      set({ products })
    } finally {
      set({ loading: false })
    }
  },

  searchProducts: async (keyword) => {
    const { collection, getDocs, query, where, orderBy, limit } = await import('firebase/firestore')
    const q = query(
      collection(db, 'products'),
      where('name', '>=', keyword),
      where('name', '<=', keyword + '\uf8ff'),
      orderBy('name'),
      limit(20)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[]
  },

  setCurrentProduct: (product) => set({ currentProduct: product })
}))
