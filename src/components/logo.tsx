import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/fcs-logo.png.asset.json";

type Props = {
  className?: string;
  imgClassName?: string;
  href?: string | null;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
};

const SIZE: Record<NonNullable<Props["size"]>, string> = {
  sm: "h-8",
  md: "h-10",
  lg: "h-14",
};

export function Logo({ className = "", imgClassName = "", href = "/", showWordmark = false, size = "md" }: Props) {
  const inner = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src={logoAsset.url}
        alt="Favour Computer Services"
        className={`${SIZE[size]} w-auto shrink-0 object-contain ${imgClassName}`}
        width={512}
        height={512}
      />
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="text-sm font-bold tracking-tight">Favour Computer</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Services · Nairobi</span>
        </span>
      )}
    </span>
  );
  if (!href) return inner;
  return <Link to={href}>{inner}</Link>;
}

export const LOGO_URL = logoAsset.url;