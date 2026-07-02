'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { ApiClientError } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      setApiError(null)
      await login(data)
      router.push('/dashboard')
    } catch (err) {
      if (err instanceof ApiClientError) {
        setApiError(err.message)
      } else {
        setApiError('Error al iniciar sesión. Intentá de nuevo.')
      }
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(110%_70%_at_50%_-10%,rgba(99,102,241,0.16),transparent_55%)] p-6">
      <div className="w-full max-w-[372px] rounded-[20px] border border-border bg-surface p-7 shadow-panel sm:p-[30px]">
        <div className="mb-6 flex flex-col items-center gap-3.5 text-center">
          <Image
            src="/logo-mark.svg"
            alt="Impulso Ecommerce Admin"
            width={54}
            height={54}
            priority
            className="rounded-[14px] shadow-brand"
          />
          <div>
            <h1 className="text-[26px] font-bold tracking-[-0.02em] text-[#EDEDF0]">Impulso Ecommerce Admin</h1>
            <p className="mt-1.5 text-sm text-[#8A8A96]">Iniciá sesión para continuar</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Contraseña"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          {apiError && (
            <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-sm text-error">
              {apiError}
            </p>
          )}

          <Button type="submit" isLoading={isSubmitting} className="mt-1">
            Iniciar sesión
          </Button>
        </form>
        <p className="mt-6 text-center text-xs text-[#6B6B76]">Red Impulso · Panel del fabricante</p>
      </div>
    </main>
  )
}
