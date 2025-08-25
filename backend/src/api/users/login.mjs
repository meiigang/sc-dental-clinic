import bcrypt from "bcrypt";

export default async function loginHandler(req, res) {
    const {email, password} = req.body;

    //Find user by email
    const {data: user, error} = await req.supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

    if(!user){
        return res.status(401).json({message: "Invalid email or password."});
    }

    //Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.status(401).json({message: "Invalid email or password."});
    }

    res.json({ message: "Login successful", user: { id: user.id, email: user.email}});
}

