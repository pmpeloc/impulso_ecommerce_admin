interface PriceLockBadgeProps {
  locked: boolean
  onUnlock?: () => void
}

export function PriceLockBadge({ locked, onUnlock }: PriceLockBadgeProps) {
  if (!locked) return null

  return (
    <button
      type="button"
      onClick={() => onUnlock?.()}
      aria-label="Destrabar precio"
      className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-warning transition duration-150 hover:border-amber-500/50 hover:bg-amber-500/20"
    >
      <span aria-hidden="true">🔒</span>
      Manual
    </button>
  )
}
