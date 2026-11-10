import Image from "next/image";
import Link from "next/link";

/** Header/footer brand lockup: the real Next Gen emblem + wordmark. */
export function Logo({ className = "", href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-3 ${className}`}
      aria-label={href === "/" ? "Next Gen Fight Hub, home" : "Next Gen Fight Hub"}
    >
      <Image
        src="/images/logo.jpg"
        alt=""
        width={96}
        height={96}
        priority
        className="h-11 w-11 object-contain"
      />
      <span aria-hidden="true" className="h-8 w-px bg-paper/20" />
      <span className="font-brand text-lg uppercase leading-none tracking-wide text-paper sm:text-xl">
        Next Gen
        <span className="text-steel-300"> Fight Hub</span>
      </span>
    </Link>
  );
}
