require("dotenv").config(); // Load .env first

const express = require("express");
const path = require("path");
const cors = require("cors");
const connectToMongo = require("./database/db");

connectToMongo();

const app = express();

// Correct port assignment
const port = process.env.PORT || 4000;

// CORS configuration
const frontendURL = process.env.FRONTEND_API_LINK || "*";
app.use(cors({ origin: frontendURL }));

// JSON middleware
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Hello 👋 I am Working Fine 🚀");
});

// Static media folder
app.use("/media", express.static(path.join(__dirname, "media")));

// API routes
app.use("/api/admin", require("./routes/details/admin-details.route"));
app.use("/api/faculty", require("./routes/details/faculty-details.route"));
app.use("/api/student", require("./routes/details/student-details.route"));

app.use("/api/branch", require("./routes/branch.route"));
app.use("/api/subject", require("./routes/subject.route"));
app.use("/api/notice", require("./routes/notice.route"));
app.use("/api/timetable", require("./routes/timetable.route"));
app.use("/api/material", require("./routes/material.route"));
app.use("/api/exam", require("./routes/exam.route"));
app.use("/api/marks", require("./routes/marks.route"));

// Start server
app.listen(port, () => {
  console.log(`Server Listening On http://localhost:${port}`);
});

// Temporary debug to verify env
console.log("Mongo URI:", process.env.MONGODB_URI);
