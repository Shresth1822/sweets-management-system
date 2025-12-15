import React, { useState, useEffect } from "react";
import { Plus, Trash, RotateCcw, Pencil, Package } from "lucide-react";
import type { Sweet } from "../types";
import api from "../utils/api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export const AdminPanel: React.FC = () => {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form State
  const [isEditing, setIsEditing] = useState<Sweet | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const predefinedCategories = [
    "Milk Solids",
    "Cashew",
    "Flour",
    "Fudge",
    "Candy",
  ];

  // Rest of state...
  const [restockId, setRestockId] = useState<string | null>(null);
  const [restockAmount, setRestockAmount] = useState("");

  const fetchSweets = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/sweets");
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

  const resetForm = () => {
    setName("");
    setCategory("");
    setIsCustomCategory(false);
    setPrice("");
    setQuantity("");
    setDescription("");
    setImageUrl("");
    setIsEditing(null);
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditClick = (sweet: Sweet) => {
    setIsEditing(sweet);
    setName(sweet.name);

    if (predefinedCategories.includes(sweet.category)) {
      setCategory(sweet.category);
      setIsCustomCategory(false);
    } else {
      setCategory(sweet.category);
      setIsCustomCategory(true);
    }

    setPrice(sweet.price.toString());
    setQuantity(sweet.quantity.toString());
    setDescription(sweet.description || "");
    setImageUrl(sweet.image_url || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this sweet?")) return;
    try {
      await api.delete(`/sweets/${id}`);
      setSuccess("Sweet deleted successfully");
      fetchSweets();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete sweet");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const sweetData = {
      name,
      category,
      price: Number(price),
      quantity: Number(quantity),
      description,
      image_url: imageUrl,
    };

    try {
      if (isEditing) {
        await api.put(`/sweets/${isEditing.id}`, sweetData);
        setSuccess("Sweet updated successfully");
      } else {
        await api.post("/sweets", sweetData);
        setSuccess("Sweet created successfully");
      }
      resetForm();
      fetchSweets();
    } catch (err: any) {
      setError(err.response?.data?.error || "Operation failed");
    }
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockId) return;

    try {
      await api.post(`/inventory/${restockId}/restock`, {
        quantityToAdd: Number(restockAmount),
      });
      setSuccess("Restock successful");
      setRestockId(null);
      setRestockAmount("");
      fetchSweets();
    } catch (err: any) {
      setError(err.response?.data?.error || "Restock failed");
    }
  };

  // ... return logic ...
  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500">
            Manage your sweet inventory and pricing
          </p>
        </div>
      </div>

      {/* Create/Edit Form */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {isEditing ? "Edit Sweet" : "Add New Sweet"}
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-lg text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Sweet Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Chocolate Truffles"
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              {isCustomCategory ? (
                <div className="flex gap-2">
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Enter new category"
                    required
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setIsCustomCategory(false);
                      setCategory("");
                    }}
                    title="Select existing category"
                  >
                    x
                  </Button>
                </div>
              ) : (
                <select
                  value={category}
                  onChange={(e) => {
                    if (e.target.value === "NEW_CATEGORY_OPTION") {
                      setIsCustomCategory(true);
                      setCategory("");
                    } else {
                      setCategory(e.target.value);
                    }
                  }}
                  className="w-full h-10 rounded-md border border-gray-300 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="" disabled>
                    Select Category
                  </option>
                  {predefinedCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option
                    value="NEW_CATEGORY_OPTION"
                    className="font-bold text-purple-600"
                  >
                    + Add New Category
                  </option>
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Price (₹)"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <Input
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[80px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Rich, handmade chocolate truffles..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <Input
              label="Image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Image Preview
              </label>
              <div className="h-32 w-32 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="text-gray-300" />
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isEditing ? (
                <Pencil className="w-4 h-4 mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {isEditing ? "Update Sweet" : "Add New Sweet"}
            </Button>
            {isEditing && (
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Sweets Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Sweet
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    Loading inventory...
                  </td>
                </tr>
              ) : sweets.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    No sweets found.
                  </td>
                </tr>
              ) : (
                sweets.map((sweet) => (
                  <tr
                    key={sweet.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                          {sweet.image_url ? (
                            <img
                              src={sweet.image_url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-full w-full p-2 text-gray-300" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {sweet.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">
                            {sweet.description || "No description"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                        {sweet.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{Number(sweet.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <span
                          className={`font-medium ${
                            sweet.quantity === 0
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {sweet.quantity}
                        </span>
                        <Package className="w-3 h-3 text-gray-400" />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setRestockId(sweet.id)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(sweet)}
                          className="text-purple-600 hover:text-purple-900 p-1 rounded-md hover:bg-purple-50"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sweet.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {restockId && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full transform transition-all">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Restock Inventory
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Add more stock to this item.
            </p>
            <form onSubmit={handleRestock}>
              <Input
                label="Quantity to Add"
                type="number"
                min="1"
                value={restockAmount}
                onChange={(e) => setRestockAmount(e.target.value)}
                required
                autoFocus
                className="text-lg"
              />
              <div className="mt-6 flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setRestockId(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Confirm Restock
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
