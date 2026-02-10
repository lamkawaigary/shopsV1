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
  signInWithGoogle: (role?: UserRole) => Promise<any>
  register: (email: string, password: string, role: UserRole) => Promise<void>
  signOut: () => Promise<void>
  fetchProfile: () => Promise<void>
  fetchProfileByUid: (uid: string) => Promise<UserProfile | null>
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
    // Return credential so caller can act immediately
    return result
  },

  fetchProfileByUid: async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const profile = docSnap.data() as UserProfile
        console.log('✅ Profile found for uid:', { uid, role: profile.role })
        // cache and set state
        localStorage.setItem('authCache', JSON.stringify({ uid, profile }))
        set({ profile, needsOnboarding: !profile.onboardingCompleted })
        return profile
      }

      // If no profile, create a default one and set state immediately
      const currentUser = auth.currentUser
      const newProfile: UserProfile = {
        email: currentUser?.email || '',
        role: 'customer',
        displayName: currentUser?.displayName || '',
        onboardingCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      console.log('✨ Creating default profile:', { uid, role: newProfile.role })
      set({ profile: newProfile, needsOnboarding: true })
      // create in background
      void createUserProfileAsync(uid, newProfile)
      return newProfile
    } catch (error) {
      console.error('⚠️ Error in fetchProfileByUid:', error)
      // Return a fallback profile to prevent undefined role
      const fallbackProfile: UserProfile = {
        email: '',
        role: 'customer',
        displayName: '',
        onboardingCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      set({ profile: fallbackProfile, needsOnboarding: false })
      return fallbackProfile
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
    try {
      console.log('🔑 Signing out...')
      await firebaseSignOut(auth)
      // Clear all auth state and local storage
      localStorage.removeItem('authCache')
      set({ 
        user: null, 
        profile: null, 
        needsOnboarding: false,
        loading: false,
        initialized: true
      })
      console.log('✅ Signed out successfully')
    } catch (error) {
      console.error('❌ Error signing out:', error)
      // Still clear state even if Firebase signOut fails
      set({ 
        user: null, 
        profile: null, 
        needsOnboarding: false,
        loading: false,
        initialized: true
      })
    }
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
    
    // Update cache
    localStorage.setItem('authCache', JSON.stringify({
      uid: user.uid,
      profile: updatedProfile
    }))
    
    set({ 
      profile: updatedProfile,
      needsOnboarding: false
    })
  }
}))

// Fetch fresh profile in background
async function fetchFreshProfile(uid: string) {
  try {
    const docRef = doc(db, 'users', uid)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const profile = docSnap.data() as UserProfile
      localStorage.setItem('authCache', JSON.stringify({
        uid,
        profile
      }))
      useAuthStore.setState({
        profile,
        needsOnboarding: !profile.onboardingCompleted
      })
    }
  } catch (error) {
    console.error('⚠️ Error fetching fresh profile:', error)
  }
}

// Create user profile asynchronously (non-blocking)
async function createUserProfileAsync(uid: string, profile: UserProfile) {
  try {
    const { setDoc } = await import('firebase/firestore')
    const docRef = doc(db, 'users', uid)
    await setDoc(docRef, profile)
    console.log('✅ User profile created in Firestore')
    localStorage.setItem('authCache', JSON.stringify({
      uid,
      profile
    }))
  } catch (error) {
    console.error('⚠️ Error creating profile:', error)
  }
}

// Initialize auth listener with optimizations
export const initAuth = () => {
  console.log('🔐 initAuth called')
  
  onAuthStateChanged(auth, async (user) => {
    console.log('🔑 Firebase onAuthStateChanged triggered:', { hasUser: !!user, uid: user?.uid, email: user?.email })
    
    if (user) {
      try {
        // Try to load from cache first for speed
        const cached = localStorage.getItem('authCache')
        let cachedData = null
        if (cached) {
          try {
            cachedData = JSON.parse(cached)
            if (cachedData.uid === user.uid) {
              console.log('⚡ Using cached profile - faster login!')
              useAuthStore.setState({
                user,
                profile: cachedData.profile,
                needsOnboarding: !cachedData.profile?.onboardingCompleted,
                loading: false,
                initialized: true
              })
              // Fetch fresh data in background
              setTimeout(() => fetchFreshProfile(user.uid), 100)
              return
            }
          } catch (e) {
            console.log('⚠️ Invalid cache, fetching fresh')
          }
        }
        
        // Load profile from Firestore
        console.log('🔍 Fetching profile from Firestore...')
        const docRef = doc(db, 'users', user.uid)
        const docSnap = await getDoc(docRef)
        
        let profile: UserProfile | null = null
        let needsOnboarding = false
        
        if (docSnap.exists()) {
          profile = docSnap.data() as UserProfile
          console.log('👤 User profile found in Firestore:', { role: profile.role, onboardingCompleted: profile.onboardingCompleted })
          needsOnboarding = !profile.onboardingCompleted
          
          // Cache for next time
          localStorage.setItem('authCache', JSON.stringify({
            uid: user.uid,
            profile: profile
          }))
        } else {
          // Create default profile for new users
          console.log('✨ New user detected - creating default profile')
          const newProfile: UserProfile = {
            email: user.email || '',
            role: 'customer',
            displayName: user.displayName || '',
            onboardingCompleted: false,
            createdAt: new Date(),
            updatedAt: new Date()
          }
          
          profile = newProfile
          needsOnboarding = true
          
          // Set state immediately to unblock UI - don't wait for Firestore
          useAuthStore.setState({ 
            user, 
            profile,
            needsOnboarding,
            loading: false,
            initialized: true
          })
          
          // Create in Firestore asynchronously (non-blocking)
          createUserProfileAsync(user.uid, newProfile)
          return
        }
        
        useAuthStore.setState({ 
          user, 
          profile,
          needsOnboarding,
          loading: false,
          initialized: true
        })
      } catch (error) {
        console.error('❌ Error in initAuth:', error)
        // Still initialize even if profile load fails
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
      localStorage.removeItem('authCache')
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
