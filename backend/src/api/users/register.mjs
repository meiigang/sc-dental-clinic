import bcrypt from "bcrypt";

export default async function registerHandler(req, res) {

    console.log("Incoming registration data:", req.body); // Log the data

    //Get user input from request body
    const { lastName, firstName, middleName, suffix, email, contactNumber, password, role } = req.body;

    //Check if user already exists in database
    const {data: existing} = await req.supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

    if (existing) {
        return res.status(409).json({ message: "User with this email already exists."});
    }

    //Hash user password
    const hashedPassword = await bcrypt.hash(password, 10);

    //Insert user
    const {error} = await req.supabase.from("users").insert([
        {
            lastName: lastName,
            firstName: firstName,
            middleName: middleName,
            nameSuffix: suffix,
            email,
            contactNumber: contactNumber,
            password_hash: hashedPassword,
            created_at: new Date().toISOString(),
            role: role || "patient" //Default user role, staff to change at database directly
        }
    ]);

    if (error) {
        console.error("Supabase insert error:", error);
        return res.status(500).json({ message: "Registration failed" });
  }

  res.json({ message: "Registration successful" });
}