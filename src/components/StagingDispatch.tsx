"use client";

import React from "react";
import { useFulfillment } from "@/context/FulfillmentContext";
import { COURIERS } from "@/data/mockData";
import { Truck } from "lucide-react";

export function StagingDispatch() {
  const { orders, dispatchBay } = useFulfillment();

  const stagingBays = [
    {
      id: "BAY-01",
      name: "Bay 1",
      courier: COURIERS[0], // BlueDart
      cutoff: "4:00 PM",
    },
    {
      id: "BAY-02",
      name: "Bay 2",
      courier: COURIERS[1], // Delhivery
      cutoff: "5:30 PM",
    },
    {
      id: "BAY-03",
      name: "Bay 3",
      courier: COURIERS[2], // Porter
      cutoff: "3:00 PM",
    },
  ];

  return (
    <div className="space-y-4 text-xs">
      {/* Top Banner */}
      <div className="bg-white rounded-lg p-3.5 border border-black/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-black">
            Ready to Ship (Bays)
          </h1>
          <p className="text-xs text-black/50">
            Keep boxes sorted by courier so the driver doesn't miss any boxes.
          </p>
        </div>

        <div className="text-xs">
          <span className="text-black/50 mr-1.5">Packed & Ready:</span>
          <span className="font-bold text-sm text-black">
            {orders.filter((o) => o.status === "STAGED").length} boxes
          </span>
        </div>
      </div>

      {/* Staging Bays Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stagingBays.map((bay) => {
          const bayOrders = orders.filter(
            (o) => o.stagingBay === bay.name && o.status === "STAGED"
          );
          const dispatchedBayOrders = orders.filter(
            (o) => o.stagingBay === bay.name && o.status === "DISPATCHED"
          );

          return (
            <div
              key={bay.id}
              className="bg-white rounded-lg border border-black/10 flex flex-col justify-between overflow-hidden"
            >
              <div>
                {/* Header */}
                <div className="p-3 border-b border-black/10 bg-black/[0.02] flex items-start justify-between">
                  <div>
                    <div className="font-bold text-sm text-black">{bay.name}</div>
                    <div className="text-xs text-black/70 font-medium">
                      {bay.courier.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-black/40 block">Pickup Cutoff</span>
                    <span className="text-xs font-bold text-black">{bay.cutoff}</span>
                  </div>
                </div>

                {/* Status counts */}
                <div className="px-3 py-2 border-b border-black/5 flex justify-between text-[11px] text-black/60">
                  <span>Waiting: <strong className="text-black">{bayOrders.length}</strong></span>
                  <span>Picked up: <strong className="text-black">{dispatchedBayOrders.length}</strong></span>
                </div>

                {/* Staged boxes */}
                <div className="p-3 space-y-1.5 max-h-[300px] overflow-y-auto">
                  {bayOrders.length === 0 ? (
                    <div className="py-8 text-center text-black/40 text-xs">
                      No boxes waiting in this bay.
                    </div>
                  ) : (
                    bayOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-2.5 rounded bg-black/[0.02] border border-black/5 space-y-0.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-black">Order #{ord.id}</span>
                          {ord.priority === "SAME_DAY" && (
                            <span className="text-[10px] bg-black text-white px-1.5 py-0.2 rounded font-medium">
                              Urgent
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-black/70">{ord.customerName}</div>
                        <div className="text-[10px] text-black/40">
                          Label: {ord.trackingNumber}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Handover Button */}
              <div className="p-3 border-t border-black/10 bg-black/[0.02]">
                <button
                  disabled={bayOrders.length === 0}
                  onClick={() => dispatchBay(bay.name)}
                  className={`w-full py-2 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    bayOrders.length > 0
                      ? "bg-black text-white hover:bg-neutral-800"
                      : "bg-black/5 text-black/30 cursor-not-allowed"
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  Courier Picked Up ({bayOrders.length} Boxes)
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
