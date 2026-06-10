const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    type: { type: String, required: true }, // 'outstation', 'local', 'airport', 'rental'
    from: String,
    to: String,
    date: String,
    time: String,
    package: String, // For local
    hours: Number, // For rental
    vehicle: String, // For rental
    totalFare: Number, // For rental/fare estimator
    tripType: String, // 'round-trip' or 'one-way'
    contactName: String,
    contactPhone: String,
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', BookingSchema);
