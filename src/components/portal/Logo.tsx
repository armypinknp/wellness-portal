import mark from "@/assets/logo-mark.png";
import word from "@/assets/logo-wordmark.png";

// Logo artwork taken from the supplied design file.
export function LogoMark({ className = "h-9 w-9" }: { className?: string; mono?: boolean }) {
  return <img src={mark} alt="" aria-hidden="true" className={`${className} object-contain`} />;
}

export function Wordmark({ className = "h-12" }: { className?: string }) {
  return <img src={word} alt="Wellness Portal" className={`${className} w-auto object-contain`} />;
}

export function Logo() {
  return <LogoMark className="h-10 w-12" />;
}
