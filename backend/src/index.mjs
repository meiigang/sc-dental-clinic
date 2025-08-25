import 'dotenv/config';
import express from "express";
import { createClient } from "@supabase/supabase-js";
import userRouter from './routes/users.mjs';
import cors from "cors";
import { supabaseMiddleware } from "./utils/middleware/middleware.mjs";

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGN || "http://localhost:3000";

//Initalize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;   //From .env file
const supabaseKey = process.env.SUPABASE_KEY;   //From .env file
const supabase = createClient(supabaseUrl, supabaseKey); //Connect backend to database

//Middleware
app.use(express.json());
app.use(supabaseMiddleware);
app.use(cors({origin: CLIENT_ORIGIN }))
app.use('/api/users', userRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

