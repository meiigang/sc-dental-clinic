// Set up the Express server and routes for authentication using Supabase
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

//Login route
router.post('/login', async (req, res) => {

});

//Register route