const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json()); // JSON data read karne ke liye

// Test Route (Check karne ke liye ki backend chal raha hai ya nahi)
app.get('/', (req, res) => {
    res.json({ message: "GreenMark Backend API is running successfully! 🌱" });
});

// MAIN API: Carbon Footprint Calculator & AI Suggestions
app.post('/api/calculate-carbon', (req, res) => {
    try {
        const { electricity_units, delivery_kms, packaging_weight } = req.body;

        // Validation: Agar user data bhejna bhool jaye
        if (electricity_units === undefined || delivery_kms === undefined || packaging_weight === undefined) {
            return res.status(400).json({ error: "Please provide all required inputs." });
        }

        // --- CARBON EMISSION CALCULATION LOGIC (Standard Emission Factors) ---
        // 1 Unit Electricity = ~0.85 kg CO2
        const electricity_co2 = parseFloat((electricity_units * 0.85).toFixed(2));
        
        // 1 Km Delivery (Petrol/Diesel Avg) = ~0.21 kg CO2
        const delivery_co2 = parseFloat((delivery_kms * 0.21).toFixed(2));
        
        // 1 Kg Plastic/Normal Packaging = ~3.0 kg CO2
        const packaging_co2 = parseFloat((packaging_weight * 3.0).toFixed(2));

        // Total CO2 Footprint
        const total_co2 = parseFloat((electricity_co2 + delivery_co2 + packaging_co2).toFixed(2));

        // --- GREENSCORE GENERATION (Out of 100) ---
        // Kam CO2 = Behtar Score. Ek basic logic set kiya hai hackathon ke liye
        let green_score = 100 - Math.floor(total_co2 / 10);
        if (green_score < 10) green_score = 15; // Minimum score bracket
        if (green_score > 100) green_score = 100;

        // --- AI SUGGESTIONS LOGIC (Based on highest emission source) ---
        const suggestions = [];
        
        if (electricity_units > 50) {
            suggestions.push({
                title: "Switch to LED lighting & Star-rated appliances",
                benefit: "Save up to ₹2,400/mo · Reduces 8kg CO2"
            });
        }
        if (delivery_kms > 30) {
            suggestions.push({
                title: "Optimize delivery routes or use EV 2-Wheelers",
                benefit: "Save up to ₹1,800/mo · 12% fuel cut"
            });
        }
        if (packaging_weight > 10) {
            suggestions.push({
                title: "Switch to Biodegradable Cassava/Paper bags",
                benefit: "Same sourcing cost · 60% less plastic impact"
            });
        }

        // Default suggestion agar emission bohot kam ho
        if (suggestions.length === 0) {
            suggestions.push({
                title: "Keep it up! Maintain your low carbon operations.",
                benefit: "Eligible for Premium Green Certificate"
            });
        }

        // --- RESPONSE OUTPUT ---
        res.status(200).json({
            success: true,
            business_data: {
                electricity_co2_kg: electricity_co2,
                delivery_co2_kg: delivery_co2,
                packaging_co2_kg: packaging_co2,
                total_co2_kg: total_co2
            },
            green_score: green_score,
            ai_suggestions: suggestions
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Internal Server Error. Check code logic." });
    }
});

// Server Start
app.listen(PORT, () => {
    console.log(`🚀 Server is blasting off on port ${PORT}`);
});