const express = require('express');
const app = express();
const { createClient } = require('@supabase/supabase-js'); // Import Supabase client
app.use(express.json()); // Middleware to parse JSON bodies

// Load environment variables from .env file
require('dotenv').config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);