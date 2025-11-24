"use client";
import { useState } from "react";

export default function AdminLogin() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e: any) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });

    const data = await res.json();
    if (data.success) {
      window.location.href = "/admin"; // redirect to admin dashboard
    } else {
      setError(data.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f2e6dc]">
      <form onSubmit={handleLogin} className="bg-white shadow p-6 rounded-lg w-80">
        <h1 className="text-xl font-bold text-center mb-4">Admin Login</h1>

        <input
          type="password"
          placeholder="Enter PIN"
          className="border w-full p-2 rounded mb-3"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          required
        />

        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        <button className="w-full py-2 bg-[#0b1437] text-white rounded hover:bg-[#12205d]">
          Login
        </button>
      </form>
    </div>
  );
}