"use client";

import { useEffect, useState } from "react";

export default function PoolPage() {
  const [restaurant, setRestaurant] = useState<any[]>([]);
  const [bar, setBar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // Load Restaurant + Bar Menus
  // -----------------------------
  useEffect(() => {
    fetch("/api/menu")
      .then((res) => res.json())
      .then((data) => {
        setRestaurant(data.menus.Restaurant || []);
        setBar(data.menus.Bar || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <p className="text-center text-gray-600 mt-10">
        Loading Pool Menu...
      </p>
    );

  // -----------------------------
  // Swimming Rates (Fixed)
  // -----------------------------
  const swimmingRates = [
    { type: "Per Person", price: 2000, duration: "All Day" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e0f7ff] to-[#b3ecff] text-gray-900 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-8 text-[#004c6d]">
          🏊 12th April Resort Pool & Snack Bar
        </h1>

        {/* ------------------- Swimming Rates ------------------- */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-10">
          <h2 className="text-2xl font-bold text-[#006d8e] mb-4">
            Swimming Rates
          </h2>

          <ul>
            {swimmingRates.map((r) => (
              <li
                key={r.type}
                className="flex justify-between py-3 border-b border-gray-200"
              >
                <span className="font-semibold">{r.type}</span>
                <span className="font-bold">
                  ₦{r.price.toLocaleString()} / {r.duration}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* ------------------- Food Menu ------------------- */}
        <h2 className="text-2xl font-bold mb-3 text-[#004c6d]">
          🍽 Food Menu
        </h2>
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {restaurant.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition"
            >
              <div className="flex justify-between">
                <h3 className="font-medium">{item.name}</h3>
                <span className="text-[#005d7a] font-bold">
                  ₦{Number(item.price || 0).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ------------------- Drinks Menu ------------------- */}
        <h2 className="text-2xl font-bold mb-3 text-[#004c6d]">
          🍹 Drinks Menu
        </h2>
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {bar.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-lg shadow hover:shadow-md transition"
            >
              <div className="flex justify-between">
                <h3 className="font-medium">{item.name}</h3>
                <span className="text-[#005d7a] font-bold">
                  ₦{Number(item.restaurant || 0).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}