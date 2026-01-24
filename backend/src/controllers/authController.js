const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Mock OTP storage (In production, use Redis or DB)
// Format: { "1234567890": "1234" }
const otpStore = {};

exports.login = async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    // Generate OTP (For hackathon, always 1234)
    const otp = '1234';
    otpStore[phone] = otp;

    console.log(`Generated OTP for ${phone}: ${otp}`);

    // In a real app, send SMS here.

    res.json({ message: 'OTP sent successfully', otp: otp }); // Sending OTP in response for demo
};

exports.verifyOTP = async (req, res) => {
    const { phone, otp, name } = req.body; // Name is optional, used for signup if new

    console.log('--- Verify OTP Request ---');
    console.log('Received Body:', req.body);
    console.log('Stored OTP for ' + phone + ':', otpStore[phone]);
    console.log('Store Keys:', Object.keys(otpStore));

    if (!phone || !otp) {
        return res.status(400).json({ error: 'Phone and OTP are required' });
    }

    // Soft comparison in case of string/number diff, though body-parser usually handles JSON types
    if (String(otpStore[phone]) !== String(otp)) {
        console.log('Mismatch: ' + otpStore[phone] + ' !== ' + otp);
        return res.status(401).json({ error: 'Invalid OTP' });
    }

    try {
        // Check if user exists
        let userResult = await db.query('SELECT * FROM users WHERE phone = $1', [phone]);
        let user = userResult.rows[0];

        // If request includes name and user doesn't exist, create user
        // OR if user doesn't exist, create with valid default or require name
        if (!user) {
            // Simple signup flow: if no user, create one. 
            // We'll default name to Phone if not provided, or handle it properly.
            const userName = name || `User ${phone.slice(-4)}`;
            const insertResult = await db.query(
                'INSERT INTO users (phone, name) VALUES ($1, $2) RETURNING *',
                [phone, userName]
            );
            user = insertResult.rows[0];
        }

        // Clean up OTP
        delete otpStore[phone];

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, phone: user.phone },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                phone: user.phone,
                name: user.name
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
};
