import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import type { Sweet } from "../types";
import api from "../utils/api";
import { SweetCard } from "../components/SweetCard";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

export const Dashboard: React.FC = () => {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const fetchSweets = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("name", search);
      if (category) params.append("category", category);
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

  useEffect(() => {
    fetchSweets();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSweets();
  };

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end"
        >
          <div className="lg:col-span-2">
            <Input
              label="Search"
              placeholder="Sweet name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <Input
              label="Category"
              placeholder="e.g. Chocolate"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Min Price"
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <Input
              label="Max Price"
              type="number"
              placeholder="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </form>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading sweets...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-12">{error}</div>
      ) : sweets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">
            No sweets found matching your criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sweets.map((sweet) => (
            <SweetCard key={sweet.id} sweet={sweet} onPurchase={fetchSweets} />
          ))}
        </div>
      )}
    </div>
  );
};
