"use client";

import React, { useState } from "react";
import { useFulfillment } from "@/context/FulfillmentContext";
import { COURIERS } from "@/data/mockData";
import { getTodayDateString } from "@/lib/dateUtils";
import {
  Search,
  Plus,
  CheckCircle2,
  Clock,
  Truck,
  AlertTriangle,
  ArrowRight,
  Package,
  Check,
  X,
  FileText,
} from "lucide-react";

export function OfficeView() {
  const {
    orders,
    selectedOrder,
    setSelectedOrder,
    allocateCourierSlot,
    placeNewOrder,
    inventory,
    setActiveView,
  } = useFulfillment();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"ALL" | "PRIORITY" | "NEEDS_LABEL" | "IN_WAREHOUSE" | "DISPATCHED">("ALL");
  const [selectedCourierId, setSelectedCourierId] = useState<string>(COURIERS[0].id);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);

  // New Order Form state
  const [newCustomer, setNewCustomer] = useState("");
  const [newChannel, setNewChannel] = useState("Shopify");
  const [newPriority, setNewPriority] = useState<"STANDARD" | "SAME_DAY">("STANDARD");
  const [newOrderDate, setNewOrderDate] = useState(() => getTodayDateString());
  const [newDeliveryDeadline, setNewDeliveryDeadline] = useState("");
  const [newProductIndex, setNewProductIndex] = useState(0);
  const [newQty, setNewQty] = useState(1);

  // Counters
  const priorityCount = orders.filter((o) => o.priority === "SAME_DAY" && o.status !== "DISPATCHED").length;
  const needsLabelCount = orders.filter((o) => o.status === "PENDING_LABEL").length;
  const inWarehouseCount = orders.filter(
    (o) => o.status === "READY_TO_PICK" || o.status === "PICKING" || o.status === "PACKING" || o.status === "STAGED"
  ).length;
  const dispatchedCount = orders.filter((o) => o.status === "DISPATCHED").length;

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    // Search match
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === "" ||
      order.id.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.channel.toLowerCase().includes(q) ||
      order.items.some((it) => it.name.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (filterTab === "PRIORITY") return order.priority === "SAME_DAY" && order.status !== "DISPATCHED";
    if (filterTab === "NEEDS_LABEL") return order.status === "PENDING_LABEL";
    if (filterTab === "IN_WAREHOUSE") {
      return (
        order.status === "READY_TO_PICK" ||
        order.status === "PICKING" ||
        order.status === "PACKING" ||
        order.status === "STAGED"
      );
    }
    if (filterTab === "DISPATCHED") return order.status === "DISPATCHED";

    return true;
  });

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const product = inventory[newProductIndex] || inventory[0];
    const today = getTodayDateString();

    const formatDeliveryDate = (dateStr: string) => {
      if (!dateStr) return "10-Oct-2026";
      const parts = dateStr.split("-");
      if (parts.length === 3 && parts[0].length === 4) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const mIdx = parseInt(parts[1], 10) - 1;
        return `${parts[2]}-${months[mIdx] || "Oct"}-${parts[0]}`;
      }
      return dateStr;
    };

    const orderDateVal = newOrderDate || today;

    placeNewOrder({
      customerName: newCustomer.trim() || "Customer",
      channel: newChannel,
      priority: newPriority,
      orderDate: orderDateVal,
      dispatchDate: orderDateVal,
      deliveryPromiseDate: formatDeliveryDate(newDeliveryDeadline),
      items: [
        {
          id: `i-${Date.now()}`,
          name: product.name,
          variant: product.variant,
          quantity: Number(newQty) || 1,
          shelfLocation: product.shelfLocation,
          pickedQty: 0,
        },
      ],
    });

    // Reset
    setNewCustomer("");
    setNewOrderDate(getTodayDateString());
    setNewDeliveryDeadline("");
    setNewQty(1);
    setShowNewOrderModal(false);
  };

  const handleGenerateLabel = () => {
    if (!selectedOrder) return;
    const courier = COURIERS.find((c) => c.id === selectedCourierId) || COURIERS[0];
    allocateCourierSlot(selectedOrder.id, selectedCourierId, courier.cutoffTime);
  };

  return (
    <div className="h-full flex flex-col gap-3 font-sans">
      {/* Top Quick KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
        <div
          onClick={() => setFilterTab("ALL")}
          className={`p-3 rounded-lg border cursor-pointer transition-all ${
            filterTab === "ALL"
              ? "bg-black text-white border-black"
              : "bg-white text-black border-black/10 hover:border-black/30"
          }`}
        >
          <div className="text-[11px] opacity-70 font-medium">All Orders</div>
          <div className="text-xl font-bold mt-0.5">{orders.length}</div>
        </div>

        <div
          onClick={() => setFilterTab("PRIORITY")}
          className={`p-3 rounded-lg border cursor-pointer transition-all ${
            filterTab === "PRIORITY"
              ? "bg-black text-white border-black"
              : "bg-white text-black border-black/10 hover:border-black/30"
          }`}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600">
            <span>🚨 Priority Same-Day</span>
          </div>
          <div className="text-xl font-bold mt-0.5">{priorityCount}</div>
        </div>

        <div
          onClick={() => setFilterTab("NEEDS_LABEL")}
          className={`p-3 rounded-lg border cursor-pointer transition-all ${
            filterTab === "NEEDS_LABEL"
              ? "bg-black text-white border-black"
              : "bg-white text-black border-black/10 hover:border-black/30"
          }`}
        >
          <div className="text-[11px] opacity-70 font-medium">⏳ Needs Shipping Label</div>
          <div className="text-xl font-bold mt-0.5">{needsLabelCount}</div>
        </div>

        <div
          onClick={() => setFilterTab("IN_WAREHOUSE")}
          className={`p-3 rounded-lg border cursor-pointer transition-all ${
            filterTab === "IN_WAREHOUSE"
              ? "bg-black text-white border-black"
              : "bg-white text-black border-black/10 hover:border-black/30"
          }`}
        >
          <div className="text-[11px] opacity-70 font-medium">📦 In Warehouse (Packing/Staged)</div>
          <div className="text-xl font-bold mt-0.5">{inWarehouseCount}</div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="bg-white p-2.5 rounded-lg border border-black/10 flex flex-wrap items-center justify-between gap-2 shrink-0">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-black/40" />
          <input
            type="text"
            placeholder="Search order #, customer, product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded bg-black/[0.03] border border-black/10 outline-none focus:border-black"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          <button
            onClick={() => setFilterTab("ALL")}
            className={`px-2.5 py-1 rounded text-xs font-semibold ${
              filterTab === "ALL" ? "bg-black text-white" : "bg-black/5 text-black hover:bg-black/10"
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setFilterTab("PRIORITY")}
            className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
              filterTab === "PRIORITY" ? "bg-black text-white" : "bg-black/5 text-black hover:bg-black/10"
            }`}
          >
            🚨 Same-Day ({priorityCount})
          </button>
          <button
            onClick={() => setFilterTab("NEEDS_LABEL")}
            className={`px-2.5 py-1 rounded text-xs font-semibold ${
              filterTab === "NEEDS_LABEL" ? "bg-black text-white" : "bg-black/5 text-black hover:bg-black/10"
            }`}
          >
            Needs Label ({needsLabelCount})
          </button>
          <button
            onClick={() => setFilterTab("IN_WAREHOUSE")}
            className={`px-2.5 py-1 rounded text-xs font-semibold ${
              filterTab === "IN_WAREHOUSE" ? "bg-black text-white" : "bg-black/5 text-black hover:bg-black/10"
            }`}
          >
            In Warehouse ({inWarehouseCount})
          </button>
          <button
            onClick={() => setFilterTab("DISPATCHED")}
            className={`px-2.5 py-1 rounded text-xs font-semibold ${
              filterTab === "DISPATCHED" ? "bg-black text-white" : "bg-black/5 text-black hover:bg-black/10"
            }`}
          >
            Dispatched ({dispatchedCount})
          </button>
        </div>

        {/* + Add Order CTA */}
        <button
          onClick={() => setShowNewOrderModal(true)}
          className="px-3.5 py-1.5 rounded bg-black text-white font-bold text-xs hover:bg-neutral-800 transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> + Receive New Order
        </button>
      </div>

      {/* Main Split: Orders List (Left) + Detail & Courier Assign (Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0 overflow-hidden">
        {/* Orders Table */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-black/10 flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b border-black/10 bg-black/[0.02] text-xs font-bold text-black flex items-center justify-between">
            <span>Orders Queue ({filteredOrders.length})</span>
            <span className="text-[11px] text-black/50 font-normal">Click an order to process label</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-black/40">
                No orders match your filter criteria.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-neutral-100/90 backdrop-blur-sm border-b border-black/10 text-[11px] text-black/60">
                  <tr>
                    <th className="py-2 px-3 font-semibold">Order</th>
                    <th className="py-2 px-2.5 font-semibold">Customer</th>
                    <th className="py-2 px-2.5 font-semibold">Items</th>
                    <th className="py-2 px-2.5 font-semibold">Deadline</th>
                    <th className="py-2 px-2.5 font-semibold">Status</th>
                    <th className="py-2 px-2 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {filteredOrders.map((order) => {
                    const isSelected = selectedOrder?.id === order.id;
                    const isPriority = order.priority === "SAME_DAY";

                    return (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-black/5 font-semibold"
                            : "hover:bg-black/[0.02]"
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-black">#{order.id}</span>
                            {isPriority && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[9px]">
                                SAME-DAY
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-black/50">{order.channel}</span>
                        </td>

                        <td className="py-2.5 px-2.5">
                          <div className="text-black">{order.customerName}</div>
                        </td>

                        <td className="py-2.5 px-2.5">
                          <div className="text-black/80 max-w-[150px] truncate">
                            {order.items.map((i) => `${i.name} (x${i.quantity})`).join(", ")}
                          </div>
                        </td>

                        <td className="py-2.5 px-2.5 text-black/70 font-mono text-[11px]">
                          {order.deliveryPromiseDate}
                        </td>

                        <td className="py-2.5 px-2.5">
                          {order.status === "PENDING_LABEL" && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold">
                              Needs Label
                            </span>
                          )}
                          {order.status === "READY_TO_PICK" && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-semibold">
                              Ready to Pick
                            </span>
                          )}
                          {(order.status === "PICKING" || order.status === "PACKING") && (
                            <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-semibold">
                              Packing Box
                            </span>
                          )}
                          {order.status === "STAGED" && (
                            <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-800 border border-orange-200 text-[10px] font-semibold">
                              Staged ({order.stagingBay || "Bay"})
                            </span>
                          )}
                          {order.status === "DISPATCHED" && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold">
                              Dispatched
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-2 text-right">
                          <ArrowRight className="w-3.5 h-3.5 inline text-black/30" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Detail & Courier Label Station */}
        <div className="lg:col-span-5 bg-white rounded-lg border border-black/10 flex flex-col overflow-hidden">
          {selectedOrder ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Header */}
              <div className="p-3.5 border-b border-black/10 flex items-start justify-between bg-black/[0.01]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-black">Order #{selectedOrder.id}</span>
                    {selectedOrder.priority === "SAME_DAY" && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px]">
                        🚨 SAME-DAY PRIORITY
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-black/60 mt-0.5">
                    Customer: <strong className="text-black">{selectedOrder.customerName}</strong> • {selectedOrder.channel}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-black/50">Delivery Deadline:</div>
                  <div className="text-xs font-bold text-black font-mono">{selectedOrder.deliveryPromiseDate}</div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
                {/* Stock Check Alert */}
                <div className={`p-2.5 rounded border text-xs ${
                  selectedOrder.stockAvailabilityMessage?.includes("Shortage")
                    ? "bg-amber-50/70 border-amber-200 text-amber-900"
                    : "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                }`}>
                  <div className="font-bold flex items-center justify-between">
                    <span>
                      {selectedOrder.stockAvailabilityMessage?.includes("Shortage")
                        ? "⚠️ Stock Shortage Alert"
                        : "✅ Stock Verified"}
                    </span>
                    {selectedOrder.stockAvailabilityMessage?.includes("Shortage") && (
                      <button
                        onClick={() => setActiveView("STOCK")}
                        className="text-[10px] underline font-bold hover:text-black"
                      >
                        Transfer Stock &rarr;
                      </button>
                    )}
                  </div>
                  <div className="text-[11px] mt-0.5 opacity-90">
                    {selectedOrder.stockAvailabilityMessage || "Stock available in Main Warehouse shelves."}
                  </div>
                </div>

                {/* Ordered Items List */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold text-black/50 uppercase">Items to Pick & Pack</div>
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded bg-black/[0.02] border border-black/10 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-black">{item.name}</div>
                        <div className="text-[10px] text-black/60">
                          {item.variant} • Shelf: <strong className="text-black font-mono">{item.shelfLocation}</strong>
                        </div>
                      </div>
                      <div className="font-bold text-black text-sm bg-black/5 px-2 py-1 rounded">
                        x{item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Courier Selection & Label Generation */}
                {selectedOrder.status === "PENDING_LABEL" ? (
                  <div className="p-3 rounded-lg border border-black/15 bg-black/[0.01] space-y-2.5">
                    <div>
                      <div className="font-bold text-xs text-black">Select Courier for Shipping Label:</div>
                      <p className="text-[11px] text-black/50">
                        Compare costs, delivery speeds, and courier cutoff times.
                      </p>
                    </div>

                    <div className="space-y-2">
                      {COURIERS.map((c) => {
                        const isChosen = selectedCourierId === c.id;
                        return (
                          <div
                            key={c.id}
                            onClick={() => setSelectedCourierId(c.id)}
                            className={`p-2.5 rounded border cursor-pointer transition-all flex items-center justify-between text-xs ${
                              isChosen
                                ? "border-black bg-black text-white font-semibold"
                                : "border-black/10 bg-white hover:border-black/30 text-black"
                            }`}
                          >
                            <div>
                              <div className="font-bold">{c.name}</div>
                              <div className={`text-[10px] ${isChosen ? "text-white/80" : "text-black/50"}`}>
                                {c.speed} • Pickup: {c.cutoffTime} &rarr; Assigned to <strong>{c.assignedBay}</strong>
                              </div>
                            </div>
                            <div className="text-right font-bold text-sm">
                              ₹{c.cost}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={handleGenerateLabel}
                      className="w-full py-2.5 rounded bg-black text-white font-bold text-xs hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5 shadow"
                    >
                      <Check className="w-4 h-4" /> Generate Shipping Label & Send to Warehouse
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg border border-black/15 bg-neutral-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-black flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Shipping Label Active
                      </span>
                      <span className="text-[10px] font-mono bg-black text-white px-2 py-0.5 rounded">
                        {selectedOrder.trackingNumber || "TRK-ASSIGNED"}
                      </span>
                    </div>

                    <div className="text-xs text-black/70 space-y-1">
                      <div>Courier: <strong>{selectedOrder.courier?.name || "Porter Van"}</strong></div>
                      <div>Staging Bay: <strong>{selectedOrder.stagingBay || "Bay 1"}</strong></div>
                      <div>Current Warehouse Status: <strong className="text-black">{selectedOrder.status}</strong></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-black/40 text-xs">
              <FileText className="w-8 h-8 mb-2 opacity-30" />
              <p>Select any order from the list to review details and assign a shipping label.</p>
            </div>
          )}
        </div>
      </div>

      {/* Simple Clean Modal: Place New Order */}
      {showNewOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-black max-w-md w-full p-4 space-y-3 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-black/10 pb-2">
              <div>
                <span className="font-bold text-sm text-black">New Customer Order (Marketplace Intake)</span>
                <p className="text-[10px] text-black/50">Simulates an order placed by a customer on Shopify, Amazon, etc.</p>
              </div>
              <button
                onClick={() => setShowNewOrderModal(false)}
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
                  placeholder="e.g. Ramesh Kumar"
                  value={newCustomer}
                  onChange={(e) => setNewCustomer(e.target.value)}
                  className="w-full p-1.5 rounded bg-black/[0.02] border border-black/15 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-black/60 font-semibold block mb-0.5">Channel / Source</label>
                  <select
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value)}
                    className="w-full p-1.5 rounded bg-black/[0.02] border border-black/15 outline-none"
                  >
                    <option value="Shopify">Shopify Store</option>
                    <option value="Amazon">Amazon Marketplace</option>
                    <option value="eBay">eBay</option>
                    <option value="Direct">Direct Phone Order</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-black/60 font-semibold block mb-0.5">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as "STANDARD" | "SAME_DAY")}
                    className="w-full p-1.5 rounded bg-black/[0.02] border border-black/15 outline-none"
                  >
                    <option value="STANDARD">Standard Delivery</option>
                    <option value="SAME_DAY">🚨 Same-Day Urgent Dispatch</option>
                  </select>
                </div>
              </div>

              {/* Order Date (Placed On) & Delivery Date (Promise Deadline) */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-black/60 font-semibold block mb-0.5">Order Date (Placed On)</label>
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
                  <label className="text-[10px] text-black/60 font-semibold block mb-0.5">Delivery Date (Promise Deadline)</label>
                  <input
                    type="date"
                    required
                    value={newDeliveryDeadline}
                    onChange={(e) => setNewDeliveryDeadline(e.target.value)}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    className="w-full p-1.5 rounded bg-black/[0.02] border border-black/15 outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-[10px] text-black/60 font-semibold block mb-0.5">Product</label>
                  <select
                    value={newProductIndex}
                    onChange={(e) => setNewProductIndex(Number(e.target.value))}
                    className="w-full p-1.5 rounded bg-black/[0.02] border border-black/15 outline-none"
                  >
                    {inventory.map((item, idx) => (
                      <option key={item.id} value={idx}>
                        {item.name} ({item.variant})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-black/60 font-semibold block mb-0.5">Qty</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newQty}
                    onChange={(e) => setNewQty(Number(e.target.value))}
                    className="w-full p-1.5 rounded bg-black/[0.02] border border-black/15 outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-black/10">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded bg-black text-white font-bold hover:bg-neutral-800 transition-colors"
                >
                  📥 Receive Order into Hub
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
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
