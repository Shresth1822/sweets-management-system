export interface User {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
}

export interface Sweet {
  id: string;
  name: string;
  category: string;
  price: number; // Stored as string or number in DB? Driver returns string if DECIMAL, but we cast
  quantity: number;
}
