const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

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

// Configure nodemailer
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  debug: true, // Enable debug logs
  logger: true, // Enable logging
  maxConnections: 1,
  maxMessages: 1,
  connectionTimeout: 10000, // 10 seconds
});

// Test connection
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Verification Error:", error);
  } else {
    console.log("Server ready for emails");
  }
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

const createResetTokensTable = `
  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE
  );
  
  CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
`;

// Initialize database tables when server starts
const initDatabase = async () => {
  try {
    await pool.query(createResetTokensTable);
    console.log("Password reset tokens table initialized");
  } catch (error) {
    console.error("Database initialization error:", error);
    process.exit(1); // Exit if table creation fails
  }
};

// Generate a secure random token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString("hex");
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

// Backend: Add this to your server.js file
app.put(
  "/api/users/:id/password",
  authenticateToken,
  [
    body("currentPassword").exists(),
    body("newPassword").isLength({ min: 8 }),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Password confirmation does not match");
      }
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = parseInt(req.params.id);
    const { currentPassword, newPassword } = req.body;

    try {
      // Verify user is changing their own password
      if (req.user.id !== userId) {
        return res
          .status(403)
          .json({ message: "Not authorized to change this user's password" });
      }

      // Get current user's password hash
      const userQuery = "SELECT password FROM users WHERE user_id = $1";
      const user = await pool.query(userQuery, [userId]);

      if (user.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(
        currentPassword,
        user.rows[0].password
      );
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      const updateQuery = "UPDATE users SET password = $1 WHERE user_id = $2";
      await pool.query(updateQuery, [hashedPassword, userId]);

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error changing password:", error.message);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Forgot Password endpoint
app.post(
  "/api/forgot-password",
  [body("email").isEmail().normalizeEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
      // Find user
      const userResult = await pool.query(
        "SELECT user_id, email_address FROM users WHERE email_address = $1",
        [email]
      );

      if (userResult.rows.length === 0) {
        // Don't reveal if email exists
        return res.json({
          message:
            "If an account exists with this email, a password reset link will be sent.",
        });
      }

      const user = userResult.rows[0];
      const token = generateResetToken();
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

      // Store token in database
      await pool.query(
        "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
        [user.user_id, token, expiresAt]
      );

      // Send email
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

      const mailOptions = {
        from: process.env.SMTP_FROM,
        to: email,
        subject: "Password Reset Request",
        html: `
        <h1>Password Reset Request</h1>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
      };

      await transporter.sendMail(mailOptions);

      res.json({
        message:
          "If an account exists with this email, a password reset link will be sent.",
      });
    } catch (error) {
      console.error("Error in forgot password:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Reset Password endpoint
app.post(
  "/api/reset-password",
  [body("token").trim().notEmpty(), body("newPassword").isLength({ min: 8 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, newPassword } = req.body;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Find valid token
      const tokenResult = await client.query(
        `SELECT user_id, expires_at 
       FROM password_reset_tokens 
       WHERE token = $1 AND used = FALSE`,
        [token]
      );

      if (tokenResult.rows.length === 0) {
        return res
          .status(400)
          .json({ message: "Invalid or expired reset token" });
      }

      const resetToken = tokenResult.rows[0];

      // Check if token is expired
      if (new Date() > new Date(resetToken.expires_at)) {
        return res.status(400).json({ message: "Reset token has expired" });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password
      await client.query("UPDATE users SET password = $1 WHERE user_id = $2", [
        hashedPassword,
        resetToken.user_id,
      ]);

      // Mark token as used
      await client.query(
        "UPDATE password_reset_tokens SET used = TRUE WHERE token = $1",
        [token]
      );

      await client.query("COMMIT");
      res.json({ message: "Password successfully reset" });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error in reset password:", error);
      res.status(500).json({ message: "Server error" });
    } finally {
      client.release();
    }
  }
);

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
      SELECT 
        event_id,
        title,
        description,
        date,
        location,
        image_url,
        price,
        quantity,
        banner,
        event_type,
        capacity,
        created_at
      FROM events
      WHERE managing_company_id = $1
      ORDER BY date DESC, created_at DESC
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
        u.phone_number,
        p.purchase_date
      FROM users u
      JOIN purchases p ON p.user_id = u.user_id
      WHERE p.event_id = $1
      ORDER BY p.purchase_date DESC
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
      SELECT e.quantity
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

    const event = accessCheck.rows[0];
    if (event.quantity <= 0) {
      return res.status(400).json({ message: "Event is sold out" });
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

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Add user to event
      const insertQuery = `
        INSERT INTO purchases (event_id, user_id, purchase_date)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
      `;
      await client.query(insertQuery, [eventId, userId]);

      // Update event quantity
      const updateQuery = `
        UPDATE events
        SET quantity = quantity - 1
        WHERE event_id = $1
      `;
      await client.query(updateQuery, [eventId]);

      await client.query("COMMIT");
      res.json({ message: "User added successfully" });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
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

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

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
        await client.query("ROLLBACK");
        return res.status(403).json({ message: "Access denied" });
      }

      // Remove user from event
      const deleteQuery = `
      DELETE FROM purchases
      WHERE event_id = $1 AND user_id = $2
    `;
      await client.query(deleteQuery, [eventId, userId]);

      // Update event quantity
      const updateQuery = `
      UPDATE events
      SET quantity = quantity + 1
      WHERE event_id = $1
    `;
      await client.query(updateQuery, [eventId]);

      await client.query("COMMIT");
      res.json({ message: "User removed successfully" });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error removing user from event:", error.message);
      res.status(500).json({ message: "Server error" });
    } finally {
      client.release();
    }
  }
);

// GET purchased events by a user
app.get("/api/users/:id/events", authenticateToken, async (req, res) => {
  try {
    const userEvents = await pool.query(
      `
      SELECT e.* 
      FROM events e
      JOIN purchases p ON p.event_id = e.event_id
      WHERE p.user_id = $1
      ORDER BY e.date DESC
    `,
      [req.params.id]
    );

    res.json(userEvents.rows);
  } catch (error) {
    console.error("Error fetching user events:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(port, async () => {
  await initDatabase();
  console.log(`Server running on port ${port}`);
});

// Get all events
app.get("/api/events", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM events");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get ticket information for a specific event
app.get("/api/tickets/:id", async (req, res) => {
  const eventId = req.params.id;
  try {
    const result = await pool.query("SELECT * FROM tickets WHERE event_id = $1", [eventId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Payment processing (placeholder)
app.post("/api/pay", async (req, res) => {
  const { ticketId, paymentMethod } = req.body;
  try {
    // Payment integration logic will go here
    res.json({ message: "Payment successful!", ticketId, paymentMethod });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Payment processing failed" });
  }
});
