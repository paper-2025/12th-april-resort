import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-black border-b border-white/10 text-white select-none cursor-default">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between px-6 py-6 space-y-3 sm:space-y-0">
        {/* Resort Name and Tagline */}
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-serif text-brandAccent tracking-wide uppercase">
            12th April Resort
          </h1>
          <p className="text-sm text-white/70">
            Luxury • Comfort • Calm
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-wrap justify-center sm:justify-end gap-4 text-sm font-medium text-white/80 mt-2 sm:mt-0">
          <Link href="/" className="hover:text-brandAccent transition">Home</Link>
          <Link href="/restaurant" className="hover:text-brandAccent transition">Restaurant</Link>
          <Link href="/bar" className="hover:text-brandAccent transition">Bar</Link>
          <Link href="/pool" className="hover:text-brandAccent transition">Pool</Link>
          <Link href="/lounge" className="hover:text-brandAccent transition">Lounge</Link>
          <Link href="/rooms" className="hover:text-brandAccent transition">Rooms</Link>
        </nav>
      </div>
    </header>
  );
}