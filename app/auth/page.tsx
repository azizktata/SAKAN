'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

const loginSchema = z.object({
  email:    z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

const registerSchema = z.object({
  name:                  z.string().min(2, 'Nom requis'),
  email:                 z.string().email('Email invalide'),
  password:              z.string().min(8, '8 caractères minimum'),
  password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['password_confirmation'],
})

type LoginForm    = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs mt-1 text-red-600">{message}</p>
}

function AuthForm() {
  const [mode, setMode]   = useState<'login' | 'register'>('login')
  const [error, setError] = useState<string | null>(null)
  const { setUser }       = useAuth()
  const router            = useRouter()
  const searchParams      = useSearchParams()
  const redirect          = searchParams.get('redirect') ?? '/espace-client'

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })
  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  function afterAuth(user: import('@/lib/api').User) {
    setUser(user)
    // Set a same-domain marker cookie so the middleware can see it on Netlify
    // (the real sakan_token is httpOnly on the backend domain and not visible here)
    document.cookie = 'sakan_token=1; path=/; max-age=86400; SameSite=Lax'
    window.location.href = redirect
  }

  async function onLogin(data: LoginForm) {
    setError(null)
    try {
      const res = await authApi.login(data)
      afterAuth(res.data.user)
    } catch {
      setError('Identifiants invalides. Vérifiez votre email et mot de passe.')
    }
  }

  async function onRegister(data: RegisterForm) {
    setError(null)
    try {
      const res = await authApi.register(data)
      afterAuth(res.data.user)
    } catch {
      setError("Erreur lors de la création du compte. Cet email est peut-être déjà utilisé.")
    }
  }

  const inputBase = "w-full rounded-xl border px-3.5 py-3 text-sm outline-none transition-colors"
  const inputStyle = { borderColor: 'var(--color-border)', color: 'var(--color-text)', background: 'transparent' }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-bg)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="font-display font-semibold text-2xl tracking-tight" style={{ color: 'var(--color-text)' }}>
            SAKAN
          </a>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
            {mode === 'login' ? 'Connectez-vous à votre espace' : 'Créez votre compte SAKAN'}
          </p>
        </div>

        <div className="rounded-3xl p-8 shadow-sm"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          {/* Google */}
          <button
            onClick={() => authApi.googleRedirect()}
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl border text-sm font-semibold transition-colors hover:bg-gray-50 mb-6"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          >
            <GoogleIcon />
            Continuer avec Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>ou</span>
            <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
          </div>

          {error && <p className="text-xs text-red-600 mb-4 px-1">{error}</p>}

          {mode === 'login' ? (
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Email</label>
                <input {...loginForm.register('email')} type="email" placeholder="vous@email.com" className={inputBase} style={inputStyle} />
                <FieldError message={loginForm.formState.errors.email?.message} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Mot de passe</label>
                <input {...loginForm.register('password')} type="password" placeholder="••••••••" className={inputBase} style={inputStyle} />
                <FieldError message={loginForm.formState.errors.password?.message} />
              </div>
              <button type="submit" disabled={loginForm.formState.isSubmitting}
                className="w-full py-3 rounded-2xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: 'var(--color-primary)' }}>
                {loginForm.formState.isSubmitting ? 'Connexion…' : 'Se connecter'}
              </button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Nom complet</label>
                <input {...registerForm.register('name')} type="text" placeholder="Votre nom" className={inputBase} style={inputStyle} />
                <FieldError message={registerForm.formState.errors.name?.message} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Email</label>
                <input {...registerForm.register('email')} type="email" placeholder="vous@email.com" className={inputBase} style={inputStyle} />
                <FieldError message={registerForm.formState.errors.email?.message} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Mot de passe</label>
                <input {...registerForm.register('password')} type="password" placeholder="8 caractères minimum" className={inputBase} style={inputStyle} />
                <FieldError message={registerForm.formState.errors.password?.message} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>Confirmer le mot de passe</label>
                <input {...registerForm.register('password_confirmation')} type="password" placeholder="••••••••" className={inputBase} style={inputStyle} />
                <FieldError message={registerForm.formState.errors.password_confirmation?.message} />
              </div>
              <button type="submit" disabled={registerForm.formState.isSubmitting}
                className="w-full py-3 rounded-2xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: 'var(--color-primary)' }}>
                {registerForm.formState.isSubmitting ? 'Création…' : 'Créer mon compte'}
              </button>
            </form>
          )}

          <p className="text-center text-xs mt-6" style={{ color: 'var(--color-muted)' }}>
            {mode === 'login' ? (
              <>Pas encore de compte ?{' '}
                <button onClick={() => { setMode('register'); setError(null) }}
                  className="font-medium" style={{ color: 'var(--color-primary)' }}>
                  S'inscrire
                </button>
              </>
            ) : (
              <>Déjà un compte ?{' '}
                <button onClick={() => { setMode('login'); setError(null) }}
                  className="font-medium" style={{ color: 'var(--color-primary)' }}>
                  Se connecter
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  )
}
