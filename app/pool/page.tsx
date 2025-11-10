"use client";
import { useEffect, useState } from "react";

export default function PoolPage() {
  const [menu, setMenu] = useState<any[]>([]);
  const [drinks, setDrinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/menu")
      .then((res) => res.json())
      .then((data) => {
        setMenu(data.menus.Restaurant || []);
        setDrinks(data.menus.Bar || []);
        setLoading(false);
      });
  }, []);

  if (loading)
    return <p className="text-center text-gray-600 mt-10">Loading Pool Menu...</p>;

  const swimmingRates = [
    { type: "Adult", price: 3000, duration: "2 hours" },
    { type: "Children (under 10)", price: 2000, duration: "2 hours" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e0f7ff] to-[#b3ecff] text-gray-900 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-8 text-[#004c6d]">
          🏊 12th April Resort Pool & Snack Bar
        </h1>

        <div className="bg-white rounded-2xl p-6 shadow-lg mb-10">
          <h2 className="text-2xl font-bold text-[#006d8e] mb-4">Swimming Rates</h2>
          <ul>
            {swimmingRates.map((r) => (
              <li key={r.type} className="flex justify-between py-2 border-b border-gray-100">
                <span className="font-semibold">{r.type}</span>
                <span>₦{r.price.toLocaleString()} / {r.duration}</span>
              </li>
            ))}
          </ul>
        </div>

        <h2 className="text-2xl font-bold mb-3 text-[#004c6d]">🍽 Food Menu</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {menu.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md">
              <div className="flex justify-between">
                <h3>{item.name}</h3>
                <span className="font-bold text-[#005d7a]">₦{Number(item.price || 0).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-3 text-[#004c6d]">🍹 Drinks Menu</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {drinks.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md">
              <div className="flex justify-between">
                <h3>{item.name}</h3>
                <span className="font-bold text-[#005d7a]">₦{Number(item.restaurant || 0).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}