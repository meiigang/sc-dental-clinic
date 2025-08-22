// Set up the Express server and routes for authentication using Supabase
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('@supabase/supabase-js');

const router = express.Router();

//Helper to sign JWT
function signToken(payload){
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

//Middleware to protect routes
function requiresAuth(req, res, next){
    const token = req.cookies.token;
    if(!token)
        return res.status(401).json({ error: 'Unauthorized' });
}