const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

dotenv.config();

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Pool setup
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.user_id || user.id, // Use user_id or id, whichever is available
      username: user.username,
      userType: user.user_type || user.userType,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Attach user data to request object
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

// Utility function to extract username from email
const getEmailUsername = (email) => {
  if (typeof email !== "string") return null;
  const [username] = email.split("@");
  return username || null;
};

const userTypeIsValid = (type) => {
  switch (type) {
    case "user":
      return true;
    case "company":
      return true;
    case "sponsor":
      return true;
  }
  return false;
};

// GET
app.get("/api/users/:id", authenticateToken, async (req, res) => {
  if (req.user.id !== parseInt(req.params.id)) {
    return res.status(403).json({ message: "Unauthorized access" });
  }

  const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [
    req.params.id,
  ]);

  if (!user.rows[0]) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user.rows[0]);
});

// Sign Up Route
app.post(
  "/api/signup",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 8 }),
  ],
  async (req, res) => {
    console.log("got request");

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    console.log("validated input");

    // Extract data
    const { email, userType, password, password2 } = req.body;

    console.log("extracted data");

    try {
      if (password != password2) {
        return res.status(400).json({ message: "Passwords do not match" });
      }

      if (!userTypeIsValid(userType)) {
        return res
          .status(401)
          .json({ message: "The user type isn't a valid type" });
      }
      console.log("validated data");

      // Check if user exists
      const userExists = await pool.query(
        "SELECT * FROM users WHERE email_address = $1",
        [email]
      );
      console.log("checked existance");

      if (userExists.rows.length > 0) {
        return res.status(402).json({ message: "User already exists" });
      }

      // Generate username
      const userName = getEmailUsername(email);

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      console.log("hashed password");

      // Insert user into database
      const newUser = await pool.query(
        "INSERT INTO users (email_address, username, password, user_type) VALUES ($1, $2, $3, $4) RETURNING *",
        [email, userName, hashedPassword, userType]
      );
      console.log("inserted new user");

      // Generate token
      const token = generateToken(newUser.rows[0]);
      console.log("generated token");

      res.status(201).json({ token });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  }
);

// Login Route
app.post(
  "/api/login",
  [body("email").isEmail().normalizeEmail(), body("password").exists()],
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract data
    const { email, password } = req.body;

    try {
      // Check if user exists
      const user = await pool.query(
        "SELECT * FROM users WHERE email_address = $1",
        [email]
      );

      if (user.rows.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const existingUser = user.rows[0];

      // Compare passwords
      const isMatch = await bcrypt.compare(password, existingUser.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate token
      const token = generateToken(existingUser);

      res.json({ token });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  }
);

// Protected Route Example
app.get("/api/user", authenticateToken, (req, res) => {
  console.log("Authenticated user:", req.user); // Debugging line

  // Check if req.user is populated correctly
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "No user authenticated" });
  }

  // Return a message with authenticated user info
  res.json({
    message: `Hello, ${
      req.user.username || "undefined"
    }! This is a protected route.`,
  });
});

// Add this endpoint to your existing Express server code

app.put("/api/users/:user_id", authenticateToken, async (req, res) => {
  const userId = req.params.user_id;
  const { firstName, lastName, phone, location, birthday, gender } = req.body;

  try {
    // First verify that the authenticated user matches the user_id
    if (req.user.id !== parseInt(userId)) {
      return res
        .status(403)
        .json({ message: "Not authorized to modify this user's details" });
    }

    // Update user details
    const updatedUser = await pool.query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone),
           location = COALESCE($4, location),
           birthday = COALESCE($5, birthday),
           gender = COALESCE($6, gender)
       WHERE user_id = $7
       RETURNING *`,
      [firstName, lastName, phone, location, birthday, gender, userId]
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser.rows[0]);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
