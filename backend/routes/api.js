const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const Booking = require('../models/Booking');
const Contact = require('../models/Contact');

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Helper for sending admin emails
const sendAdminEmail = async (subject, text) => {
    if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@example.com') return;
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: subject,
            text: text
        });
    } catch (err) {
        console.error('Email error:', err);
    }
};

// Rate limiting for booking and contact form submissions to prevent spam
const submissionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: { success: false, error: 'Too many requests from this IP. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Input sanitization helper to prevent form injection and XSS
const sanitizeString = (str) => {
    if (typeof str !== 'string') return '';
    // Strip HTML tags and trim
    return str.replace(/<[^>]*>/g, '').replace(/[&<>"']/g, '').trim();
};

// Validate phone number format (must be 10-15 digits, allowing optional + prefix)
const isValidPhone = (phone) => {
    if (!phone) return false;
    const cleanPhone = phone.replace(/[\s-()]/g, '');
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    return phoneRegex.test(cleanPhone);
};

// Validate date is today or in the future
const isValidDate = (dateStr) => {
    if (!dateStr) return false;
    const bookingDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return !isNaN(bookingDate.getTime()) && bookingDate >= today;
};

// POST /api/booking
router.post('/booking', submissionLimiter, async (req, res) => {
    try {
        // Sanitize and validate inputs
        const body = req.body;
        const type = sanitizeString(body.type);
        const contactName = sanitizeString(body.contactName);
        const contactPhone = sanitizeString(body.contactPhone);
        const date = sanitizeString(body.date);
        const time = sanitizeString(body.time);

        if (!contactName || !contactPhone || !date || !time) {
            return res.status(400).json({ success: false, error: 'Name, Phone, Date, and Time are required.' });
        }

        if (!isValidPhone(contactPhone)) {
            return res.status(400).json({ success: false, error: 'Please enter a valid 10-15 digit phone number.' });
        }

        if (!isValidDate(date)) {
            return res.status(400).json({ success: false, error: 'Booking date cannot be in the past.' });
        }

        const bookingData = {
            type,
            from: sanitizeString(body.from),
            to: sanitizeString(body.to),
            date,
            time,
            package: sanitizeString(body.package),
            hours: Number(body.hours) || undefined,
            vehicle: sanitizeString(body.vehicle),
            totalFare: Number(body.totalFare) || undefined,
            tripType: sanitizeString(body.tripType),
            contactName,
            contactPhone,
        };

        const newBooking = new Booking(bookingData);
        await newBooking.save();
        
        await sendAdminEmail(
            'New Booking Received',
            `New ${type} booking received.\nDetails: ${JSON.stringify(bookingData, null, 2)}`
        );

        res.status(201).json({ success: true, booking: newBooking });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/contact
router.post('/contact', submissionLimiter, async (req, res) => {
    try {
        const body = req.body;
        const name = sanitizeString(body.name);
        const phone = sanitizeString(body.phone);
        const email = sanitizeString(body.email);
        const message = sanitizeString(body.message);

        if (!name || !phone || !message) {
            return res.status(400).json({ success: false, error: 'Name, Phone, and Message are required.' });
        }

        if (!isValidPhone(phone)) {
            return res.status(400).json({ success: false, error: 'Please enter a valid 10-15 digit phone number.' });
        }

        const contactData = { name, phone, email, message };
        const newContact = new Contact(contactData);
        await newContact.save();

        await sendAdminEmail(
            'New Contact Message',
            `New message from ${name}.\nPhone: ${phone}\nMessage: ${message}`
        );

        res.status(201).json({ success: true, contact: newContact });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Simple Admin Authentication Middleware
const requireAdmin = (req, res, next) => {
    const password = req.headers['x-admin-password'];
    if (password === process.env.ADMIN_PASSWORD) {
        next();
    } else {
        res.status(401).json({ success: false, error: 'Unauthorized' });
    }
};

// GET /api/bookings
router.get('/bookings', requireAdmin, async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, bookings });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
