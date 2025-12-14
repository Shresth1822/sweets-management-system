import { query } from "./index";
import bcrypt from "bcryptjs";

const seed = async () => {
  try {
    console.log("Seeding database...");

    // Clear existing data (optional, be careful in production)
    await query("DELETE FROM sweets");
    await query("DELETE FROM users");

    // Create Admin User
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await query(
      "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)",
      ["admin@sweets.com", hashedPassword, "ADMIN"]
    );
    console.log("Admin user created (admin@sweets.com / admin123)");

    // Create Sweets (Indian Context)
    const sweets = [
      [
        "Gulab Jamun",
        "Milk Solids",
        250.0,
        100,
        "Soft, deep-fried berry-sized balls made of milk solids and flour, soaked in rose flavored sugar syrup.",
        "https://images.unsplash.com/photo-1541781777621-3916fa1be0fd?q=80&w=400&auto=format&fit=crop",
      ],
      [
        "Kaju Katli",
        "Cashew",
        800.0,
        50,
        "A diamond-shaped sweet made with cashew nuts, sugar, cardamom powder, and ghee butter.",
        "https://images.unsplash.com/photo-1579372786145-3916fa1be0fd?q=80&w=400&auto=format&fit=crop",
      ],
      [
        "Rasgulla",
        "Milk Solids",
        150.0,
        120,
        "Syrupy dessert popular in the Indian subcontinent. It is made from ball-shaped dumplings of chhena and semolina, cooked in light syrup made of sugar.",
        "https://images.unsplash.com/photo-1589119908995-c6837fa14848?q=80&w=400&auto=format&fit=crop",
      ],
      [
        "Besan Ladoo",
        "Flour",
        350.0,
        80,
        "Creamy, golden-hued, spherical desserts made with gram flour, ghee, sugar, and cardamom.",
        "https://images.unsplash.com/photo-1596560548464-f010549b84d7?q=80&w=400&auto=format&fit=crop",
      ],
      [
        "Jalebi",
        "Flour",
        200.0,
        60,
        "A popular sweet snack made by deep-frying maida flour batter in pretzel or circular shapes, which are then soaked in sugar syrup.",
        "https://images.unsplash.com/photo-1567327613485-fbc7bf196191?q=80&w=400&auto=format&fit=crop",
      ],
      [
        "Soan Papdi",
        "Flour",
        400.0,
        45,
        "A popular North Indian dessert. It is usually cube-shaped or served as flakes, and has a crisp and flaky texture.",
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=400&auto=format&fit=crop",
      ],
    ];

    for (const sweet of sweets) {
      await query(
        "INSERT INTO sweets (name, category, price, quantity, description, image_url) VALUES ($1, $2, $3, $4, $5, $6)",
        sweet
      );
    }
    console.log("Initial sweets inventory added.");

    console.log("Seeding completed successfully.");
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
};

seed();
