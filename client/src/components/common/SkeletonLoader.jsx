export default function SkeletonLoader({ className = '', count = 1 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} className={`animate-pulse bg-surface-3 rounded-2xl ${className}`} />
  ));
}
