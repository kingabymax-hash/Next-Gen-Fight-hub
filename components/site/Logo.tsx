import Image from "next/image";
import Link from "next/link";

/** Header/footer brand lockup: the real Next Gen emblem + wordmark. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-3 ${className}`}
      aria-label="Next Gen Fight Hub, home"
    >
      <Image
        src="/images/logo.jpg"
        alt=""
        width={96}
        height={96}
        priority
        className="h-11 w-11 object-contain"
      />
      <span className="font-display text-lg uppercase leading-none tracking-tight text-paper">
        Next Gen
        <span className="text-steel-300"> Fight Hub</span>
      </span>
    </Link>
  );
}
