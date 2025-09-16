import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export default async function loginHandler(req, res) {
    const { email, password } = req.body;

    // Find user by email
    const { data: user, error } = await req.supabase
        .from("users")
        .select("*")
        .or(`email.eq.${email},contactNumber.eq.${email}`)
        .single();

    // Only log after user is defined
    console.log("User from DB:", user);
    console.log("Password from form:", password);
    console.log("Password hash from DB:", user?.password_hash);

    if (!user || !user.password_hash) {
        return res.status(401).json({ message: "Invalid email/contact number or password." });
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
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );
    console.log("JWT payload:", jwt.decode(token));

    res.json({ token });
}