"use client";

import React, { useState } from "react";
import { useFulfillment } from "@/context/FulfillmentContext";
import { COURIERS } from "@/data/mockData";
import { getTodayDateString, formatDateString } from "@/lib/dateUtils";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  Truck,
  Edit2,
  Package,
} from "lucide-react";

export function DispatchCockpit() {
  const {
    orders,
    selectedOrder,
    setSelectedOrder,
    selectedDate,
    setSelectedDate,
    cutoffs,
    updateCutoff,
    toggleManualVerify,
    allocateCourierSlot,
    markBoxPacked,
    confirmOrderPickedUp,
    rescheduleDispatch,
  } = useFulfillment();

  const [activeTab, setActiveTab] = useState<"SCHEDULED" | "BACKLOG">("SCHEDULED");
  const [selectedCourierId, setSelectedCourierId] = useState<string>(COURIERS[0].id);

  // Editable Cutoffs state
  const [editingCutoffId, setEditingCutoffId] = useState<string | null>(null);
  const [editCutoffTime, setEditCutoffTime] = useState<string>("");
  const [editCutoffService, setEditCutoffService] = useState<string>("");

  // Confirmation dialog state
  const [confirmModalAction, setConfirmModalAction] = useState<
    "VERIFY" | "ALLOCATE" | "PACK" | "PICKUP" | null
  >(null);

  // Month navigation
  const [viewYear, setViewYear] = useState<number>(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(() => new Date().getMonth());

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // 1. Scheduled for active date
  const scheduledOrders = orders.filter((o) => o.dispatchDate === selectedDate);

  // 2. Backlogs: dispatchDate < selectedDate and status !== 'DISPATCHED'
  const backlogOrders = orders.filter(
    (o) => o.dispatchDate < selectedDate && o.status !== "DISPATCHED"
  );

  const handleStartEditCutoff = (cutoff: { id: string; time: string; service: string }) => {
    setEditingCutoffId(cutoff.id);
    setEditCutoffTime(cutoff.time);
    setEditCutoffService(cutoff.service);
  };

  const handleSaveCutoff = (id: string) => {
    updateCutoff(id, editCutoffTime, editCutoffService);
    setEditingCutoffId(null);
  };

  // Execution of confirmed actions
  const executeConfirmedAction = () => {
    if (!selectedOrder) return;

    if (confirmModalAction === "VERIFY") {
      toggleManualVerify(selectedOrder.id);
    } else if (confirmModalAction === "ALLOCATE") {
      const selectedCourier = COURIERS.find((c) => c.id === selectedCourierId) || COURIERS[0];
      allocateCourierSlot(selectedOrder.id, selectedCourierId, selectedCourier.cutoffTime);
    } else if (confirmModalAction === "PACK") {
      markBoxPacked(selectedOrder.id);
    } else if (confirmModalAction === "PICKUP") {
      confirmOrderPickedUp(selectedOrder.id);
    }

    setConfirmModalAction(null);
  };

  // Check state stages for the vertical pipeline
  const isStep1Done = selectedOrder?.isStockVerified === true;
  const isStep2Done = Boolean(selectedOrder?.allocatedSlot && selectedOrder?.courier);
  const isStep3Done = selectedOrder?.status === "STAGED" || selectedOrder?.status === "DISPATCHED";
  const isStep4Done = selectedOrder?.status === "DISPATCHED";

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-3 overflow-hidden text-xs font-sans">
      {/* ============================================================== */}
      {/* 1. LEFT COLUMN: COMPACT CALENDAR & EDITABLE CUTOFFS (~240px)   */}
      {/* ============================================================== */}
      <aside className="w-full md:w-60 shrink-0 h-full overflow-y-auto flex flex-col gap-2.5 pr-1">
        {/* Compact Calendar */}
        <div className="bg-white rounded-lg border border-black/10 p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[11px] text-black">
              {monthNames[viewMonth]} {viewYear}
            </span>
            <div className="flex items-center gap-0.5">
              <button
                onClick={handlePrevMonth}
                className="p-1 rounded hover:bg-black/5 text-black"
                title="Previous Month"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button
                onClick={() => {
                  const now = new Date();
                  setViewYear(now.getFullYear());
                  setViewMonth(now.getMonth());
                  setSelectedDate(getTodayDateString());
                }}
                className="px-1 py-0.2 text-[9px] rounded border border-black/15 hover:bg-black/5 text-black font-semibold"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1 rounded hover:bg-black/5 text-black"
                title="Next Month"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-0.5 text-center text-[9px] font-medium text-black/40">
            <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`blank-${i}`} className="p-0.5 text-black/10 text-[9px]" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = formatDateString(viewYear, viewMonth, day);
              const isSelected = selectedDate === dateStr;
              const hasOrders = orders.some((o) => o.dispatchDate === dateStr);
              const isToday = dateStr === getTodayDateString();

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`py-1 rounded text-[10px] font-medium transition-colors relative ${
                    isSelected
                      ? "bg-black text-white font-bold"
                      : isToday
                      ? "bg-black/10 text-black font-bold"
                      : "text-black hover:bg-black/5"
                  }`}
                >
                  {day}
                  {hasOrders && !isSelected && (
                    <span className="w-1 h-1 rounded-full bg-black mx-auto block mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-1.5 border-t border-black/5 text-[10px] text-black/60 flex items-center justify-between">
            <span>Dispatch Run:</span>
            <span className="font-bold text-black">{selectedDate}</span>
          </div>
        </div>

        {/* Editable Daily Cutoffs Panel */}
        <div className="bg-white rounded-lg border border-black/10 p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[11px] text-black flex items-center gap-1">
              <Clock className="w-3 h-3" /> Cutoff Schedule
            </span>
            <span className="text-[9px] text-black/40">Editable</span>
          </div>

          <div className="space-y-1.5">
            {cutoffs.map((cutoff) => {
              const isEditing = editingCutoffId === cutoff.id;

              return (
                <div
                  key={cutoff.id}
                  className="p-1.5 rounded bg-black/[0.02] border border-black/10 space-y-1"
                >
                  {isEditing ? (
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={editCutoffTime}
                        onChange={(e) => setEditCutoffTime(e.target.value)}
                        placeholder="Time (e.g. 3:00 PM)"
                        className="w-full p-1 rounded bg-white border border-black/20 text-[10px]"
                      />
                      <input
                        type="text"
                        value={editCutoffService}
                        onChange={(e) => setEditCutoffService(e.target.value)}
                        placeholder="Courier Name"
                        className="w-full p-1 rounded bg-white border border-black/20 text-[10px]"
                      />
                      <div className="flex gap-1 pt-0.5">
                        <button
                          onClick={() => handleSaveCutoff(cutoff.id)}
                          className="px-2 py-0.5 rounded bg-black text-white text-[9px] font-semibold"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingCutoffId(null)}
                          className="px-1.5 py-0.5 text-[9px] text-black/60"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[11px] text-black leading-tight flex items-center gap-1">
                          {cutoff.time}
                          <button
                            onClick={() => handleStartEditCutoff(cutoff)}
                            className="p-0.5 text-black/40 hover:text-black"
                            title="Edit cutoff time"
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        <div className="text-[10px] text-black/60 leading-tight">{cutoff.service}</div>
                      </div>
                      <span className="text-[9px] px-1 py-0.5 rounded bg-black text-white font-semibold">
                        {cutoff.bay}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* 2. MIDDLE COLUMN: DISPATCH ORDERS TABLE (FLEX-1)               */}
      {/* ============================================================== */}
      <section className="flex-1 h-full min-w-0 bg-white rounded-lg border border-black/10 flex flex-col overflow-hidden">
        {/* Tab Controls: Scheduled for Today vs Backlog */}
        <div className="p-2 border-b border-black/10 bg-black/[0.02] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab("SCHEDULED")}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                activeTab === "SCHEDULED"
                  ? "bg-black text-white font-semibold"
                  : "bg-white text-black/70 border border-black/10 hover:bg-black/5"
              }`}
            >
              Scheduled for {selectedDate} ({scheduledOrders.length})
            </button>
            <button
              onClick={() => setActiveTab("BACKLOG")}
              className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                activeTab === "BACKLOG"
                  ? "bg-black text-white font-semibold"
                  : "bg-white text-black/70 border border-black/10 hover:bg-black/5"
              }`}
            >
              <AlertCircle className="w-3 h-3" />
              Backlog (Missed: {backlogOrders.length})
            </button>
          </div>

          <div className="text-[10px] text-black/50">
            {activeTab === "SCHEDULED" ? "Active day's run" : "Automatically calculated undispatched past orders"}
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-white border-b border-black/10 text-black/40 text-[11px] z-10">
              <tr>
                <th className="py-2 px-2.5 font-medium">Order</th>
                <th className="py-2 px-2.5 font-medium">Customer</th>
                <th className="py-2 px-2.5 font-medium">Ordered On</th>
                <th className="py-2 px-2.5 font-medium">Delivery Deadline</th>
                <th className="py-2 px-2.5 font-medium">Status / Slot</th>
                <th className="py-2 px-2.5 font-medium text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {(activeTab === "SCHEDULED" ? scheduledOrders : backlogOrders).length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-black/40 text-xs">
                    {activeTab === "SCHEDULED"
                      ? `No orders scheduled for dispatch on ${selectedDate}.`
                      : "No backlog orders from past dates! All caught up."}
                  </td>
                </tr>
              ) : (
                (activeTab === "SCHEDULED" ? scheduledOrders : backlogOrders).map((order) => {
                  const isSelected = selectedOrder?.id === order.id;
                  const isShipped = order.status === "DISPATCHED";

                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`cursor-pointer hover:bg-black/[0.02] transition-colors ${
                        isSelected ? "bg-black/5 font-semibold" : ""
                      }`}
                    >
                      <td className="py-2 px-2.5">
                        <div className="font-bold text-black">#{order.id}</div>
                        {order.priority === "SAME_DAY" && (
                          <span className="text-[9px] text-black/60 font-medium">Urgent</span>
                        )}
                      </td>
                      <td className="py-2 px-2.5">
                        <div className="text-black font-medium">{order.customerName}</div>
                        <div className="text-[10px] text-black/40">{order.channel}</div>
                      </td>
                      <td className="py-2 px-2.5">
                        <span className="text-black/70">{order.orderDate}</span>
                      </td>
                      <td className="py-2 px-2.5">
                        <span className="text-black font-medium">{order.deliveryPromiseDate}</span>
                      </td>
                      <td className="py-2 px-2.5">
                        <div>
                          {/* INVERTED SHIPPED TAG: Black background, white text */}
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded ${
                              isShipped
                                ? "bg-black text-white font-bold"
                                : "bg-black/5 border border-black/10 text-black"
                            }`}
                          >
                            {isShipped ? "SHIPPED" : order.status}
                          </span>
                        </div>
                        {order.allocatedSlot && (
                          <div className="text-[10px] text-black/50 mt-0.5">
                            {order.allocatedSlot}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-2.5 text-right">
                        <ChevronRight className="w-3.5 h-3.5 text-black/40 inline" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. RIGHT COLUMN: DETAILS & 1 • 2 • 3 • 4 VERTICAL STEPPER      */}
      {/* ============================================================== */}
      <section className="w-full md:w-96 shrink-0 h-full bg-white rounded-lg border border-black/10 flex flex-col overflow-hidden">
        {selectedOrder ? (
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
            {/* Header info */}
            <div className="border-b border-black/10 pb-2.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-black">Order #{selectedOrder.id}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    selectedOrder.status === "DISPATCHED"
                      ? "bg-black text-white"
                      : "bg-black/10 text-black"
                  }`}
                >
                  {selectedOrder.status === "DISPATCHED" ? "SHIPPED" : selectedOrder.status}
                </span>
              </div>
              <div className="text-xs text-black/80">
                Customer: <strong className="text-black">{selectedOrder.customerName}</strong>
              </div>
              <div className="text-[11px] text-black/60 flex items-center justify-between">
                <span>Ordered on: <strong>{selectedOrder.orderDate}</strong></span>
                <span>Scheduled: <strong>{selectedOrder.dispatchDate}</strong></span>
              </div>
              <div className="text-[11px] text-black/60">
                Deadline: <strong className="text-black">{selectedOrder.deliveryPromiseDate}</strong>
              </div>
            </div>

            {/* Backlog Alert if missed past date */}
            {selectedOrder.dispatchDate < selectedDate && selectedOrder.status !== "DISPATCHED" && (
              <div className="p-2.5 rounded bg-black/5 border border-black/15 space-y-1.5">
                <div className="font-bold text-xs text-black flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Backlog Alert:
                </div>
                <div className="text-xs text-black/80">
                  Scheduled for dispatch on <strong>{selectedOrder.dispatchDate}</strong> and missed cutoff.
                </div>
                <button
                  onClick={() => rescheduleDispatch(selectedOrder.id, selectedDate)}
                  className="px-2.5 py-1 rounded bg-black text-white text-[10px] font-semibold hover:bg-neutral-800"
                >
                  Move Dispatch to Today ({selectedDate})
                </button>
              </div>
            )}

            {/* Products in order */}
            <div>
              <div className="text-[10px] font-bold uppercase text-black/40 mb-1.5">
                Products in Order ({selectedOrder.items.length})
              </div>
              <div className="space-y-1.5">
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 rounded bg-black/[0.02] border border-black/5 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-black">{item.name}</div>
                      <div className="text-[10px] text-black/50">
                        {item.variant} • Shelf: {item.shelfLocation}
                      </div>
                    </div>
                    <div className="font-bold text-black">{item.quantity} pcs</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ============================================================== */}
            {/* VERTICAL STEPPER: 1 • • 2 • • 3 • • 4 WITH FILLED BADGES     */}
            {/* ============================================================== */}
            <div className="p-3 rounded bg-black/[0.02] border border-black/10 space-y-2">
              <div className="font-bold text-xs text-black mb-1">
                Order Lifecycle Pipeline
              </div>

              {/* Step 1: Manually Verify Order Availability */}
              <div className="flex gap-2.5 items-start">
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => setConfirmModalAction("VERIFY")}
                    className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 transition-colors ${
                      isStep1Done
                        ? "bg-black text-white cursor-pointer"
                        : "border border-black text-black bg-white cursor-pointer"
                    }`}
                    title="Click to toggle verification"
                  >
                    1
                  </button>
                  <div className={`w-0.5 h-6 my-0.5 ${isStep1Done ? "bg-black" : "bg-black/20"}`} />
                </div>

                <div
                  className={`flex-1 p-2 rounded border transition-colors ${
                    isStep1Done
                      ? "bg-black/[0.03] border-black/10 opacity-70"
                      : "bg-white border-black/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-black">
                      {isStep1Done ? "1. Order Verified" : "1. Manual Verification"}
                    </span>
                    {isStep1Done && (
                      <span className="text-[9px] text-black font-semibold flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" /> Checked
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-black/60 mt-0.5">
                    {isStep1Done
                      ? "Order items verified. Click button to change."
                      : "Manually check physical order & shelf stock."}
                  </p>
                  <button
                    onClick={() => setConfirmModalAction("VERIFY")}
                    className={`mt-1 w-full py-1 rounded text-[10px] font-semibold transition-colors ${
                      isStep1Done
                        ? "border border-black/30 text-black hover:bg-black/5"
                        : "bg-black text-white hover:bg-neutral-800"
                    }`}
                  >
                    {isStep1Done ? "Change / Re-verify" : "Confirm Verification"}
                  </button>
                </div>
              </div>

              {/* Step 2: Combined Courier & Slot Box */}
              <div className="flex gap-2.5 items-start">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                      isStep2Done
                        ? "bg-black text-white"
                        : "border border-black text-black bg-white"
                    }`}
                  >
                    2
                  </div>
                  <div className={`w-0.5 h-6 my-0.5 ${isStep2Done ? "bg-black" : "bg-black/20"}`} />
                </div>

                <div
                  className={`flex-1 p-2 rounded border transition-colors ${
                    isStep2Done
                      ? "bg-black/[0.03] border-black/10 opacity-70"
                      : "bg-white border-black/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-black">
                      2. Courier & Slot Allocation
                    </span>
                    {isStep2Done && (
                      <span className="text-[9px] text-black font-semibold">
                        {selectedOrder.allocatedSlot}
                      </span>
                    )}
                  </div>

                  {/* Single combined box for courier & slot */}
                  <div className="mt-1">
                    <label className="text-[9px] text-black/50 block mb-0.5">
                      Choose Courier & Available Slot
                    </label>
                    <select
                      value={selectedCourierId}
                      onChange={(e) => setSelectedCourierId(e.target.value)}
                      className="w-full p-1.5 rounded bg-black/[0.03] border border-black/15 text-[10px] outline-none font-medium"
                    >
                      {COURIERS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} — Cutoff: {c.cutoffTime} (₹{c.cost} • {c.assignedBay})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => setConfirmModalAction("ALLOCATE")}
                    className={`mt-1.5 w-full py-1 rounded text-[10px] font-semibold transition-colors ${
                      isStep2Done
                        ? "border border-black/30 text-black hover:bg-black/5"
                        : "bg-black text-white hover:bg-neutral-800"
                    }`}
                  >
                    {isStep2Done ? "Re-allocate Courier & Slot" : "Allocate & Send to Packing"}
                  </button>
                </div>
              </div>

              {/* Step 3: Pack Box (Warehouse & Dispatch Sync) */}
              <div className="flex gap-2.5 items-start">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                      isStep3Done
                        ? "bg-black text-white"
                        : "border border-black text-black bg-white"
                    }`}
                  >
                    3
                  </div>
                  <div className={`w-0.5 h-6 my-0.5 ${isStep3Done ? "bg-black" : "bg-black/20"}`} />
                </div>

                <div
                  className={`flex-1 p-2 rounded border transition-colors ${
                    isStep3Done
                      ? "bg-black/[0.03] border-black/10 opacity-70"
                      : "bg-white border-black/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-xs text-black">3. Pack Box</div>
                      <div className="text-[9px] text-black/50 mt-0.5">
                        {isStep3Done
                          ? `Packed & Placed in ${selectedOrder.stagingBay || "Bay"}`
                          : "Waiting for packer at station"}
                      </div>
                    </div>
                    {isStep3Done && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-black text-white font-bold">
                        PACKED
                      </span>
                    )}
                  </div>

                  {!isStep3Done && (
                    <button
                      onClick={() => setConfirmModalAction("PACK")}
                      className="mt-1 w-full py-1 rounded bg-black text-white text-[10px] font-semibold hover:bg-neutral-800"
                    >
                      Mark Box as Packed
                    </button>
                  )}
                </div>
              </div>

              {/* Step 4: Confirm Handover to Courier */}
              <div className="flex gap-2.5 items-start">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                      isStep4Done
                        ? "bg-black text-white"
                        : "border border-black text-black bg-white"
                    }`}
                  >
                    4
                  </div>
                </div>

                <div
                  className={`flex-1 p-2 rounded border transition-colors ${
                    isStep4Done
                      ? "bg-black/[0.03] border-black/10 opacity-70"
                      : "bg-white border-black/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-xs text-black">4. Courier Handover</div>
                      <div className="text-[9px] text-black/50 mt-0.5">
                        {isStep4Done
                          ? "Handed over & signed off by driver"
                          : "Awaiting driver collection at bay"}
                      </div>
                    </div>
                    {isStep4Done && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-black text-white font-bold">
                        HANDOVER DONE
                      </span>
                    )}
                  </div>

                  {!isStep4Done && (
                    <button
                      disabled={!isStep3Done}
                      onClick={() => setConfirmModalAction("PICKUP")}
                      className={`mt-1 w-full py-1 rounded text-[10px] font-semibold transition-colors ${
                        isStep3Done
                          ? "bg-black text-white hover:bg-neutral-800"
                          : "bg-black/10 text-black/30 cursor-not-allowed"
                      }`}
                    >
                      Confirm Driver Handover
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6 text-center text-black/40 text-xs">
            Select an order to view products and manage its lifecycle.
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* CONFIRMATION DIALOG MODAL FOR EACH LIFECYCLE STEP              */}
      {/* ============================================================== */}
      {confirmModalAction && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-black max-w-sm w-full p-4 space-y-3 shadow-lg text-xs">
            <div className="font-bold text-sm text-black border-b border-black/10 pb-1.5">
              Confirm Action for Order #{selectedOrder.id}
            </div>

            <div className="text-xs text-black/80 leading-relaxed">
              {confirmModalAction === "VERIFY" && (
                <span>
                  Are you sure you want to {isStep1Done ? "change/re-verify" : "manually verify"} the product and shelf stock for this order?
                </span>
              )}
              {confirmModalAction === "ALLOCATE" && (
                <span>
                  Confirm courier & cutoff slot allocation for <strong>Order #{selectedOrder.id}</strong>? This will generate the shipping tracking code and move the order to the Warehouse Packing Queue.
                </span>
              )}
              {confirmModalAction === "PACK" && (
                <span>
                  Confirm that all items for <strong>Order #{selectedOrder.id}</strong> have been packed into the shipping box and routed to the bay?
                </span>
              )}
              {confirmModalAction === "PICKUP" && (
                <span>
                  Confirm driver collection for <strong>Order #{selectedOrder.id}</strong>? This will mark the order as permanently <strong>SHIPPED</strong>.
                </span>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-black/10">
              <button
                onClick={executeConfirmedAction}
                className="flex-1 py-1.5 rounded bg-black text-white font-bold hover:bg-neutral-800 transition-colors"
              >
                Yes, Confirm
              </button>
              <button
                onClick={() => setConfirmModalAction(null)}
                className="px-3 py-1.5 rounded border border-black/20 hover:bg-black/5 text-black"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
