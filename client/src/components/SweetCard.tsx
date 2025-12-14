import React, { useState } from "react";
import { ShoppingCart, Package, Plus, Minus } from "lucide-react";
import type { Sweet } from "../types";
import { Button } from "./ui/Button";
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
      onPurchase();
      setQuantityToBuy(1);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to purchase");
    } finally {
      setIsLoading(false);
    }
  };

  const isOutOfStock = sweet.quantity === 0;

  const increment = () =>
    setQuantityToBuy((prev) => Math.min(prev + 1, sweet.quantity));
  const decrement = () => setQuantityToBuy((prev) => Math.max(prev - 1, 1));

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full group">
      {/* Image Area */}
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {sweet.image_url ? (
          <img
            src={sweet.image_url}
            alt={sweet.name}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-purple-50">
            <Package className="w-12 h-12 text-purple-300" />
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-purple-700 shadow-sm">
          {sweet.category}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
            {sweet.name}
          </h3>
          <span className="text-lg font-bold text-purple-600">
            ₹{Number(sweet.price).toFixed(2)}
          </span>
        </div>

        <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[2.5rem]">
          {sweet.description || "No description available."}
        </p>

        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span
              className={`font-medium ${
                isOutOfStock ? "text-red-500" : "text-green-600"
              }`}
            >
              {isOutOfStock ? "Out of Stock" : `${sweet.quantity} in stock`}
            </span>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex items-center gap-3">
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0">
              <button
                onClick={decrement}
                disabled={isOutOfStock || quantityToBuy <= 1}
                className="p-2 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <Minus className="w-3 h-3 text-gray-600" />
              </button>
              <span className="w-8 text-center text-sm font-medium text-gray-900">
                {quantityToBuy}
              </span>
              <button
                onClick={increment}
                disabled={isOutOfStock || quantityToBuy >= sweet.quantity}
                className="p-2 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <Plus className="w-3 h-3 text-gray-600" />
              </button>
            </div>

            <Button
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white shadow-md border-0"
              onClick={handlePurchase}
              disabled={isOutOfStock || isLoading}
              isLoading={isLoading}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
