import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { doc, setDoc, getDoc, deleteDoc, collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuthStore } from './authStore'

export interface MaterialItem {
  id: string
  name: string
  length: number // cm
  width: number // cm
  height: number // cm
  quantity: number
  pricePerUnit: number // price per piece
  unit: string // pieces, sqm, cum
}

export interface ProjectMaterial {
  id: string
  name: string
  description: string
  materials: MaterialItem[]
  createdAt: Date
  updatedAt: Date
}

interface ProjectState {
  projects: ProjectMaterial[]
  loading: boolean
  currentProject: ProjectMaterial | null
  
  // Material calculations
  calculateMaterial: (material: MaterialItem) => {
    volume: number
    area: number
    totalPrice: number
  }
  
  // CRUD operations
  createProject: (name: string, description: string) => Promise<string>
  updateProject: (id: string, data: Partial<ProjectMaterial>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  loadProjects: () => Promise<void>
  setCurrentProject: (project: ProjectMaterial | null) => void
  addMaterial: (projectId: string, material: Omit<MaterialItem, 'id'>) => Promise<void>
  removeMaterial: (projectId: string, materialId: string) => Promise<void>
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  loading: false,
  currentProject: null,

  calculateMaterial: (material) => {
    const volume = (material.length * material.width * material.height) / 1000000 // cum
    const area = (material.length * material.width) / 10000 // sqm
    const totalPrice = material.pricePerUnit * material.quantity
    
    return { volume, area, totalPrice }
  },

  createProject: async (name, description) => {
    const user = useAuthStore.getState().user
    if (!user) throw new Error('Must be logged in')
    
    const id = crypto.randomUUID()
    const project: ProjectMaterial = {
      id,
      name,
      description,
      materials: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    await setDoc(doc(db, 'users', user.uid, 'projects', id), project)
    set({ projects: [...get().projects, project] })
    return id
  },

  updateProject: async (id, data) => {
    const user = useAuthStore.getState().user
    if (!user) throw new Error('Must be logged in')
    
    const { doc, updateDoc } = await import('firebase/firestore')
    await updateDoc(doc(db, 'users', user.uid, 'projects', id), {
      ...data,
      updatedAt: new Date()
    })
    
    set({
      projects: get().projects.map(p => p.id === id ? { ...p, ...data } : p)
    })
  },

  deleteProject: async (id) => {
    const user = useAuthStore.getState().user
    if (!user) throw new Error('Must be logged in')
    
    const { doc, deleteDoc } = await import('firebase/firestore')
    await deleteDoc(doc(db, 'users', user.uid, 'projects', id))
    set({ projects: get().projects.filter(p => p.id !== id) })
  },

  loadProjects: async () => {
    const user = useAuthStore.getState().user
    if (!user) return
    
    set({ loading: true })
    
    try {
      const { collection, getDocs, query, orderBy } = await import('firebase/firestore')
      const q = query(
        collection(db, 'users', user.uid, 'projects'),
        orderBy('updatedAt', 'desc')
      )
      const snapshot = await getDocs(q)
      const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ProjectMaterial[]
      set({ projects })
    } finally {
      set({ loading: false })
    }
  },

  setCurrentProject: (project) => set({ currentProject: project }),

  addMaterial: async (projectId, material) => {
    const user = useAuthStore.getState().user
    if (!user) throw new Error('Must be logged in')
    
    const { doc, setDoc } = await import('firebase/firestore')
    const materialId = crypto.randomUUID()
    await setDoc(doc(db, 'users', user.uid, 'projects', projectId, 'materials', materialId), {
      ...material,
      id: materialId
    })
    
    // Update local state
    const project = get().projects.find(p => p.id === projectId)
    if (project) {
      const updated = {
        ...project,
        materials: [...project.materials, { ...material, id: materialId }],
        updatedAt: new Date()
      }
      set({
        projects: get().projects.map(p => p.id === projectId ? updated : p)
      })
    }
  },

  removeMaterial: async (projectId, materialId) => {
    const user = useAuthStore.getState().user
    if (!user) throw new Error('Must be logged in')
    
    const { doc, deleteDoc } = await import('firebase/firestore')
    await deleteDoc(doc(db, 'users', user.uid, 'projects', projectId, 'materials', materialId))
    
    // Update local state
    const project = get().projects.find(p => p.id === projectId)
    if (project) {
      const updated = {
        ...project,
        materials: project.materials.filter(m => m.id !== materialId),
        updatedAt: new Date()
      }
      set({
        projects: get().projects.map(p => p.id === projectId ? updated : p)
      })
    }
  }
}))
