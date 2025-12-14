const https = require("http");

const callApi = (path, method, token, body) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 3003,
      path: "/api" + path,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (token) {
      options.headers["Authorization"] = "Bearer " + token;
    }

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on("error", reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const run = async () => {
  try {
    // 1. Logic as Admin
    // Register unique admin
    const adminEmail = `admin_${Date.now()}@test.com`;
    console.log("Registering Admin:", adminEmail);
    const regAdmin = await callApi("/auth/register", "POST", null, {
      email: adminEmail,
      password: "password123",
      role: "ADMIN",
    });

    // Login Admin to get token
    const loginAdmin = await callApi("/auth/login", "POST", null, {
      email: adminEmail,
      password: "password123",
    });
    const adminToken = loginAdmin.body.token;
    console.log("Admin logged in. Token:", adminToken ? "YES" : "NO");

    // Check Stats as Admin
    const adminStats = await callApi("/inventory/stats", "GET", adminToken);
    console.log("Admin Stats (Expect revenue):", adminStats.body);

    // 2. Logic as User
    const userEmail = `user_${Date.now()}@test.com`;
    console.log("\nRegistering User:", userEmail);
    const regUser = await callApi("/auth/register", "POST", null, {
      email: userEmail,
      password: "password123",
      role: "USER",
    });

    // Login User
    const loginUser = await callApi("/auth/login", "POST", null, {
      email: userEmail,
      password: "password123",
    });
    const userToken = loginUser.body.token;
    console.log("User logged in. Token:", userToken ? "YES" : "NO");

    // Check Stats as User (Should be 0)
    const userStatsBefore = await callApi("/inventory/stats", "GET", userToken);
    console.log("User Stats Before Buy (Expect spent):", userStatsBefore.body);

    // Buy Item (Need a sweet ID first)
    // We can search for sweets
    const search = await callApi("/sweets/search", "GET", null);
    const sweet = search.body[0];
    if (sweet) {
      console.log(
        `Buying sweet: ${sweet.name} (ID: ${sweet.id}, Price: ${sweet.price})`
      );
      const buy = await callApi(
        `/inventory/${sweet.id}/purchase`,
        "POST",
        userToken,
        { quantityToBuy: 1 }
      );
      console.log("Buy Result:", buy.status, buy.body.message);

      // Check Stats as User (Should be Price * 1)
      const userStatsAfter = await callApi(
        "/inventory/stats",
        "GET",
        userToken
      );
      console.log("User Stats After Buy:", userStatsAfter.body);
    } else {
      console.log("No sweets found to buy.");
    }
  } catch (err) {
    console.error("Test failed:", err);
  }
};

run();
