"use client";

import React, { useState } from "react";
import { useFulfillment } from "@/context/FulfillmentContext";
import { COURIERS } from "@/data/mockData";
import { OrderItem } from "@/types/fulfillment";
import {
  CheckCircle2,
  Package,
  Truck,
  AlertTriangle,
  Clock,
  Check,
  User,
  ArrowRight,
} from "lucide-react";

export function WarehouseFloorView() {
  const {
    orders,
    updatePickQuantity,
    markItemMissing,
    completePacking,
    dispatchBay,
    assignPicker,
  } = useFulfillment();

  const [activeWorker, setActiveWorker] = useState("Ramesh");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Orders that have shipping labels and are ready for warehouse to pick/pack
  const pickableOrders = orders
    .filter(
      (o) =>
        o.status === "READY_TO_PICK" ||
        o.status === "PICKING" ||
        o.status === "PACKING"
    )
    .sort((a, b) => {
      // 🚨 Same day priority orders ALWAYS first!
      if (a.priority === "SAME_DAY" && b.priority !== "SAME_DAY") return -1;
      if (b.priority === "SAME_DAY" && a.priority !== "SAME_DAY") return 1;
      return 0;
    });

  const activeOrder =
    orders.find((o) => o.id === selectedOrderId) ||
    pickableOrders[0] ||
    null;

  const handlePickIncrement = (item: OrderItem) => {
    if (!activeOrder) return;
    updatePickQuantity(activeOrder.id, item.id, item.pickedQty + 1);
  };

  const handleReportMissing = (item: OrderItem) => {
    if (!activeOrder) return;
    markItemMissing(activeOrder.id, item.id, "Cannot find on shelf");
  };

  const isOrderFullyPicked =
    activeOrder &&
    activeOrder.items.length > 0 &&
    activeOrder.items.every((it) => it.pickedQty === it.quantity);

  // Staging bays
  const bays = [
    { id: "Bay 1", courier: "BlueDart Express", cutoff: "5:00 PM" },
    { id: "Bay 2", courier: "Delhivery Surface", cutoff: "11:00 PM" },
    { id: "Bay 3", courier: "Porter Van", cutoff: "3:00 PM (Next)" },
  ];

  return (
    <div className="h-full flex flex-col gap-3 font-sans">
      {/* Top Floor Bar */}
      <div className="bg-white p-3 rounded-lg border border-black/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-black text-white flex items-center justify-center font-bold text-sm">
            📦
          </div>
          <div>
            <h1 className="text-sm font-bold text-black">
              Warehouse Packing Floor
            </h1>
            <p className="text-[11px] text-black/50">
              Collect items from shelf &rarr; Pack box &rarr; Place in courier bay.
            </p>
          </div>
        </div>

        {/* Worker Switcher */}
        <div className="flex items-center gap-2 bg-neutral-100 px-3 py-1.5 rounded-lg border border-black/10">
          <User className="w-4 h-4 text-black/60" />
          <span className="text-xs font-semibold text-black/70">Packer:</span>
          <select
            value={activeWorker}
            onChange={(e) => setActiveWorker(e.target.value)}
            className="bg-white px-2 py-0.5 rounded text-xs font-bold text-black border border-black/15 outline-none cursor-pointer"
          >
            <option value="Ramesh">Ramesh</option>
            <option value="Suresh">Suresh</option>
            <option value="Deepak">Deepak</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Orders to Pack (Left) + Courier Staging Bays (Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 overflow-hidden">
        {/* Left Column: Orders Queue & Active Picking Station */}
        <div className="lg:col-span-8 flex flex-col gap-3 h-full overflow-hidden">
          {/* Order Selector Strip */}
          <div className="bg-white p-2.5 rounded-lg border border-black/10 flex items-center gap-2 overflow-x-auto shrink-0">
            <span className="text-xs font-bold text-black/60 shrink-0">Orders to Pack:</span>
            {pickableOrders.length === 0 ? (
              <span className="text-xs text-black/40">🎉 No orders waiting! All packed!</span>
            ) : (
              pickableOrders.map((o) => {
                const isSelected = activeOrder?.id === o.id;
                const isPriority = o.priority === "SAME_DAY";

                return (
                  <button
                    key={o.id}
                    onClick={() => {
                      setSelectedOrderId(o.id);
                      assignPicker(o.id, activeWorker);
                    }}
                    className={`px-3 py-1.5 rounded text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? "bg-black text-white shadow"
                        : "bg-neutral-100 hover:bg-neutral-200 text-black border border-black/10"
                    }`}
                  >
                    <span>#{o.id}</span>
                    {isPriority && (
                      <span className="px-1 py-0.2 rounded bg-amber-400 text-black text-[9px] font-black">
                        🚨 URGENT
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Active Order Packing Workstation */}
          {activeOrder ? (
            <div className="flex-1 bg-white rounded-lg border border-black/10 flex flex-col overflow-hidden">
              {/* Order Station Banner */}
              <div className="p-3.5 border-b border-black/10 bg-black/[0.02] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-black">Order #{activeOrder.id}</span>
                    {activeOrder.priority === "SAME_DAY" && (
                      <span className="px-2 py-0.5 rounded bg-amber-400 text-black font-black text-xs">
                        🚨 MUST SHIP TODAY
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-black/60 mt-0.5">
                    Customer: <strong>{activeOrder.customerName}</strong> • Target Bay: <strong className="text-black bg-black/10 px-1.5 py-0.2 rounded">{activeOrder.stagingBay || "Bay 1"}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-black/50">Courier:</div>
                  <div className="text-xs font-bold text-black">{activeOrder.courier?.name || "Porter Van"}</div>
                </div>
              </div>

              {/* Items Shelf Checklist */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="text-xs font-bold text-black/60 uppercase">
                  Step 1: Collect Items from Shelves
                </div>

                {activeOrder.items.map((item) => {
                  const isDone = item.pickedQty >= item.quantity;

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-lg border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isDone
                          ? "bg-emerald-50/60 border-emerald-400"
                          : item.isMissing
                          ? "bg-red-50 border-red-300"
                          : "bg-white border-black/15 shadow-sm"
                      }`}
                    >
                      {/* Left: Product & Massive Shelf Location */}
                      <div className="space-y-1">
                        <div className="inline-block px-2.5 py-1 rounded bg-black text-white font-mono font-bold text-xs">
                          📍 SHELF: {item.shelfLocation}
                        </div>
                        <div className="text-sm font-bold text-black">{item.name}</div>
                        <div className="text-xs text-black/60">
                          Variant / Size: <strong className="text-black">{item.variant}</strong>
                        </div>
                        {item.isMissing && (
                          <div className="text-xs text-red-600 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Item reported missing — Office alerted!
                          </div>
                        )}
                      </div>

                      {/* Right: Pick Controls */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handlePickIncrement(item)}
                          disabled={isDone}
                          className={`px-4 py-2.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                            isDone
                              ? "bg-emerald-600 text-white cursor-default"
                              : "bg-black text-white hover:bg-neutral-800 active:scale-95 shadow"
                          }`}
                        >
                          {isDone ? (
                            <>
                              <Check className="w-4 h-4" /> Picked ({item.pickedQty} / {item.quantity})
                            </>
                          ) : (
                            <>
                              Confirm Pick (+1) • {item.pickedQty} / {item.quantity}
                            </>
                          )}
                        </button>

                        {!isDone && !item.isMissing && (
                          <button
                            onClick={() => handleReportMissing(item)}
                            className="px-2.5 py-2.5 rounded border border-red-300 text-red-600 hover:bg-red-50 text-[11px] font-semibold"
                            title="Cannot find item on shelf"
                          >
                            Missing?
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Pack & Staging Button */}
              <div className="p-3.5 border-t border-black/10 bg-neutral-50 flex items-center justify-between">
                <div className="text-xs text-black/60">
                  {isOrderFullyPicked ? (
                    <span className="text-emerald-700 font-bold">
                      ✅ All items verified! Ready to pack box.
                    </span>
                  ) : (
                    <span>Pick all items above before completing box.</span>
                  )}
                </div>

                <button
                  onClick={() => completePacking(activeOrder.id)}
                  disabled={!isOrderFullyPicked}
                  className={`px-5 py-2.5 rounded font-bold text-xs flex items-center gap-2 shadow transition-all ${
                    isOrderFullyPicked
                      ? "bg-black text-white hover:bg-neutral-800 cursor-pointer active:scale-95"
                      : "bg-black/20 text-black/40 cursor-not-allowed"
                  }`}
                >
                  <Package className="w-4 h-4" />
                  Box Packed! Put in {activeOrder.stagingBay || "Bay 1"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-white rounded-lg border border-black/10 flex flex-col items-center justify-center p-8 text-center text-black/40 text-xs">
              <Package className="w-10 h-10 mb-2 opacity-30" />
              <p className="font-semibold text-sm text-black/60">No Active Order Selected</p>
              <p className="mt-1">All orders in the queue are currently packed!</p>
            </div>
          )}
        </div>

        {/* Right Column: Courier Staging Bays (Handover) */}
        <div className="lg:col-span-4 bg-white rounded-lg border border-black/10 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-black/10 bg-black/[0.02]">
            <h2 className="text-xs font-bold text-black flex items-center gap-1.5">
              <Truck className="w-4 h-4" /> Courier Staging Bays (Dispatch)
            </h2>
            <p className="text-[11px] text-black/50 mt-0.5">
              Boxes ready for courier driver collection.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {bays.map((bay) => {
              const stagedBoxes = orders.filter(
                (o) => o.stagingBay === bay.id && o.status === "STAGED"
              );
              const dispatchedBoxes = orders.filter(
                (o) => o.stagingBay === bay.id && o.status === "DISPATCHED"
              );

              return (
                <div
                  key={bay.id}
                  className="p-3.5 rounded-lg border border-black/15 bg-neutral-50/50 space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-xs text-black flex items-center gap-1.5">
                        <span className="bg-black text-white px-1.5 py-0.5 rounded text-[10px] font-mono">
                          {bay.id}
                        </span>
                        <span>{bay.courier}</span>
                      </div>
                      <div className="text-[11px] text-black/50 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> Cutoff: <strong>{bay.cutoff}</strong>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-black">{stagedBoxes.length}</span>
                      <span className="text-[10px] text-black/60 block">boxes ready</span>
                    </div>
                  </div>

                  {/* List of order IDs in this bay */}
                  {stagedBoxes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {stagedBoxes.map((b) => (
                        <span
                          key={b.id}
                          className="px-2 py-0.5 rounded bg-white border border-black/10 text-[10px] font-bold text-black"
                        >
                          #{b.id}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* One-click Courier Handover button */}
                  <button
                    onClick={() => dispatchBay(bay.id)}
                    disabled={stagedBoxes.length === 0}
                    className={`w-full py-2 rounded text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      stagedBoxes.length > 0
                        ? "bg-black text-white hover:bg-neutral-800 shadow cursor-pointer active:scale-95"
                        : "bg-black/10 text-black/40 cursor-not-allowed"
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    Driver Picked Up ({stagedBoxes.length} Boxes)
                  </button>

                  {dispatchedBoxes.length > 0 && (
                    <div className="text-[10px] text-emerald-700 font-semibold text-right">
                      ✓ {dispatchedBoxes.length} boxes already shipped today
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
