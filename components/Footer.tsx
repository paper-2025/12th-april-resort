export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-16">
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-xs text-white/50 leading-relaxed">
        <div className="text-brandAccent font-semibold tracking-widest uppercase mb-2">
          12th April Resort
        </div>
        <div>Your comfort is our standard.</div>
        <div className="mt-4 text-white/30">
          © {new Date().getFullYear()} 12th April Resort. All rights reserved.
        </div>
      </div>
    </footer>
  );
}