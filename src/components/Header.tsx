"use client";

import React from "react";
import { useFulfillment } from "@/context/FulfillmentContext";
import { Clock, RotateCcw } from "lucide-react";
import defaultData from "@/data/data.json";

export function Header() {
  const { activeView, setActiveView, orders } = useFulfillment();

  // Badges
  const pendingLabelCount = orders.filter((o) => o.status === "PENDING_LABEL").length;
  const warehouseQueueCount = orders.filter(
    (o) => o.status === "READY_TO_PICK" || o.status === "PICKING" || o.status === "PACKING"
  ).length;

  const handleResetData = () => {
    if (typeof window !== "undefined") {
      if (confirm("Reset all orders and inventory back to initial demo data?")) {
        localStorage.removeItem("XYZ_FULFILLMENT_DATA_V2");
        window.location.reload();
      }
    }
  };

  return (
    <header className="bg-white border-b border-black/10 sticky top-0 z-50 shrink-0">
      <div className="w-full px-4 h-13 flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-black text-white flex items-center justify-center font-black text-xs tracking-wider">
            XYZ
          </div>
          <div>
            <div className="font-bold text-xs text-black leading-tight">
              Fulfillment Hub
            </div>
            <div className="text-[10px] text-black/50">
              Operations Engine
            </div>
          </div>
        </div>

        {/* 3 Main Role Navigation Tabs: Office, Warehouse, Stock */}
        <nav className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-lg border border-black/10">
          <button
            onClick={() => setActiveView("OFFICE")}
            className={`px-3 py-1.5 text-xs rounded-md transition-all flex items-center gap-1.5 font-bold ${
              activeView === "OFFICE"
                ? "bg-black text-white shadow-sm"
                : "text-black/70 hover:text-black hover:bg-black/5"
            }`}
          >
            <span>🏢 1. Office (Orders & Labels)</span>
            {pendingLabelCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeView === "OFFICE"
                    ? "bg-white text-black"
                    : "bg-amber-500 text-white"
                }`}
              >
                {pendingLabelCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView("WAREHOUSE")}
            className={`px-3 py-1.5 text-xs rounded-md transition-all flex items-center gap-1.5 font-bold ${
              activeView === "WAREHOUSE"
                ? "bg-black text-white shadow-sm"
                : "text-black/70 hover:text-black hover:bg-black/5"
            }`}
          >
            <span>📦 2. Warehouse Floor (Pick & Pack)</span>
            {warehouseQueueCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeView === "WAREHOUSE"
                    ? "bg-white text-black"
                    : "bg-blue-600 text-white"
                }`}
              >
                {warehouseQueueCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView("STOCK")}
            className={`px-3 py-1.5 text-xs rounded-md transition-all flex items-center gap-1.5 font-bold ${
              activeView === "STOCK"
                ? "bg-black text-white shadow-sm"
                : "text-black/70 hover:text-black hover:bg-black/5"
            }`}
          >
            <span>🏬 3. Stock (Wh 1 & 2)</span>
          </button>
        </nav>

        {/* Right Info: Live Courier Cutoff Ticker & Reset */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 bg-black/[0.04] px-2.5 py-1 rounded text-xs text-black/80 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Next Pickup: <strong>Porter Van • 3:00 PM (Bay 3)</strong></span>
          </div>

          <button
            onClick={handleResetData}
            title="Reset demo data"
            className="p-1.5 rounded hover:bg-black/5 text-black/40 hover:text-black text-xs flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[10px]">Reset Data</span>
          </button>
        </div>
      </div>
    </header>
  );
}
