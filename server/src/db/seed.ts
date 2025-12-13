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

    // Create Sweets
    const sweets = [
      ["Chocolate Fudge", "Fudge", 5.99, 50],
      ["Vanilla Bean Cupcake", "Cupcake", 3.5, 30],
      ["Gummy Bears", "Candy", 2.99, 100],
      ["Sour Worms", "Candy", 3.49, 75],
      ["Pistachio Baklava", "Pastry", 8.99, 20],
    ];

    for (const sweet of sweets) {
      await query(
        "INSERT INTO sweets (name, category, price, quantity) VALUES ($1, $2, $3, $4)",
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
