"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { commandItems } from "@/lib/navigation";

export function CommandBar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden h-10 min-w-72 items-center justify-between rounded-md border border-[#1E293B] bg-[#111827] px-3 text-sm text-[#94A3B8] md:flex"
      >
        <span>Command center</span>
        <span className="rounded border border-[#1E293B] px-1.5 py-0.5 font-mono text-[11px]">CTRL K</span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/55 px-4 pt-24 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 16, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 16, scale: 0.98 }}
              className="w-full max-w-2xl rounded-lg border border-[#1E293B] bg-[#0B1220] shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="border-b border-[#1E293B] p-4">
                <input
                  autoFocus
                  className="h-12 w-full bg-transparent text-lg outline-none placeholder:text-[#64748B]"
                  placeholder="Ask TenderFlow to create, analyze, or search..."
                />
              </div>
              <div className="p-2">
                {commandItems.map((item) => (
                  <button
                    key={item}
                    className="flex h-11 w-full items-center rounded-md px-3 text-left text-sm text-[#F8FAFC] hover:bg-[#111827]"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
