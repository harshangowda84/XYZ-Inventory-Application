"use client";

import React, { useState } from "react";
import { useFulfillment } from "@/context/FulfillmentContext";
import { ArrowRightLeft, CheckCircle2, PackageCheck, AlertCircle, Plus } from "lucide-react";

export function StockView() {
  const { inventory, transfers, requestStockTransfer, receiveTransfer } = useFulfillment();
  const [selectedItemId, setSelectedItemId] = useState(inventory[0]?.id || "");
  const [transferAmount, setTransferAmount] = useState(20);

  const totalMainStock = inventory.reduce((sum, item) => sum + item.mainWarehouseStock, 0);
  const totalSecondaryStock = inventory.reduce((sum, item) => sum + item.secondaryWarehouseStock, 0);

  const handleCreateCustomTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItemId && transferAmount > 0) {
      requestStockTransfer(selectedItemId, transferAmount);
    }
  };

  const pendingTransfers = transfers.filter((t) => t.status === "REQUESTED");
  const receivedTransfers = transfers.filter((t) => t.status === "RECEIVED");

  return (
    <div className="h-full flex flex-col gap-3 font-sans">
      {/* Top Facility Summary Banner */}
      <div className="bg-white p-3.5 rounded-lg border border-black/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-base font-bold text-black flex items-center gap-2">
            🏬 Dual-Warehouse Stock Management
          </h1>
          <p className="text-xs text-black/50 mt-0.5">
            Orders only ship from <strong>Main Warehouse (A)</strong>. Move extra inventory from <strong>Warehouse 2 (B)</strong> to avoid shipping delays.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs bg-neutral-100 px-4 py-2 rounded-lg border border-black/10">
          <div>
            <span className="text-black/50 block text-[10px]">Main Warehouse (A):</span>
            <span className="text-sm font-bold text-black">{totalMainStock} pcs available</span>
          </div>
          <div className="h-6 w-px bg-black/15" />
          <div>
            <span className="text-black/50 block text-[10px]">Warehouse 2 (B - Overflow):</span>
            <span className="text-sm font-bold text-black">{totalSecondaryStock} pcs in reserve</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Inventory Table (Left) + Internal Transfer Orders (Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 overflow-hidden">
        {/* Left: Inventory Items Table */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-black/10 flex flex-col overflow-hidden">
          <div className="px-3.5 py-2.5 border-b border-black/10 bg-black/[0.02] flex items-center justify-between text-xs">
            <span className="font-bold text-black">Inventory by Location ({inventory.length} SKUs)</span>
            <span className="text-black/50 text-[11px]">Click "Transfer" to restock Main Warehouse shelf</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-neutral-100/90 backdrop-blur-sm border-b border-black/10 text-[11px] text-black/60">
                <tr>
                  <th className="py-2 px-3 font-semibold">Product & Variant</th>
                  <th className="py-2 px-2.5 font-semibold">Main Shelf</th>
                  <th className="py-2 px-2.5 font-semibold text-center">Main Wh (A)</th>
                  <th className="py-2 px-2.5 font-semibold text-center">Wh 2 (Reserve)</th>
                  <th className="py-2 px-2.5 font-semibold">Status</th>
                  <th className="py-2 px-3 text-right">Quick Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {inventory.map((item) => {
                  const isOutOfStock = item.mainWarehouseStock === 0;
                  const isLow = item.mainWarehouseStock <= 5;

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isOutOfStock
                          ? "bg-red-50/50"
                          : isLow
                          ? "bg-amber-50/40"
                          : "hover:bg-black/[0.01]"
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-black">{item.name}</div>
                        <div className="text-[10px] text-black/50">{item.variant}</div>
                      </td>

                      <td className="py-2.5 px-2.5 font-mono text-[11px] text-black/80">
                        {item.shelfLocation}
                      </td>

                      <td className="py-2.5 px-2.5 text-center">
                        <span
                          className={`font-bold px-2 py-0.5 rounded ${
                            isOutOfStock
                              ? "bg-red-600 text-white"
                              : isLow
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : "text-black"
                          }`}
                        >
                          {item.mainWarehouseStock} pcs
                        </span>
                      </td>

                      <td className="py-2.5 px-2.5 text-center font-semibold text-black/70">
                        {item.secondaryWarehouseStock} pcs
                      </td>

                      <td className="py-2.5 px-2.5">
                        {isOutOfStock ? (
                          <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold">
                            ⚠️ Out in Main
                          </span>
                        ) : isLow ? (
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                            Good
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        {item.secondaryWarehouseStock > 0 ? (
                          <button
                            onClick={() => requestStockTransfer(item.id, 20)}
                            className="px-2.5 py-1 rounded bg-black text-white hover:bg-neutral-800 text-[11px] font-bold transition-all shadow-sm active:scale-95"
                          >
                            + Move 20 to Main
                          </button>
                        ) : (
                          <span className="text-[10px] text-black/30">Wh 2 Empty</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Internal Stock Transfers Station */}
        <div className="lg:col-span-4 flex flex-col gap-3 h-full overflow-hidden">
          {/* Active Transfers Queue */}
          <div className="flex-1 bg-white rounded-lg border border-black/10 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-black/10 bg-black/[0.02]">
              <h2 className="text-xs font-bold text-black flex items-center gap-1.5">
                <ArrowRightLeft className="w-4 h-4" /> Internal Stock Transfers
              </h2>
              <p className="text-[11px] text-black/50 mt-0.5">
                Truck runs between Warehouse 2 and Main Warehouse.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {pendingTransfers.length === 0 ? (
                <div className="p-6 text-center text-xs text-black/40">
                  No pending transfers. Main warehouse shelves are supplied!
                </div>
              ) : (
                pendingTransfers.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-lg border border-black/15 bg-neutral-50/60 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-xs text-black">{t.itemName}</div>
                        <div className="text-[10px] text-black/50">
                          {t.from} &rarr; <strong>{t.to}</strong>
                        </div>
                      </div>
                      <span className="font-bold text-sm bg-black text-white px-2 py-0.5 rounded">
                        +{t.quantity} pcs
                      </span>
                    </div>

                    <button
                      onClick={() => receiveTransfer(t.id)}
                      className="w-full py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow"
                    >
                      <PackageCheck className="w-4 h-4" /> Stock Arrived — Put on Shelf
                    </button>
                  </div>
                ))
              )}

              {receivedTransfers.length > 0 && (
                <div className="pt-2 border-t border-black/10 space-y-1">
                  <div className="text-[10px] font-bold text-black/50 uppercase">Recently Received</div>
                  {receivedTransfers.slice(0, 3).map((t) => (
                    <div key={t.id} className="text-[11px] text-black/60 flex items-center justify-between">
                      <span>✓ {t.itemName} (+{t.quantity})</span>
                      <span className="text-emerald-700 font-semibold text-[10px]">Restocked</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Manual Transfer Card */}
          <div className="bg-white p-3 rounded-lg border border-black/10 shrink-0 space-y-2">
            <div className="font-bold text-xs text-black">Request Custom Stock Movement</div>
            <form onSubmit={handleCreateCustomTransfer} className="space-y-2">
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full p-1.5 rounded bg-black/[0.02] border border-black/15 text-xs outline-none"
              >
                {inventory.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.variant}) — {item.secondaryWarehouseStock} in Wh 2
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <input
                  type="number"
                  min="5"
                  max="100"
                  step="5"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(Number(e.target.value))}
                  className="w-24 p-1.5 rounded bg-black/[0.02] border border-black/15 text-xs outline-none"
                />
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded bg-black text-white font-bold text-xs hover:bg-neutral-800 transition-colors"
                >
                  Request Move to Main
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
