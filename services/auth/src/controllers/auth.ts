import axios from "axios";
import getBuffer from "../utils/buffer.js";
import sql from "../utils/db.js";
import ErrorHandler from "../utils/errorHandler.js";
import { TryCatch } from "../utils/TryCatch.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser = TryCatch(async(req, res, next) => {
    const {name, email, password, phoneNumber, role, bio} = req.body;
    if(!name || !email || !password || !phoneNumber || !role ) {
        throw new ErrorHandler(400, "Please fill all the details");
    }

    const existingUser = await sql`
        SELECT user_id FROM users WHERE email = ${email}
    `;

    if(existingUser.length > 0) {
        throw new ErrorHandler(409, "User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let registeredUser;

    if(role === "recruiter") {
        const [user] = await sql`
            INSERT INTO users (name, email, password, phone_number, role)
            VALUES (${name}, ${email}, ${hashedPassword}, ${phoneNumber}, ${role})
            RETURNING user_id, name, email, phone_number, role created_at
        `;
        registeredUser = user;
    } else if(role === "jobseeker") { 
        const file = req.file;
        if(!file) {
            throw new ErrorHandler(400, "Resume file is required for job seekers");
        }
        const fileBuffer = getBuffer(file);
        if(!fileBuffer || !fileBuffer.content) {
            throw new ErrorHandler(500, "Failed to generate buffer");
        }
        const {data} = await axios.post(`${process.env.UPLOAD_SERVICE}/api/utils/upload`, {
            buffer: fileBuffer.content
        });
        console.log("data:", data);
        const [user] = await sql`
            INSERT INTO users (name, email, password, phone_number, role, bio, resume, resume_public_id)
            VALUES (${name}, ${email}, ${hashedPassword}, ${phoneNumber}, ${role}, ${bio}, ${data.url}, ${data.public_id}) RETURNING user_id, name, email, phone_number, role, bio, resume, created_at
        `;
        registeredUser = user;
    }

    const token = jwt.sign({id: registeredUser?.user_id}, process.env.JWT_SECRET as string, {
        expiresIn: "15d"
    });


    res.json({
        message: "User registered successfully",
        user: registeredUser,
        token
    })
});