"use client";
import { useState, useEffect } from "react";

export default function LoungePage() {
  const [menu, setMenu] = useState<any[]>([]);
  const [bar, setBar] = useState<any[]>([]);
  const [view, setView] = useState<"food" | "drinks">("food");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/menu")
      .then((res) => res.json())
      .then((data) => {
        setMenu(data.menus.Lounge || []);
        setBar(data.menus.Bar || []);
        setLoading(false);
      });
  }, []);

  if (loading)
    return <p className="text-center text-gray-600 mt-10">Loading Lounge Menu...</p>;

  const current = view === "food" ? menu : bar;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f6f9ff] to-[#e5ebf9] py-10 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold text-[#002b6b] mb-6 tracking-wide">
          12th April Resort Lounge
        </h1>

        <div
          className="inline-block mb-10 px-6 py-3 bg-[#004aad] text-white font-semibold rounded-lg cursor-pointer hover:bg-[#003b8a] transition-all duration-500 animate-bounce"
          onClick={() => setView(view === "food" ? "drinks" : "food")}
        >
          🍹 Flip to {view === "food" ? "Drinks Menu" : "Food Menu"}
        </div>

        <div
          className={`grid sm:grid-cols-1 md:grid-cols-2 gap-6 transform transition-transform duration-700 ${
            view === "drinks" ? "rotate-y-180" : ""
          }`}
        >
          {current.map((item) => (
            <div
              key={item.id}
              className="rounded-xl bg-white shadow-lg p-5 border border-gray-200 hover:shadow-2xl transition-all duration-200"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-[#001b44]">
                  {item.name}
                </h2>
                <span className="text-[#004aad] font-bold text-lg">
                  ₦{Number(
                   view === "drinks"
                     ? item.lounge || item.price ||  0
                     : item.price || 0).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}