const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// 🧠 AI Carbon Tracker Endpoint
app.post("/analyze", async (req, res) => {
  try {
    const userInput = req.body.text;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a carbon footprint expert. Analyze user lifestyle and give CO2 impact + eco-friendly suggestions in simple points."
          },
          {
            role: "user",
            content: userInput
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    res.json({
      result: response.data.choices[0].message.content
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "AI request failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
app.post("/analyze", (req, res) => {
  res.json({
    result: "Carbon Score: 6.5kg CO2/day 🌱 Improve transport usage"
  });
});