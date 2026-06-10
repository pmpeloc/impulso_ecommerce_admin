interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({
  isLoading = false,
  variant = 'primary',
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const base = 'w-full rounded-lg px-4 py-3 text-sm font-semibold transition duration-150 ease-out hover:-translate-y-px active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-[#0A0A0B] disabled:pointer-events-none disabled:opacity-50'
  const variants = {
    primary: 'bg-brand text-white shadow-brand hover:bg-[#5457EE]',
    secondary: 'border border-border-strong bg-surface-input text-[#EDEDF0] hover:border-[#3A3A42] hover:bg-surface-raised',
    ghost: 'bg-transparent text-[#A1A1AC] hover:bg-surface-raised hover:text-[#EDEDF0]',
  }

  return (
    <button
      disabled={disabled || isLoading}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? 'Cargando...' : children}
    </button>
  )
}
