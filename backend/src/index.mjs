import 'dotenv/config';
import express from "express";
import { createClient } from "@supabase/supabase-js";
import userRouter from './routes/users.mjs';
import cors from "cors";
import { supabaseMiddleware } from "./utils/middleware/middleware.mjs";
import patientsRouter from "./routes/patients.mjs";
import servicesRouter from "./routes/services.mjs";
import availabilityRouter from "./routes/availability.mjs"
import reservationRouter from "./routes/reservation.mjs";
import appointmentsRouter from "./routes/appointments.mjs";
import editProfileRouter from "./routes/editProfile.mjs";

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGN || "http://localhost:3000";

//Initalize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;   //From .env file
const supabaseKey = process.env.SUPABASE_KEY;   //From .env file
const supabase = createClient(supabaseUrl, supabaseKey); //Connect backend to database

//Middleware
app.use(cors({origin: CLIENT_ORIGIN }))
app.use(express.json());
app.use(supabaseMiddleware);

//Routes
app.use('/api/users', userRouter);
app.use("/api/patients", patientsRouter);
app.use("/api/services", servicesRouter);
app.use("/api/availability", availabilityRouter);
app.use("/api/reservation", reservationRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/edit-profile", editProfileRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

