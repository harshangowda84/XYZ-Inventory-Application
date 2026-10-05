"use client";

import React, { useState } from "react";
import { useFulfillment } from "@/context/FulfillmentContext";
import { ArrowRightLeft, CheckCircle } from "lucide-react";

export function DualStockTransfers() {
  const { inventory, transfers, requestStockTransfer, receiveTransfer } = useFulfillment();
  const [selectedItemId, setSelectedItemId] = useState<string>(inventory[0].id);
  const [transferQty, setTransferQty] = useState<number>(20);

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferQty > 0) {
      requestStockTransfer(selectedItemId, transferQty);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Overview Banner */}
      <div className="bg-white rounded-lg p-3.5 border border-black/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-black">
            Stock in Both Warehouses
          </h1>
          <p className="text-xs text-black/50">
            Orders can only ship from the Main Warehouse. Move extra stock from Warehouse 2 when needed.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-black/50 mr-1">Main Warehouse:</span>
            <span className="font-bold text-black">
              {inventory.reduce((acc, it) => acc + it.mainWarehouseStock, 0)} pcs
            </span>
          </div>
          <div className="h-3 w-px bg-black/20" />
          <div>
            <span className="text-black/50 mr-1">Warehouse 2 (Extra):</span>
            <span className="font-bold text-black">
              {inventory.reduce((acc, it) => acc + it.secondaryWarehouseStock, 0)} pcs
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Stock table */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-black/10 overflow-hidden">
          <div className="px-3.5 py-2.5 border-b border-black/10 text-xs font-semibold text-black/60 bg-black/[0.02]">
            Items List
          </div>

          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-black/10 text-black/40 text-[11px]">
                <tr>
                  <th className="py-2 px-3 font-medium">Item</th>
                  <th className="py-2 px-3 font-medium">Shelf Location</th>
                  <th className="py-2 px-3 font-medium text-center">Main</th>
                  <th className="py-2 px-3 font-medium text-center">Warehouse 2</th>
                  <th className="py-2 px-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {inventory.map((item) => {
                  const isZero = item.mainWarehouseStock === 0;

                  return (
                    <tr key={item.id} className="hover:bg-black/[0.02] transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-black">{item.name}</div>
                        <div className="text-[11px] text-black/50">{item.variant}</div>
                      </td>
                      <td className="py-2.5 px-3 text-black/70">
                        {item.shelfLocation}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {isZero ? (
                          <span className="px-2 py-0.5 rounded bg-black text-white font-bold text-[10px]">
                            0 (Empty)
                          </span>
                        ) : (
                          <span className="font-bold text-black">{item.mainWarehouseStock}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center text-black/70">
                        {item.secondaryWarehouseStock}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {isZero ? (
                          <button
                            onClick={() => {
                              setSelectedItemId(item.id);
                              setTransferQty(25);
                            }}
                            className="px-2 py-0.5 rounded bg-black text-white text-[11px] font-semibold hover:bg-neutral-800"
                          >
                            Bring from W2
                          </button>
                        ) : (
                          <span className="text-black/40 text-[11px]">In Stock</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Request & Move stock */}
        <div className="lg:col-span-5 space-y-4">
          {/* Create Request */}
          <div className="bg-white rounded-lg border border-black/10 p-4 space-y-3">
            <div className="font-semibold text-xs text-black flex items-center gap-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Move Items from Warehouse 2 to Main
            </div>

            <form onSubmit={handleCreateTransfer} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[11px] text-black/60 mb-1">
                  Choose Item
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full p-2 rounded bg-black/[0.02] border border-black/15 text-xs text-black outline-none"
                >
                  {inventory.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.variant})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-black/60 mb-1">
                  How many pieces?
                </label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={transferQty}
                  onChange={(e) => setTransferQty(parseInt(e.target.value) || 1)}
                  className="w-full p-2 rounded bg-black/[0.02] border border-black/15 text-xs text-black outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-black text-white rounded text-xs font-semibold hover:bg-neutral-800 transition-colors"
              >
                Send Request to Move Stock
              </button>
            </form>
          </div>

          {/* Transfers list */}
          <div className="bg-white rounded-lg border border-black/10 p-4 space-y-2.5">
            <div className="font-semibold text-xs text-black">
              Items on the Way ({transfers.length})
            </div>

            <div className="space-y-1.5 max-h-[260px] overflow-y-auto">
              {transfers.length === 0 ? (
                <div className="text-center py-6 text-black/40 text-xs">
                  No pending stock requests.
                </div>
              ) : (
                transfers.map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded bg-black/[0.02] border border-black/10 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-black">{t.itemName}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/5 text-black">
                        {t.status === "REQUESTED" ? "On the Way" : "Received"}
                      </span>
                    </div>

                    <div className="text-xs text-black/60">
                      Moving <strong>{t.quantity} pieces</strong> from Warehouse 2 to Main
                    </div>

                    {t.status === "REQUESTED" && (
                      <button
                        onClick={() => receiveTransfer(t.id)}
                        className="w-full py-1.5 bg-black text-white rounded text-[11px] font-semibold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1 mt-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Box Arrived → Put on Shelf
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
