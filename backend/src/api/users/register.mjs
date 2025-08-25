import bcrypt from "bcrypt";

export default async function registerHandler(req, res) {
    //Get user input from request body
    const { lastName, firstName, middleName, suffix, email, contact, password } = req.body;

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
            last_name: lastName,
            first_name: firstName,
            middle_name: middleName,
            suffix,
            email,
            contact,
            password: hashedPassword,
        }
    ]);

    if (error) {
    return res.status(500).json({ message: "Registration failed" });
  }

  res.json({ message: "Registration successful" });
}