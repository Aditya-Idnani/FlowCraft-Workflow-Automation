import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = express.Router();

// TEMP IN-MEMORY USER
const users = [
  {
    id: "1",
    email: "userA@test.com",
    passwordHash: bcrypt.hashSync("password123", 10),
  },
];

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: "1h" }
  );

  // ✅ CRITICAL CHANGE
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "none", // 🔥 REQUIRED for cross-site (3000 → 5050)
    secure: false,    // allowed on localhost
  });

  res.json({
    user: { id: user.id, email: user.email },
  });
});

export default router;
