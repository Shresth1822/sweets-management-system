import React, { useEffect, useState } from "react";
import { Search, Package, ShoppingBag, Banknote, Filter } from "lucide-react";
import type { Sweet } from "../types";
import api from "../utils/api";
import { SweetCard } from "../components/SweetCard";
import { Button } from "../components/ui/Button";

export const Dashboard: React.FC = () => {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<{ type: string; value: number } | null>(
    null
  );

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("0");
  const [maxPrice, setMaxPrice] = useState("1000");
  const [showFilters, setShowFilters] = useState(false);

  // Stats (Calculated from sweets for demo, ideally from API)
  const totalStock = sweets.reduce((acc, s) => acc + s.quantity, 0);
  const totalItems = sweets.length;

  const fetchSweets = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("name", search);
      if (category && category !== "All Categories")
        params.append("category", category);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);

      const response = await api.get(`/sweets/search?${params.toString()}`);
      setSweets(response.data);
    } catch (err) {
      setError("Failed to load sweets");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/inventory/stats");
      setStats(response.data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  useEffect(() => {
    fetchSweets();
    fetchStats();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSweets();
  };

  const categories = [
    "All Categories",
    ...Array.from(new Set(sweets.map((s) => s.category))),
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between group">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Items</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {totalItems}
            </h3>
          </div>
          <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-inner group-hover:scale-110 transition-transform duration-300">
            <ShoppingBag className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between group">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Stock</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">
              {totalStock}
            </h3>
          </div>
          <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-inner group-hover:scale-110 transition-transform duration-300">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl flex items-center justify-between group border-l-4 border-primary-500">
          <div>
            <p className="text-sm font-medium text-gray-500">
              {stats?.type === "revenue" ? "Total Revenue" : "Total Spent"}
            </p>
            <h3 className="text-2xl font-bold text-gradient mt-1">
              ₹{(stats?.value || 0).toLocaleString("en-IN")}
            </h3>
          </div>
          <div className="p-3 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl shadow-inner group-hover:scale-110 transition-transform duration-300">
            <Banknote className="w-6 h-6 text-primary-600" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Browse Our Sweet Collection
        </h2>
        <p className="text-gray-500">
          Discover and purchase delicious authentic Indian sweets.
        </p>
      </div>

      <div className="glass-card p-6 rounded-2xl">
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search sweets by name..."
                className="w-full pl-10 h-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white/50 backdrop-blur-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" /> Filters
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  className="w-full h-10 rounded-lg border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Price Range: ₹{minPrice} - ₹{maxPrice}
                </label>
                <div className="flex gap-4 items-center">
                  <input
                    type="number"
                    placeholder="Min"
                    className="flex-1 h-10 rounded-lg border border-gray-300 px-3 text-sm"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="flex-1 h-10 rounded-lg border border-gray-300 px-3 text-sm"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>
              <div className="md:col-span-3 flex justify-end">
                <Button type="submit" className="btn-primary">
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Fetching deliciousness...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-20">{error}</div>
      ) : sweets.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">
            No sweets found matching your criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {sweets.map((sweet) => (
            <SweetCard
              key={sweet.id}
              sweet={sweet}
              onPurchase={() => {
                fetchSweets();
                fetchStats();
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
