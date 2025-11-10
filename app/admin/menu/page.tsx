"use client";
import { useEffect, useState } from "react";

export default function AdminMenuPage() {
  const [menus, setMenus] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/menu")
      .then((res) => res.json())
      .then((data) => setMenus(data.menus || {}));
  }, []);

  const updatePrice = (section: string, id: string, price: number) => {
    setMenus((prev: any) => ({
      ...prev,
      [section]: prev[section].map((item: any) =>
        item.id === id ? { ...item, price } : item
      ),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    const formatted: any = {};
    for (const section in menus) {
      formatted[section] = {};
      menus[section].forEach((item: any) => (formatted[section][item.id] = item.price));
    }

    const res = await fetch("/api/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formatted),
    });
    const data = await res.json();
    setMsg(data.message);
    setSaving(false);
  };

  if (!menus || Object.keys(menus).length === 0)
    return <p className="p-6 text-center text-gray-700">Loading menus…</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Update Menu Prices</h1>

      {Object.keys(menus).map((section) => (
        <div key={section} className="mb-6">
          <h2 className="text-lg font-semibold mb-2">{section}</h2>
          <div className="space-y-2">
            {menus[section].map((item: any) => (
              <div key={item.id} className="flex justify-between border p-2 rounded bg-white shadow-sm">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                <input
                  type="number"
                  value={item.price || 0}
                  onChange={(e) => updatePrice(section, item.id, parseFloat(e.target.value))}
                  className="border rounded p-1 w-20 text-right text-black"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {saving ? "Saving..." : "Save Prices"}
      </button>

      {msg && <p className="mt-3 text-green-600">{msg}</p>}
    </div>
  );
}