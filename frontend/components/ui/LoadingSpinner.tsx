export default function LoadingSpinner({ size = 20 }: { size?: number }) {
  return (
    <div
      className="border-2 border-slate-700 border-t-sky-400 rounded-full animate-spin"
      style={{ width: size, height: size }}
    />
  )
}
