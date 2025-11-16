import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export default async function loginHandler(req, res) {
    const { email, password } = req.body;

    // Find user by email or contact number
    const { data: user, error } = await req.supabase
        .from("users")
        .select("*")
        .or(`email.eq.${email},contactNumber.eq.${email}`)
        .single();

    console.log("User from DB:", user);

    if (!user || !user.password_hash) {
        return res.status(401).json({ message: "Invalid email/contact number or password." });
    }

    // --- NEW: Check status before password ---
    if (user.status === "inactive") {
        return res.status(403).json({
            message: "Your account is inactive. Please contact the clinic to reactivate your account."
        });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
        return res.status(401).json({ message: "Invalid email/contact number or password." });
    }

    // Generate JWT
    const token = jwt.sign(
        {   id: user.id, 
            email: user.email, 
            firstName: user.firstName,
            middleName: user.middleName,
            lastName: user.lastName,
            contactNumber: user.contactNumber,
            role: user.role,
            profile_picture: user.profile_picture
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
    console.log("JWT payload:", jwt.decode(token));

    res.json({ token });
}