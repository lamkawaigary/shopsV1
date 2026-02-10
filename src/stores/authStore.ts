import { create } from 'zustand'
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/config/firebase'

export type UserRole = 'customer' | 'merchant' | 'delivery' | 'admin'

interface UserProfile {
  email: string
  role: UserRole
  displayName?: string
  phone?: string
  address?: string
  shopName?: string
  shopAddress?: string
  onboardingCompleted?: boolean
  createdAt: Date
  updatedAt: Date
}

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  initialized: boolean
  needsOnboarding: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  register: (email: string, password: string, role: UserRole) => Promise<void>
  signOut: () => Promise<void>
  fetchProfile: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,
  needsOnboarding: false,

  signIn: async (email, password) => {
    const { signInWithEmailAndPassword } = await import('firebase/auth')
    await signInWithEmailAndPassword(auth, email, password)
  },

  signInWithGoogle: async (role?: UserRole) => {
    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth')
    const provider = new GoogleAuthProvider()
    console.log('🔵 Google popup triggered')
    const result = await signInWithPopup(auth, provider)
    console.log('✅ Google auth successful:', { email: result.user.email, uid: result.user.uid })
    
    // If role is provided (from registration flow), update profile with it
    if (role) {
      try {
        console.log('💾 Saving profile with role:', role)
        const { setDoc } = await import('firebase/firestore')
        const userDocRef = doc(db, 'users', result.user.uid)
        
        const profileData: UserProfile = {
          email: result.user.email || '',
          role,
          displayName: result.user.displayName || '',
          onboardingCompleted: true, // When registering with Google and choosing a role, onboarding is complete
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        await setDoc(userDocRef, profileData, { merge: true })
        console.log('✅ Profile saved successfully')
      } catch (error) {
        console.error('❌ Error saving profile:', error)
        throw error
      }
    }
  },

  register: async (email, password, role) => {
    const { createUserWithEmailAndPassword } = await import('firebase/auth')
    const { setDoc } = await import('firebase/firestore')
    
    const result = await createUserWithEmailAndPassword(auth, email, password)
    
    const newProfile: UserProfile = {
      email,
      role,
      displayName: '',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    await setDoc(doc(db, 'users', result.user.uid), newProfile)
  },

  signOut: async () => {
    await firebaseSignOut(auth)
    set({ user: null, profile: null, needsOnboarding: false })
  },

  fetchProfile: async () => {
    const { user } = get()
    if (!user) return
    
    try {
      const docRef = doc(db, 'users', user.uid)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        set({ profile: docSnap.data() as UserProfile })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  },

  updateProfile: async (data) => {
    const { user, profile } = get()
    if (!user || !profile) return
    
    const { doc, updateDoc } = await import('firebase/firestore')
    const updateData = {
      ...data,
      onboardingCompleted: true, // Mark onboarding as complete when updating profile
      updatedAt: new Date()
    }
    await updateDoc(doc(db, 'users', user.uid), updateData)
    const updatedProfile = { ...profile, ...updateData }
    set({ 
      profile: updatedProfile,
      needsOnboarding: false
    })
  }
}))

// Initialize auth listener
export const initAuth = () => {
  console.log('🔐 initAuth called')
  
  onAuthStateChanged(auth, async (user) => {
    console.log('🔑 Firebase onAuthStateChanged triggered:', { hasUser: !!user, uid: user?.uid, email: user?.email })
    
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid)
        const docSnap = await getDoc(docRef)
        
        let profile: UserProfile | null = null
        let needsOnboarding = false
        
        if (docSnap.exists()) {
          profile = docSnap.data() as UserProfile
          console.log('👤 User profile found in Firestore:', { role: profile.role, onboardingCompleted: profile.onboardingCompleted })
          // Check if user needs onboarding (hasn't completed it yet)
          needsOnboarding = !profile.onboardingCompleted
        } else {
          // Create default profile for new users
          console.log('✨ New user detected - creating default profile in Firestore')
          const { setDoc } = await import('firebase/firestore')
          const newProfile: UserProfile = {
            email: user.email || '',
            role: 'customer', // Default role
            displayName: user.displayName || '',
            onboardingCompleted: false,
            createdAt: new Date(),
            updatedAt: new Date()
          }
          try {
            await setDoc(docRef, newProfile)
            console.log('✅ New user profile created successfully')
            profile = newProfile
            needsOnboarding = true // New user always needs onboarding
          } catch (createError) {
            console.error('⚠️ Error creating user profile (likely Firestore rules):', createError)
            // Still set profile locally even if Firestore creation fails
            // User can still proceed and try again
            profile = newProfile
            needsOnboarding = true
          }
        }
        
        console.log('📝 Setting auth state:', { 
          userEmail: user.email, 
          profileRole: profile?.role, 
          needsOnboarding,
          initialized: true,
          loading: false
        })
        
        useAuthStore.setState({ 
          user, 
          profile,
          needsOnboarding,
          loading: false,
          initialized: true
        })
      } catch (error) {
        console.error('❌ Error in initAuth:', error)
        // Still initialize even if profile load fails, but mark that we failed to load profile
        useAuthStore.setState({ 
          user, 
          profile: null,
          needsOnboarding: false,
          loading: false,
          initialized: true
        })
      }
    } else {
      console.log('👻 No user logged in - clearing auth state')
      useAuthStore.setState({ 
        user: null, 
        profile: null,
        needsOnboarding: false,
        loading: false,
        initialized: true
      })
    }
  })
}
