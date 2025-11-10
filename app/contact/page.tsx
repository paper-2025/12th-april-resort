"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [sending, setSending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setToast(null);

    try {
      const res = await fetch("/api/sendMail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setToast({ type: "success", message: "✅ Message sent successfully!" });
        setForm({ name: "", email: "", message: "" });
      } else {
        setToast({ type: "error", message: "❌ Failed to send. Try again later." });
      }
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "⚠️ Error sending message." });
    } finally {
      setSending(false);
      setTimeout(() => setToast(null), 3500);
    }
  };

  return (
    <main className="min-h-screen bg-brandBg text-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <h1 className="text-3xl font-semibold mb-6">Contact Support</h1>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-black/40 p-6 rounded-lg space-y-4 backdrop-blur-sm"
      >
        <input
          name="name"
          type="text"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full p-3 rounded bg-white/10 text-white outline-none placeholder-gray-400"
        />
        <input
          name="email"
          type="email"
          placeholder="Your Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full p-3 rounded bg-white/10 text-white outline-none placeholder-gray-400"
        />
        <textarea
          name="message"
          placeholder="Your Message"
          value={form.message}
          onChange={handleChange}
          required
          rows={4}
          className="w-full p-3 rounded bg-white/10 text-white outline-none placeholder-gray-400"
        />
        <button
          type="submit"
          disabled={sending}
          className="w-full bg-brandAccent text-black py-3 rounded-md font-medium hover:bg-yellow-500 transition disabled:opacity-60"
        >
          {sending ? "Sending..." : "Send Message"}
        </button>
      </form>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-md shadow-lg text-center text-black font-medium ${
              toast.type === "success" ? "toast-success" : "toast-error"
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}