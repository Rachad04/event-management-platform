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
      id: user.user_id || user.id,
      username: user.username,
      userType: user.user_type || user.userType,
      isAdmin: user.is_admin,
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
    if (!req.user.id) {
      throw new Error("Invalid token: Missing user ID");
    }
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
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

// Search for user by email
app.get("/api/users/search", authenticateToken, async (req, res) => {
  const { email } = req.query;

  try {
    const userQuery = `
      SELECT user_id, first_name, last_name, email_address, phone_number
      FROM users
      WHERE email_address = $1
    `;
    const user = await pool.query(userQuery, [email]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.rows[0]);
  } catch (error) {
    console.error("Error searching for user:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// GET
app.get("/api/users/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.id !== parseInt(req.params.id)) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const userQuery = `
      SELECT user_id, first_name, last_name, phone_number AS phone, 
             location, birthday, gender, email_address AS email 
      FROM users 
      WHERE user_id = $1
    `;
    const user = await pool.query(userQuery, [req.params.id]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.rows[0]);
  } catch (error) {
    console.error("Error fetching user data:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Sign Up Route
app.post(
  "/api/signup",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 8 }),
  ],
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract data
    const { email, userType, password, password2 } = req.body;

    try {
      // Perform all validations before database operations
      if (password !== password2) {
        return res.status(400).json({ message: "Passwords do not match" });
      }

      if (!userTypeIsValid(userType)) {
        return res.status(401).json({ message: "Invalid user type" });
      }

      // Check if user exists - use SELECT FOR UPDATE to prevent race conditions
      const userExists = await pool.query(
        "SELECT * FROM users WHERE email_address = $1 FOR UPDATE",
        [email]
      );

      if (userExists.rows.length > 0) {
        return res.status(409).json({ message: "User already exists" });
      }

      // Generate username
      const userName = getEmailUsername(email);

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert user into database within a transaction
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const newUser = await client.query(
          "INSERT INTO users (email_address, username, password, user_type) VALUES ($1, $2, $3, $4) RETURNING *",
          [email, userName, hashedPassword, userType]
        );
        await client.query("COMMIT");

        // Generate token
        const token = generateToken(newUser.rows[0]);

        res.status(201).json({
          token,
          user: {
            id: newUser.rows[0].user_id,
            username: newUser.rows[0].username,
          },
        });
      } catch (insertError) {
        await client.query("ROLLBACK");
        throw insertError;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ message: "Server error", error: error.message });
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

app.put("/api/users/:user_id", authenticateToken, async (req, res) => {
  const userId = parseInt(req.params.user_id);
  const { firstName, lastName, phone, location, birthday, gender } = req.body;

  try {
    if (req.user.id !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to modify this user's details" });
    }

    const updateQuery = `
      UPDATE users 
      SET first_name = COALESCE($1, first_name),
          last_name = COALESCE($2, last_name),
          phone_number = COALESCE($3, phone_number),
          location = COALESCE($4, location),
          birthday = COALESCE($5, birthday),
          gender = COALESCE($6, gender)
      WHERE user_id = $7
      RETURNING user_id, first_name, last_name, phone_number AS phone, 
                location, birthday, gender, email_address AS email
    `;
    const updatedUser = await pool.query(updateQuery, [
      firstName || null,
      lastName || null,
      phone || null,
      location || null,
      birthday || null,
      gender || null,
      userId,
    ]);

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Updated user details:", updatedUser.rows[0]); // Debugging line
    res.json(updatedUser.rows[0]);
  } catch (error) {
    console.error("Error updating user:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// apis for event dashboard page

// Get current user type
app.get("/api/user", authenticateToken, async (req, res) => {
  try {
    const userQuery = `
      SELECT user_id, username, user_type 
      FROM users 
      WHERE user_id = $1
    `;
    const user = await pool.query(userQuery, [req.user.id]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user.rows[0].user_id,
      username: user.rows[0].username,
      userType: user.rows[0].user_type,
      message: `Hello, ${user.rows[0].username}! This is a protected route.`,
    });
  } catch (error) {
    console.error("Error fetching user data:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all companies (for admin)
app.get("/api/companies", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const userTypeQuery = `
      SELECT user_type 
      FROM users 
      WHERE user_id = $1
    `;
    const userType = await pool.query(userTypeQuery, [req.user.id]);

    if (userType.rows[0].user_type !== "admin") {
      return res.status(403).json({ message: "Access denied: Admin only" });
    }

    const companiesQuery = `
      SELECT managing_company_id, company_name
      FROM managing_company
      ORDER BY company_name
    `;
    const companies = await pool.query(companiesQuery);

    res.json(companies.rows);
  } catch (error) {
    console.error("Error fetching companies:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get companies managed by current user
app.get("/api/companies/managed", authenticateToken, async (req, res) => {
  try {
    // First check if user is admin
    const userTypeQuery = `
      SELECT is_admin 
      FROM users 
      WHERE user_id = $1
    `;
    const userType = await pool.query(userTypeQuery, [req.user.id]);

    // Use different queries based on user type
    const companiesQuery =
      userType.rows[0].is_admin === true
        ? `
        SELECT DISTINCT mc.managing_company_id, mc.company_name
        FROM managing_company mc
        ORDER BY mc.company_name
      `
        : `
        SELECT DISTINCT mc.managing_company_id, mc.company_name
        FROM managing_company mc
        WHERE mc.representative_manager_id = $1
        ORDER BY mc.company_name
      `;

    const companies = await pool.query(
      companiesQuery,
      userType.rows[0].is_admin === true ? [] : [req.user.id]
    );

    res.json(companies.rows);
  } catch (error) {
    console.error("Error fetching managed companies:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get events for a specific company
app.get("/api/companies/:id/events", authenticateToken, async (req, res) => {
  try {
    // First check if user has access to this company
    const accessCheckQuery = `
      SELECT 1 
      FROM managing_company mc
      LEFT JOIN users u ON u.user_id = $1
      WHERE mc.managing_company_id = $2
      AND (
        mc.representative_manager_id = $1 
        OR u.is_admin = TRUE
      )
    `;
    const accessCheck = await pool.query(accessCheckQuery, [
      req.user.id,
      req.params.id,
    ]);

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ message: "Access denied" });
    }

    const eventsQuery = `
      SELECT e.event_id, e.event_type, e.date_of_event, e.location, 
             e.capacity, e.description
      FROM events e
      WHERE e.managing_company_id = $1
      ORDER BY e.date_of_event DESC
    `;
    const events = await pool.query(eventsQuery, [req.params.id]);

    res.json(events.rows);
  } catch (error) {
    console.error("Error fetching company events:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get users who purchased tickets for an event
app.get("/api/events/:id/users", authenticateToken, async (req, res) => {
  try {
    const accessCheckQuery = `
      SELECT 1 
      FROM events e
      JOIN managing_company mc ON mc.managing_company_id = e.managing_company_id
      LEFT JOIN users u ON u.user_id = $1
      WHERE e.event_id = $2
      AND (
        mc.representative_manager_id = $1 
        OR u.is_admin = true
      )
    `;
    const accessCheck = await pool.query(accessCheckQuery, [
      req.user.id,
      req.params.id,
    ]);

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ message: "Access denied" });
    }

    const usersQuery = `
      SELECT DISTINCT 
        u.user_id,
        u.first_name,
        u.last_name,
        u.email_address,
        u.phone_number
      FROM users u
      JOIN purchases p ON p.user_id = u.user_id
      WHERE p.event_id = $1
      ORDER BY u.last_name, u.first_name
    `;
    const users = await pool.query(usersQuery, [req.params.id]);

    res.json(users.rows);
  } catch (error) {
    console.error("Error fetching event users:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Add user to event
app.post("/api/events/:id/users", authenticateToken, async (req, res) => {
  const eventId = req.params.id;
  const { userId } = req.body;

  try {
    // Check if user has access to this event's company
    const accessCheckQuery = `
      SELECT 1 
      FROM events e
      JOIN managing_company mc ON mc.managing_company_id = e.managing_company_id
      LEFT JOIN users u ON u.user_id = $1
      WHERE e.event_id = $2
      AND (
        mc.representative_manager_id = $1 
        OR u.is_admin = true
      )
    `;
    const accessCheck = await pool.query(accessCheckQuery, [
      req.user.id,
      eventId,
    ]);

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Check if user is already in the event
    const existingUserQuery = `
      SELECT 1 FROM purchases
      WHERE event_id = $1 AND user_id = $2
    `;
    const existingUser = await pool.query(existingUserQuery, [eventId, userId]);

    if (existingUser.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "User already added to this event" });
    }

    // Add user to event
    const insertQuery = `
      INSERT INTO purchases (event_id, user_id, purchase_date)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
    `;
    await pool.query(insertQuery, [eventId, userId]);

    res.json({ message: "User added successfully" });
  } catch (error) {
    console.error("Error adding user to event:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Remove user from event
app.delete(
  "/api/events/:eventId/users/:userId",
  authenticateToken,
  async (req, res) => {
    const { eventId, userId } = req.params;

    try {
      // Check if user has access to this event's company
      const accessCheckQuery = `
      SELECT 1 
      FROM events e
      JOIN managing_company mc ON mc.managing_company_id = e.managing_company_id
      LEFT JOIN users u ON u.user_id = $1
      WHERE e.event_id = $2
      AND (
        mc.representative_manager_id = $1 
        OR u.is_admin = true
      )
    `;
      const accessCheck = await pool.query(accessCheckQuery, [
        req.user.id,
        eventId,
      ]);

      if (accessCheck.rows.length === 0) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Remove user from event
      const deleteQuery = `
      DELETE FROM purchases
      WHERE event_id = $1 AND user_id = $2
    `;
      await pool.query(deleteQuery, [eventId, userId]);

      res.json({ message: "User removed successfully" });
    } catch (error) {
      console.error("Error removing user from event:", error.message);
      res.status(500).json({ message: "Server error" });
    }
  }
);
