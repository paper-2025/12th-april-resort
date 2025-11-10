import CardLink from "@/components/CardLink";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-3xl sm:text-4xl font-semibold text-white leading-tight">
          Welcome to{" "}
          <span className="text-brandAccent font-serif">
            12th April Resort
          </span>
        </h1>
        <p className="text-white/70 text-base leading-relaxed mt-4 max-w-prose">
          Explore dining, drinks, and experiences throughout the resort.
          View live menus, place requests with staff, and discover what’s
          available right now — all from your phone.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <CardLink
          href="/restaurant"
          title="The Restaurant"
          desc="Breakfast • Lunch • Dinner • Chef Specials"
        />
        <CardLink
          href="/bar"
          title="The Bar"
          desc="Signature cocktails • Wine • Spirits • Light bites"
        />
        <CardLink
          href="/pool"
          title="Poolside"
          desc="Smoothies • Iced cocktails • Snacks by the water"
        />
        <CardLink
          href="/lounge"
          title="The Lounge"
          desc="Late-night bites • Champagne • Shisha • Desserts"
        />
      </section>

      <section className="text-center py-10 bg-brandBg text-white select-none cursor-default">
  <h2 className="text-2xl font-semibold mb-4">Need anything?</h2>
  <a
    href="/contact"
    className="inline-block bg-brandAccent text-black font-medium px-6 py-3 rounded-md cursor-pointer hover:bg-yellow-500 transition"
  >
    Contact Support
  </a>
</section>
    </div>
  );
}