"use client";
import { useEffect, useState } from "react";

export default function BarPage() {
  const [menu, setMenu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/menu")
      .then((res) => res.json())
      .then((data) => {
        setMenu(data.menus.Bar || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-10 text-gray-600">Loading Bar Menu...</p>;

  const alcoholic = menu.filter((item) => item.type === "Alcoholic");
  const soft = menu.filter((item) => item.type === "Soft");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff8f3] to-[#f2e6dc] p-8 text-gray-900">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-10 text-[#8b2f00] tracking-wide">
          🍺 12th April Resort Bar Menu
        </h1>

        {/* Alcoholic Drinks */}
        <h2 className="text-2xl font-bold mb-4 text-[#6b1e00]">Alcoholic Drinks</h2>
        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {alcoholic.map((item) => (
            <div key={item.id} className="bg-white border rounded-xl p-5 shadow hover:shadow-lg transition">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <span className="text-[#a14200] font-bold">
                  ₦{Number(item.restaurant || 0).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-600">Lounge: ₦{Number(item.lounge || 0).toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Soft Drinks */}
        <h2 className="text-2xl font-bold mb-4 text-[#2b4a00]">Soft Drinks</h2>
        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
          {soft.map((item) => (
            <div key={item.id} className="bg-white border rounded-xl p-5 shadow hover:shadow-lg transition">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <span className="text-[#437b00] font-bold">
                  ₦{Number(item.restaurant || 0).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-600">Lounge: ₦{Number(item.lounge || 0).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}