import axios from "axios";
import getBuffer from "../utils/buffer.js";
import sql from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { forgotPasswordTemplate } from "../utils/templete.js";
import { publishToTopic } from "../producer.js";
import { redisClient } from "../utils/redis.js";

export const registerUser = TryCatch(async (req, res, next) => {
  const {
    name: rawName,
    email: rawEmail,
    password,
    phoneNumber: rawPhoneNumber,
    role,
    bio,
  } = req.body;

  // 1. Validate required fields and their types
  if (
    typeof rawName !== "string" ||
    typeof rawEmail !== "string" ||
    typeof password !== "string" ||
    typeof rawPhoneNumber !== "string" ||
    typeof role !== "string"
  ) {
    throw new ErrorHandler(400, "Please provide valid registration details");
  }

  // 2. Normalize user input
  const name = rawName.trim();
  const email = rawEmail.trim().toLowerCase();
  const phoneNumber = rawPhoneNumber.trim();

  if (!name || !email || !password.trim() || !phoneNumber) {
    throw new ErrorHandler(400, "Please fill all the details");
  }

  // 3. Validate field lengths
  if (name.length > 255 || email.length > 255 || phoneNumber.length > 20) {
    throw new ErrorHandler(400, "One or more fields are too long");
  }

  // 4. Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new ErrorHandler(400, "Please provide a valid email address");
  }

  // 5. Validate password strength
  if (Array.from(password).length < 8) {
    throw new ErrorHandler(400, "Password must be at least 8 characters long");
  }

  // bcrypt only processes up to 72 bytes of password input
  if (Buffer.byteLength(password, "utf8") > 72) {
    throw new ErrorHandler(400, "Password is too long");
  }

  // 6. Validate role before database queries or file uploads
  if (role !== "recruiter" && role !== "jobseeker") {
    throw new ErrorHandler(400, "Invalid role");
  }

  // 7. Check for an existing account
  const existingUser = await sql`
    SELECT user_id
    FROM users
    WHERE email = ${email}
  `;

  if (existingUser.length > 0) {
    throw new ErrorHandler(409, "User already exists");
  }

  // 8. Hash password only after validation
  const hashedPassword = await bcrypt.hash(password, 10);

  let registeredUser;

  try {
    if (role === "recruiter") {
      const [user] = await sql`
        INSERT INTO users (
          name, email, password, phone_number, role
        )
        VALUES (
          ${name}, ${email}, ${hashedPassword},
          ${phoneNumber}, ${role}
        )
        RETURNING
          user_id, name, email, phone_number, role, created_at
      `;

      registeredUser = user;
    } else {
      // Jobseekers must provide a resume
      const file = req.file;

      if (!file) {
        throw new ErrorHandler(400, "Resume file is required for job seekers");
      }

      const fileBuffer = getBuffer(file);

      if (!fileBuffer?.content) {
        throw new ErrorHandler(500, "Failed to generate buffer");
      }

      let uploadData;

      try {
        const { data } = await axios.post(
          `${process.env.UPLOAD_SERVICE}/api/utils/upload`,
          { buffer: fileBuffer.content },
          { timeout: 15000 },
        );

        uploadData = data;
      } catch {
        throw new ErrorHandler(500, "Failed to upload resume");
      }

      if (!uploadData?.url || !uploadData?.public_id) {
        throw new ErrorHandler(500, "Invalid upload response");
      }

      const [user] = await sql`
        INSERT INTO users (
          name, email, password, phone_number, role,
          bio, resume, resume_public_id
        )
        VALUES (
          ${name}, ${email}, ${hashedPassword}, ${phoneNumber},
          ${role}, ${bio ?? null}, ${uploadData.url},
          ${uploadData.public_id}
        )
        RETURNING
          user_id, name, email, phone_number, role,
          bio, resume, created_at
      `;

      registeredUser = user;
    }
  } catch (error) {
    // Handle duplicate-email races using the database constraint
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      throw new ErrorHandler(409, "User already exists");
    }

    throw error;
  }

  if (!registeredUser) {
    throw new ErrorHandler(500, "Failed to register user");
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new ErrorHandler(500, "Authentication configuration error");
  }

  const token = jwt.sign({ id: registeredUser.user_id }, jwtSecret, {
    expiresIn: "15d",
  });

  return res.status(201).json({
    message: "User registered successfully",
    registeredUser,
    token,
  });
});

export const loginUser = TryCatch(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ErrorHandler(400, "Please fill all the details");
  }
  const normalizedEmail = email.trim().toLowerCase();

  const user = await sql`
        SELECT u.user_id, u.name, u.email, u.password, u.phone_number, u.role, u.bio, u.resume, u.profile_pic, u.subscription, ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) AS skills FROM users u LEFT JOIN user_skills us ON u.user_id = us.user_id LEFT JOIN skills s ON us.skill_id = s.skill_id WHERE u.email = ${normalizedEmail} GROUP BY u.user_id
    `;
  if (user.length === 0) {
    throw new ErrorHandler(401, "Invalid credentials");
  }

  const userObject = user[0];

  const matchPassword = await bcrypt.compare(password, userObject?.password);

  if (!matchPassword) {
    throw new ErrorHandler(401, "Invalid credentials");
  }

  if (userObject) {
    userObject.skills = userObject.skills || [];
  }

  delete userObject?.password;

  const token = jwt.sign(
    { id: userObject?.user_id },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "15d",
    },
  );

  res.json({
    message: "User login successfully",
    userObject,
    token,
  });
});

export const forgotPassword = TryCatch(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    throw new ErrorHandler(400, "Email is required");
  }

  const users = await sql`
        SELECT user_id, email FROM users WHERE email = ${email}
    `;

  if (users.length === 0) {
    return res.json({
      message:
        "If that email exist in our system, you will receive a password reset link",
    });
  }

  const user = users[0];

  const resetToken = jwt.sign(
    {
      email: user?.email,
      type: "reset-password",
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "15m",
    },
  );

  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  await redisClient.set(`forgot:${email}`, resetToken, { EX: 900 });

  const message = {
    to: email,
    subject: "Reset Your Password - HireHeaven",
    html: forgotPasswordTemplate(resetLink),
  };

  publishToTopic("send-mail", message).catch((error) => {
    console.log("Failed to publish message", error);
  });

  res.json({
    message:
      "If that email exist in our system, you will receive a password reset link",
  });
});

export const resetPassword = TryCatch(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  let decoded: any;

  try {
    decoded = jwt.verify(token as string, process.env.JWT_SECRET as string);
  } catch (error) {
    throw new ErrorHandler(400, "Invalid or expired token");
  }
  if (decoded.type !== "reset-password") {
    throw new ErrorHandler(400, "Invalid token type");
  }
  const email = decoded.email;

  const storedToken = await redisClient.get(`forgot:${email}`);
  if (!storedToken || storedToken !== token) {
    throw new ErrorHandler(400, "Token has been expired");
  }

  const users = await sql`
    SELECT user_id, email FROM users WHERE email = ${email}
  `;

  if (users.length === 0) {
    throw new ErrorHandler(404, "User not found");
  }

  const user = users[0];

  if (!password?.trim() || Array.from(password).length < 8) {
    throw new ErrorHandler(400, "Password must be at least 8 characters long");
  }
  if (Buffer.byteLength(password, "utf8") > 72) {
    throw new ErrorHandler(400, "Password is too long");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await sql`
    UPDATE users SET password = ${hashedPassword} WHERE user_id = ${user?.user_id}
  `;

  await redisClient.del(`forgot:${email}`);

  res.json({
    message: "Password reset successfully",
  });
});
