import Link from "next/link";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`text-[1.0625rem] font-medium tracking-[-0.03em] ${className}`}
    >
      Adaptive TTS
    </Link>
  );
}
