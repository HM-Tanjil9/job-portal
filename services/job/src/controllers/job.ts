import axios from "axios";
import type { AuthenticatedRequest } from "../middleware/user.js";
import getBuffer from "../utils/buffer.js";
import sql from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";

export const createCompany = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    if (!user) {
      throw new ErrorHandler(401, "Authentication required");
    }

    if (user.role !== "recruiter") {
      throw new ErrorHandler(
        403,
        "Forbidden: Only recruiters can create company",
      );
    }
    const { name, description, website } = req.body;
    if (!name || !description || !website) {
      throw new ErrorHandler(400, "All fields are required");
    }
    const existCompany = await sql`
      SELECT company_id FROM companies WHERE name = ${name}
    `;
    if (existCompany.length > 0) {
      throw new ErrorHandler(400, `A company with name ${name} already exists`);
    }

    const file = req.file;
    if (!file) {
      throw new ErrorHandler(400, "Company logo file is required");
    }
    const fileBuffer = getBuffer(file);
    if (!fileBuffer || !fileBuffer.content) {
      throw new ErrorHandler(500, "Failed to process file");
    }
    const { data } = await axios.post(
      `${process.env.UPLOAD_SERVICE}/api/utils/upload`,
      {
        buffer: fileBuffer.content,
      },
    );
    const [newCompany] = await sql`
        INSERT INTO companies (name, description, website_url, logo, logo_public_id, recruiter_id)
        VALUES (${name}, ${description}, ${website}, ${data.url}, ${data.public_id}, ${req.user?.user_id})
        RETURNING *
    `;
    res.json({ message: "Company created successfully", company: newCompany });
  },
);
