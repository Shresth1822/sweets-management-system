import React, { useState } from "react";
import { ShoppingCart, Package } from "lucide-react";
import type { Sweet } from "../types";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import api from "../utils/api";

interface SweetCardProps {
  sweet: Sweet;
  onPurchase: () => void;
}

export const SweetCard: React.FC<SweetCardProps> = ({ sweet, onPurchase }) => {
  const [quantityToBuy, setQuantityToBuy] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePurchase = async () => {
    setIsLoading(true);
    setError("");
    try {
      await api.post(`/inventory/${sweet.id}/purchase`, {
        quantityToBuy: Number(quantityToBuy),
      });
      onPurchase(); // Refresh data
      setQuantityToBuy(1);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to purchase");
    } finally {
      setIsLoading(false);
    }
  };

  const isOutOfStock = sweet.quantity === 0;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 flex flex-col h-full hover:shadow-lg transition-shadow">
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start">
          <div>
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 mb-2">
              {sweet.category}
            </span>
            <h3 className="text-xl font-bold text-gray-900">{sweet.name}</h3>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            ${Number(sweet.price).toFixed(2)}
          </div>
        </div>

        <div className="mt-4 flex items-center text-sm text-gray-500">
          <Package
            className={`w-4 h-4 mr-1 ${
              isOutOfStock ? "text-red-500" : "text-gray-400"
            }`}
          />
          <span className={isOutOfStock ? "text-red-600 font-medium" : ""}>
            {isOutOfStock ? "Out of Stock" : `${sweet.quantity} available`}
          </span>
        </div>
      </div>

      <div className="p-6 bg-gray-50 border-t border-gray-100 mt-auto">
        {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
        <div className="flex gap-2 items-center">
          <div className="w-20">
            <Input
              type="number"
              min="1"
              max={sweet.quantity}
              value={quantityToBuy}
              onChange={(e) => setQuantityToBuy(Number(e.target.value))}
              disabled={isOutOfStock}
              className="h-9"
            />
          </div>
          <Button
            className="flex-1"
            size="sm"
            onClick={handlePurchase}
            disabled={isOutOfStock || isLoading || quantityToBuy < 1}
            isLoading={isLoading}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
};
