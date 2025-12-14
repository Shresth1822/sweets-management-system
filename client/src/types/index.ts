export interface User {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
}

export interface Sweet {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  description?: string;
  image_url?: string;
}
