"use client";
import { useEffect, useState } from "react";

export default function RestaurantPage() {
  const [menu, setMenu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/menu")
      .then((res) => res.json())
      .then((data) => {
        setMenu(data.menus.Restaurant || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading menu:", err);
        setLoading(false);
      });
  }, []);

  if (loading)
    return <p className="p-8 text-center text-lg text-gray-600">Loading menu...</p>;

  // Grouping items by keywords
  const categories: Record<string, string[]> = {
    Breakfasts: ["Bread", "Oat", "Noodles", "Egg", "Coffee", "Tea"],
    "Rice Dishes": ["Rice", "Jollof", "Fried", "Spaghetti"],
    "Swallows & Soups": ["Garri", "Semo", "Pounded", "Soup", "Egusi", "Yam", "Portage"],
    "Pepper Meals": ["Pepper", "Gizzard", "Meat", "Fish", "Assorted", "Isi Ewu", "Cowtail"],
    "Salads & Light Meals": ["Salad", "Vegetable"],
  };

  const grouped: Record<string, any[]> = {};
  menu.forEach((item) => {
    let found = false;
    for (const [cat, keywords] of Object.entries(categories)) {
      if (keywords.some((word) => item.name.toLowerCase().includes(word.toLowerCase()))) {
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
        found = true;
        break;
      }
    }
    if (!found) {
      if (!grouped["Others"]) grouped["Others"] = [];
      grouped["Others"].push(item);
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f9fafc] to-[#eaeaea] p-6 text-gray-900">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-10 text-[#0e254a] tracking-wide">
          🍽️ 12th April Resort Restaurant Menu
        </h1>

        {Object.entries(grouped).map(([category, items]) => (
          <section key={category} className="mb-10">
            <h2 className="text-2xl font-semibold mb-4 text-[#12305b] border-b-2 border-[#d1d5db] pb-1">
              {category}
            </h2>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl bg-white/90 backdrop-blur border border-gray-200 shadow-[0_6px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all duration-200 p-5"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg sm:text-xl font-semibold text-[#111827]">
                      {item.name}
                    </h3>
                    <span className="text-[#0a6847] font-bold text-lg">
                      ₦{item.price.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}