db = db.getSiblingDB("TechRadar");

const existingUsers = db.users.countDocuments();

if (existingUsers === 0) {
  print("No users found. Creating default admin user...");

  db.users.insertOne({
    firstName: "Admin",
    lastName: "User",
    email: "admin@example.com",
    password: "$2a$10$P2SIpRx2Ez2KtA/SWEI.x.WE8yarP6fL1o9M6HVh1byIzoBfKdyqi", // Admin123!
    role: "Administrator",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  print("Default admin user created!");
} else {
  print("Users already exist. Skipping seeding.");
}