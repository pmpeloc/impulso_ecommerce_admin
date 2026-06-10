import { forwardRef, useId } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const id = useId()

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-[13px] font-medium text-[#A1A1AC]">
          {label}
        </label>
        <input
          id={id}
          ref={ref}
          aria-invalid={error ? true : undefined}
          className={`w-full rounded-lg border bg-surface-input px-3.5 py-2.5 text-[15px] text-[#EDEDF0] caret-brand outline-none transition duration-150 placeholder:text-[#6B6B76] focus:ring-2 ${
            error ? 'border-error focus:border-error focus:ring-red-500/20' : 'border-border-strong focus:border-brand focus:ring-indigo-500/20'
          } ${className}`}
          {...props}
        />
        {error && (
          <p role="alert" className="text-xs text-error">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
