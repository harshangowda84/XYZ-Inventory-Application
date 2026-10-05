"use client";

import React, { useState } from "react";
import { useFulfillment } from "@/context/FulfillmentContext";
import { OrderItem } from "@/types/fulfillment";
import { Check, CheckCircle2 } from "lucide-react";

export function WarehouseKiosk() {
  const {
    orders,
    assignPicker,
    updatePickQuantity,
    markItemMissing,
    completePacking,
  } = useFulfillment();

  const [activePickerName, setActivePickerName] = useState<string>("Ramesh");
  const [selectedKioskOrderId, setSelectedKioskOrderId] = useState<string | null>(null);
  const [missingReason, setMissingReason] = useState<string>("");
  const [flaggingItemId, setFlaggingItemId] = useState<string | null>(null);

  const pickableOrders = orders
    .filter(
      (o) =>
        o.status === "READY_TO_PICK" ||
        o.status === "PICKING" ||
        o.status === "PACKING"
    )
    .sort((a, b) => {
      if (a.priority === "SAME_DAY" && b.priority !== "SAME_DAY") return -1;
      if (b.priority === "SAME_DAY" && a.priority !== "SAME_DAY") return 1;
      return 0;
    });

  const currentOrder =
    orders.find((o) => o.id === selectedKioskOrderId) ||
    pickableOrders[0] ||
    null;

  const handleClaimOrder = (orderId: string) => {
    assignPicker(orderId, activePickerName);
    setSelectedKioskOrderId(orderId);
  };

  const handleConfirmItem = (item: OrderItem) => {
    if (!currentOrder) return;
    updatePickQuantity(currentOrder.id, item.id, item.pickedQty + 1);
  };

  const handleReportMissing = (item: OrderItem) => {
    if (!currentOrder) return;
    const reason = missingReason.trim() || "Item not found on shelf";
    markItemMissing(currentOrder.id, item.id, reason);
    setFlaggingItemId(null);
    setMissingReason("");
  };

  const allItemsPicked =
    currentOrder &&
    currentOrder.items.length > 0 &&
    currentOrder.items.every((it) => it.pickedQty === it.quantity);

  return (
    <div className="space-y-4 text-xs">
      {/* Top Banner with Worker Switcher */}
      <div className="bg-white rounded-lg p-3.5 border border-black/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-black">
            Packing Station
          </h1>
          <p className="text-xs text-black/50">
            Pick items from shelves, pack the box, and place in shipping bay.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-black/60 font-medium">Worker:</span>
          <select
            value={activePickerName}
            onChange={(e) => setActivePickerName(e.target.value)}
            className="bg-black/5 px-2.5 py-1 rounded text-xs font-semibold text-black border border-black/10 outline-none cursor-pointer"
          >
            <option value="Ramesh">Ramesh</option>
            <option value="Suresh">Suresh</option>
            <option value="Deepak">Deepak</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Orders Waiting */}
        <div className="lg:col-span-4 bg-white rounded-lg border border-black/10 overflow-hidden">
          <div className="px-3.5 py-2.5 border-b border-black/10 text-xs font-semibold text-black/60 bg-black/[0.02]">
            Orders to Pick ({pickableOrders.length})
          </div>

          <div className="p-2 space-y-2 max-h-[520px] overflow-y-auto">
            {pickableOrders.length === 0 ? (
              <div className="p-6 text-center text-black/40 text-xs">
                No orders waiting for pick.
              </div>
            ) : (
              pickableOrders.map((order) => {
                const isSelected = currentOrder?.id === order.id;
                const isUrgent = order.priority === "SAME_DAY";
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedKioskOrderId(order.id)}
                    className={`p-3 rounded border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-black text-white border-black"
                        : "bg-white border-black/10 hover:border-black/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm">Order #{order.id}</div>
                      {isUrgent && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isSelected
                              ? "bg-white text-black"
                              : "bg-black text-white"
                          }`}
                        >
                          Urgent
                        </span>
                      )}
                    </div>

                    <div className="text-xs mt-1">
                      {order.items.reduce((acc, it) => acc + it.quantity, 0)} items ({order.items.length} lines)
                    </div>

                    <div className="text-[11px] mt-1 opacity-70 flex items-center justify-between">
                      <span>{order.status === "READY_TO_PICK" ? "Ready" : "In Progress"}</span>
                      <span>{order.assignedPicker || "Unassigned"}</span>
                    </div>

                    {order.status === "READY_TO_PICK" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClaimOrder(order.id);
                        }}
                        className={`mt-2 w-full py-1 rounded text-xs font-semibold transition-colors ${
                          isSelected
                            ? "bg-white text-black hover:bg-neutral-200"
                            : "bg-black text-white hover:bg-neutral-800"
                        }`}
                      >
                        Start Order
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Shelf Pick & Pack Tasks */}
        <div className="lg:col-span-8 bg-white rounded-lg border border-black/10 p-4 space-y-4">
          {currentOrder ? (
            <>
              {/* Order Info */}
              <div className="pb-3 border-b border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-black/40">Working on</div>
                  <div className="text-lg font-bold text-black flex items-center gap-2">
                    Order #{currentOrder.id}
                    {currentOrder.priority === "SAME_DAY" && (
                      <span className="text-[10px] bg-black text-white px-1.5 py-0.5 rounded">
                        Urgent
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-black/60 mt-0.5">
                    Assigned to: <strong className="text-black">{currentOrder.assignedPicker || "Unassigned"}</strong> • Put box in:{" "}
                    <strong className="text-black underline">{currentOrder.stagingBay || "Bay 1"}</strong>
                  </div>
                </div>

                {allItemsPicked && (
                  <button
                    onClick={() => completePacking(currentOrder.id)}
                    className="px-4 py-2 bg-black text-white rounded font-bold text-xs uppercase hover:bg-neutral-800 transition-colors"
                  >
                    Box Packed → Put in {currentOrder.stagingBay}
                  </button>
                )}
              </div>

              {/* Items Card List */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-black/50">
                  Find on Shelves ({currentOrder.items.length} items)
                </div>

                {currentOrder.items.map((item, index) => {
                  const isDone = item.pickedQty >= item.quantity;
                  const isFlaggingThis = flaggingItemId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded border transition-colors ${
                        isDone
                          ? "bg-black/[0.02] border-black/5 opacity-70"
                          : "bg-white border-black/15 shadow-sm"
                      }`}
                    >
                      {/* Shelf location */}
                      <div className="flex items-center justify-between pb-2 border-b border-black/10">
                        <div className="font-bold text-xs text-black">
                          #{index + 1} • Go to: <span className="underline">{item.shelfLocation}</span>
                        </div>
                        <div className="text-xs text-black/60">
                          Need: <strong className="text-black">{item.quantity} pcs</strong>
                        </div>
                      </div>

                      {/* Item details */}
                      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="font-bold text-sm text-black">{item.name}</div>
                          <div className="text-xs text-black/60">
                            Size / Type: <strong className="text-black">{item.variant}</strong>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right text-xs">
                            <span className="text-[10px] text-black/40 block">Picked</span>
                            <span className="font-bold text-sm text-black">
                              {item.pickedQty} / {item.quantity}
                            </span>
                          </div>

                          {!isDone ? (
                            <button
                              onClick={() => handleConfirmItem(item)}
                              className="px-4 py-2 bg-black text-white hover:bg-neutral-800 rounded text-xs font-bold transition-all flex items-center gap-1.5"
                            >
                              <Check className="w-4 h-4" />
                              Pick (+1)
                            </button>
                          ) : (
                            <div className="px-3 py-1.5 rounded bg-black/5 text-black font-semibold text-xs flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Picked
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Not on shelf link */}
                      {!isDone && (
                        <div className="pt-2 mt-2 border-t border-black/5">
                          {!isFlaggingThis ? (
                            <button
                              onClick={() => setFlaggingItemId(item.id)}
                              className="text-xs text-black/50 hover:text-black underline"
                            >
                              Can't find on shelf? Click here
                            </button>
                          ) : (
                            <div className="p-2.5 rounded bg-black/5 space-y-2 mt-1">
                              <div className="font-semibold text-xs text-black">
                                What's the problem?
                              </div>
                              <input
                                type="text"
                                placeholder="e.g. Shelf is empty or item damaged"
                                value={missingReason}
                                onChange={(e) => setMissingReason(e.target.value)}
                                className="w-full text-xs p-1.5 rounded bg-white border border-black/20 outline-none"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleReportMissing(item)}
                                  className="px-3 py-1 bg-black text-white rounded font-semibold text-xs hover:bg-neutral-800"
                                >
                                  Report to Office & Bring from Warehouse 2
                                </button>
                                <button
                                  onClick={() => setFlaggingItemId(null)}
                                  className="px-2 py-1 text-xs text-black/60 hover:text-black"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-black/40 text-xs">
              Select an order from the list on the left to start picking.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
