"use client";

import React, { useState } from "react";
import { useFulfillment } from "@/context/FulfillmentContext";
import { getTodayDateString, formatDateString } from "@/lib/dateUtils";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  AlertCircle,
  Truck,
  ArrowRight,
  Calendar,
} from "lucide-react";

export function OrdersBoard() {
  const {
    orders,
    selectedOrder,
    setSelectedOrder,
    selectedDate,
    setSelectedDate,
    placeNewOrder,
    assignOrderDispatchDate,
    inventory,
  } = useFulfillment();

  const [showPlaceOrderModal, setShowPlaceOrderModal] = useState<boolean>(false);

  // New Order Form state (ALL EMPTY AS REQUESTED)
  const [newOrderCustomer, setNewOrderCustomer] = useState<string>("");
  const [newOrderChannel, setNewOrderChannel] = useState<string>("");
  const [newOrderDate, setNewOrderDate] = useState<string>("");
  const [newDispatchDate, setNewDispatchDate] = useState<string>("");
  const [newDeliveryPromise, setNewDeliveryPromise] = useState<string>("");
  const [newPriority, setNewPriority] = useState<"STANDARD" | "SAME_DAY">("STANDARD");
  const [selectedProductIndex, setSelectedProductIndex] = useState<number>(-1);
  const [productQty, setProductQty] = useState<string>("");

  // Calendar month navigation
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

  const ordersOnDate = orders.filter((o) => o.orderDate === selectedDate);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProductIndex < 0) return;
    const itemToAdd = inventory[selectedProductIndex];

    const formatDeliveryDate = (dateStr: string) => {
      if (!dateStr) return "12-Nov-2026";
      const parts = dateStr.split("-");
      if (parts.length === 3 && parts[0].length === 4) {
        const year = parts[0];
        const monthIdx = parseInt(parts[1], 10) - 1;
        const day = parts[2].padStart(2, "0");
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        if (monthIdx >= 0 && monthIdx < 12) {
          return `${day}-${months[monthIdx]}-${year}`;
        }
      }
      return dateStr;
    };

    placeNewOrder({
      customerName: newOrderCustomer.trim() || "Customer",
      channel: newOrderChannel.trim() || "Shopify",
      orderDate: newOrderDate || selectedDate,
      dispatchDate: newDispatchDate || selectedDate,
      deliveryPromiseDate: formatDeliveryDate(newDeliveryPromise),
      priority: newPriority,
      items: [
        {
          id: `i-${Date.now()}`,
          name: itemToAdd.name,
          variant: itemToAdd.variant,
          quantity: parseInt(productQty) || 1,
          shelfLocation: itemToAdd.shelfLocation,
          pickedQty: 0,
        },
      ],
    });

    // Reset fields to empty
    setNewOrderCustomer("");
    setNewOrderChannel("");
    setNewOrderDate("");
    setNewDispatchDate("");
    setNewDeliveryPromise("");
    setSelectedProductIndex(-1);
    setProductQty("");
    setShowPlaceOrderModal(false);
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-3 overflow-hidden text-xs font-sans">
      {/* ============================================================== */}
      {/* 1. LEFT COLUMN: COMPACT DATE SELECTOR (~240px)                */}
      {/* ============================================================== */}
      <aside className="w-full md:w-60 shrink-0 h-full overflow-y-auto flex flex-col gap-2.5 pr-1">
        {/* Place Order CTA Button */}
        <button
          onClick={() => {
            setNewOrderCustomer("");
            setNewOrderChannel("");
            setNewOrderDate("");
            setNewDispatchDate("");
            setNewDeliveryPromise("");
            setSelectedProductIndex(-1);
            setProductQty("");
            setShowPlaceOrderModal(true);
          }}
          className="w-full py-2 px-3 rounded bg-black text-white hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5 font-bold text-xs"
        >
          <Plus className="w-3.5 h-3.5" /> Place New Order
        </button>

        {/* Compact Always-Open Calendar */}
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
              const hasOrders = orders.some((o) => o.orderDate === dateStr);
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
            <span>Orders Placed on:</span>
            <span className="font-bold text-black">{selectedDate}</span>
          </div>
        </div>

        {/* Informational Card */}
        <div className="bg-white rounded-lg border border-black/10 p-2.5 text-[11px] text-black/70 space-y-1">
          <div className="font-bold text-black text-xs">Intake & Availability</div>
          <p className="text-[10px] leading-relaxed text-black/60">
            Incoming customer orders. The system computes stock availability. Review and set target dispatch dates to push orders to Dispatch.
          </p>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* 2. MIDDLE COLUMN: ORDERS INTAKE TABLE (FLEX-1)                 */}
      {/* ============================================================== */}
      <section className="flex-1 h-full min-w-0 bg-white rounded-lg border border-black/10 flex flex-col overflow-hidden">
        <div className="p-2 border-b border-black/10 bg-black/[0.02] flex items-center justify-between gap-2 shrink-0">
          <div className="font-bold text-xs text-black">
            Orders Received on {selectedDate} ({ordersOnDate.length})
          </div>
          <div className="text-[10px] text-black/50">
            Total Orders: {orders.length}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-white border-b border-black/10 text-black/40 text-[11px] z-10">
              <tr>
                <th className="py-2 px-2.5 font-medium">Order</th>
                <th className="py-2 px-2.5 font-medium">Customer</th>
                <th className="py-2 px-2.5 font-medium">Product / Items</th>
                <th className="py-2 px-2.5 font-medium">Stock Status</th>
                <th className="py-2 px-2.5 font-medium">Target Dispatch</th>
                <th className="py-2 px-2.5 font-medium text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {ordersOnDate.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-black/40 text-xs">
                    No orders placed on {selectedDate}. Click "Place New Order" on the left to add one!
                  </td>
                </tr>
              ) : (
                ordersOnDate.map((order) => {
                  const isSelected = selectedOrder?.id === order.id;
                  const isStockGood = order.isStockVerified !== false;

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
                        <div className="text-black">
                          {order.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}
                        </div>
                      </td>
                      <td className="py-2 px-2.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                          isStockGood
                            ? "bg-black/5 border-black/10 text-black"
                            : "bg-black text-white font-bold"
                        }`}>
                          {isStockGood ? "Ready in Stock" : "Stock Shortage"}
                        </span>
                      </td>
                      <td className="py-2 px-2.5">
                        <span className="font-semibold text-black">{order.dispatchDate}</span>
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
      {/* 3. RIGHT COLUMN: ORDER DETAILS & TARGET DISPATCH ASSIGNMENT   */}
      {/* ============================================================== */}
      <section className="w-full md:w-96 shrink-0 h-full bg-white rounded-lg border border-black/10 flex flex-col overflow-hidden">
        {selectedOrder ? (
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
            <div className="border-b border-black/10 pb-2.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-black">Order #{selectedOrder.id}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                  selectedOrder.status === "DISPATCHED"
                    ? "bg-black text-white font-bold"
                    : "bg-black/10 text-black"
                }`}>
                  {selectedOrder.status === "DISPATCHED" ? "SHIPPED" : selectedOrder.status}
                </span>
              </div>
              <div className="text-xs text-black/80">
                Customer: <strong className="text-black">{selectedOrder.customerName}</strong>
              </div>
              <div className="text-[11px] text-black/60 flex items-center justify-between">
                <span>Ordered on: <strong>{selectedOrder.orderDate}</strong></span>
                <span>Deadline: <strong>{selectedOrder.deliveryPromiseDate}</strong></span>
              </div>
            </div>

            {/* Stock Availability Computation */}
            <div className="p-2.5 rounded bg-black/[0.02] border border-black/10 space-y-1.5">
              <div className="font-bold text-xs text-black flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Stock Availability Status
              </div>
              <div className="text-xs text-black/80">
                {selectedOrder.stockAvailabilityMessage || "Stock computed: Available in Main Warehouse."}
              </div>
            </div>

            {/* Target Dispatch Date Assignment */}
            <div className="p-2.5 rounded bg-white border border-black/10 space-y-2">
              <div className="font-bold text-xs text-black flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" /> Set Target Dispatch Date
              </div>
              <p className="text-[10px] text-black/50">
                Determines which day this order appears in the Dispatch Cockpit board for the warehouse.
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={selectedOrder.dispatchDate}
                  onChange={(e) => {
                    assignOrderDispatchDate(selectedOrder.id, e.target.value);
                    if (e.target.value) {
                      setSelectedDate(e.target.value);
                    }
                  }}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  className="w-full p-1.5 rounded bg-black/[0.03] border border-black/15 text-xs font-semibold outline-none cursor-pointer"
                />
                <button
                  onClick={() => {
                    const today = getTodayDateString();
                    assignOrderDispatchDate(selectedOrder.id, today);
                    setSelectedDate(today);
                  }}
                  className="px-2.5 py-1.5 rounded bg-black text-white text-[10px] font-semibold hover:bg-neutral-800 shrink-0"
                >
                  Send to Today
                </button>
              </div>

              <div className="text-[10px] text-black/60">
                Currently scheduled for dispatch on: <strong className="text-black">{selectedOrder.dispatchDate}</strong>
              </div>
            </div>

            {/* Line Items List */}
            <div>
              <div className="text-[10px] font-bold uppercase text-black/40 mb-1.5">
                Items in Order ({selectedOrder.items.length})
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
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6 text-center text-black/40 text-xs">
            Select an order to view products and assign its target dispatch date.
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* MODAL: PLACE NEW ORDER - ALL FIELDS EMPTY BY DEFAULT           */}
      {/* ============================================================== */}
      {showPlaceOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-black max-w-md w-full p-4 space-y-3 shadow-lg text-xs">
            <div className="flex items-center justify-between border-b border-black/10 pb-2">
              <span className="font-bold text-sm text-black">Place New Order</span>
              <button
                onClick={() => setShowPlaceOrderModal(false)}
                className="text-black/50 hover:text-black font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-2.5">
              <div>
                <label className="text-[10px] text-black/60 font-semibold block mb-0.5">Customer Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter customer name..."
                  value={newOrderCustomer}
                  onChange={(e) => setNewOrderCustomer(e.target.value)}
                  className="w-full p-1.5 rounded bg-black/[0.02] border border-black/15 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-black/60 font-semibold block mb-0.5">Order Placed On (Date)</label>
                  <input
                    type="date"
                    required
                    value={newOrderDate}
                    onChange={(e) => setNewOrderDate(e.target.value)}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    className="w-full p-1.5 rounded bg-black/[0.02] border border-black/15 outline-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-black/60 font-semibold block mb-0.5">Target Dispatch Date</label>
                  <input
                    type="date"
                    required
                    value={newDispatchDate}
                    onChange={(e) => setNewDispatchDate(e.target.value)}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    className="w-full p-1.5 rounded bg-black/[0.02] border border-black/15 outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-black/60 font-semibold block mb-0.5">Channel / Source</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shopify, Amazon"
                    value={newOrderChannel}
                    onChange={(e) => setNewOrderChannel(e.target.value)}
                    className="w-full p-1.5 rounded bg-black/[0.02] border border-black/15 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-black/60 font-semibold block mb-0.5">Delivery Deadline (Date)</label>
                  <input
                    type="date"
                    required
                    value={newDeliveryPromise}
                    onChange={(e) => setNewDeliveryPromise(e.target.value)}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    className="w-full p-1.5 rounded bg-black/[0.02] border border-black/15 outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-[10px] text-black/60 font-semibold block mb-0.5">Select Product Item</label>
                  <select
                    required
                    value={selectedProductIndex}
                    onChange={(e) => setSelectedProductIndex(parseInt(e.target.value))}
                    className="w-full p-1.5 rounded bg-black/[0.02] border border-black/15 outline-none"
                  >
                    <option value={-1}>-- Choose an Item --</option>
                    {inventory.map((item, idx) => (
                      <option key={item.id} value={idx}>
                        {item.name} ({item.variant})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-black/60 font-semibold block mb-0.5">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    placeholder="Qty"
                    value={productQty}
                    onChange={(e) => setProductQty(e.target.value)}
                    className="w-full p-1.5 rounded bg-black/[0.02] border border-black/15 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-black/60 font-semibold block mb-0.5">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as "STANDARD" | "SAME_DAY")}
                  className="w-full p-1.5 rounded bg-black/[0.02] border border-black/15 outline-none"
                >
                  <option value="STANDARD">Standard Delivery</option>
                  <option value="SAME_DAY">Same-Day Urgent Dispatch</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2 border-t border-black/10">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded bg-black text-white font-bold hover:bg-neutral-800 transition-colors"
                >
                  Save & Place Order
                </button>
                <button
                  type="button"
                  onClick={() => setShowPlaceOrderModal(false)}
                  className="px-3 py-2 rounded border border-black/15 hover:bg-black/5 text-black"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
