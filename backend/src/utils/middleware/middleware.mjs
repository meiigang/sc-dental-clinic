import jwt from "jsonwebtoken"
import {createClient} from "@supabase/supabase-js";

//Middleware for verifying JWT
export function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next()
    })
}

//Supabase middleware
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export function supabaseMiddleware(req, res, next) {
  req.supabase = supabase;
  next();
}