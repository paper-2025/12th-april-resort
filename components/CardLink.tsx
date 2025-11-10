import Link from "next/link";

type Props = {
  href: string;
  title: string;
  desc: string;
};

export default function CardLink({ href, title, desc }: Props) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-white/10 bg-white/5 p-5 hover:border-brandAccent hover:bg-white/10 transition"
    >
      <div className="text-brandAccent font-semibold tracking-wide uppercase text-xs mb-1">
        {title}
      </div>
      <div className="text-white text-base font-medium leading-tight">
        {desc}
      </div>
      <div className="text-white/40 text-xs mt-2">
        Tap to view full menu →
      </div>
    </Link>
  );
}