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
    { id: user.id, userType: user.userType },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
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

// Example in Express.js
app.get("/api/users/:user_id", async (req, res) => {
  const userId = req.params.user_id;
  const user = await UserModel.findById(userId); // Adjust based on your DB

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
});

// Protected Route Example
app.get("/api/user", authenticateToken, (req, res) => {
  res.json({
    message: `Hello, ${req.user.username}! This is a protected route.`,
  });
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
