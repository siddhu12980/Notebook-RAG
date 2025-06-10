import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { signIn, signUp } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import { toast } from 'sonner'

interface SignInFormState {
  email: string
  password: string
}

interface SignUpFormState {
  username: string
  email: string
  password: string
  confirmPassword: string
}

interface AuthResponse {
  token: string
  user: {
    id: string
    email: string
    username: string
  }
}

export function useSignIn() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [formState, setFormState] = useState<SignInFormState>({
    email: '',
    password: ''
  })

  const signInMutation = useMutation({
    mutationFn: signIn,
    onSuccess: (data: AuthResponse) => {
      setAuth(data.token, data.user)
      toast.success('Successfully signed in!')
      navigate('/')
    },
    onError: (error) => {
      toast.error('Invalid email or password')
      console.log("error", error)
    }
  })

  const updateField = (field: keyof SignInFormState, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    signInMutation.mutate({ 
      email: formState.email, 
      password: formState.password 
    })
  }

  return {
    formState,
    updateField,
    handleSubmit,
    signInMutation
  }
}

export function useSignUp() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const [formState, setFormState] = useState<SignUpFormState>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const signUpMutation = useMutation({
    mutationFn: signUp,
    onSuccess: (data: AuthResponse) => {
      setAuth(data.token, data.user)
      toast.success('Account created successfully!')
      navigate('/')
    },
    onError: (error) => {
      toast.error('Failed to create account. Please try again.')
      console.log("error", error)
    }
  })

  const updateField = (field: keyof SignUpFormState, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formState.password !== formState.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    signUpMutation.mutate({ 
      username: formState.username, 
      email: formState.email, 
      password: formState.password 
    })
  }

  return {
    formState,
    updateField,
    handleSubmit,
    signUpMutation
  }
} 