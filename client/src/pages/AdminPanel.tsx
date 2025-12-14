import React, { useState, useEffect } from "react";
import { Plus, Trash, RotateCcw, Pencil, X } from "lucide-react";
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
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  // Modal State for Restock
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
    setPrice("");
    setQuantity("");
    setIsEditing(null);
    setError("");
    setSuccess("");
  };

  const handleEditClick = (sweet: Sweet) => {
    setIsEditing(sweet);
    setName(sweet.name);
    setCategory(sweet.category);
    setPrice(sweet.price.toString());
    setQuantity(sweet.quantity.toString());
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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
      </div>

      {/* Create/Edit Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {isEditing ? "Edit Sweet" : "Add New Sweet"}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-md text-sm">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end"
        >
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
          <Input
            label="Price"
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
          <div className="flex gap-2">
            <Button type="submit" className="w-full">
              {isEditing ? (
                <Pencil className="w-4 h-4 mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {isEditing ? "Update" : "Add"}
            </Button>
            {isEditing && (
              <Button type="button" variant="secondary" onClick={resetForm}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Sweets Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : sweets.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No sweets found.
                  </td>
                </tr>
              ) : (
                sweets.map((sweet) => (
                  <tr key={sweet.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {sweet.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sweet.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${Number(sweet.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          sweet.quantity === 0
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {sweet.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setRestockId(sweet.id)}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEditClick(sweet)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(sweet.id)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal (Simple implementation) */}
      {restockId && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Restock Sweet
            </h3>
            <form onSubmit={handleRestock}>
              <Input
                label="Quantity to Add"
                type="number"
                min="1"
                value={restockAmount}
                onChange={(e) => setRestockAmount(e.target.value)}
                required
                autoFocus
              />
              <div className="mt-4 flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setRestockId(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">Restock</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
