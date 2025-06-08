QuizApp – Node.js Backend
A backend service for QuizApp built using Node.js, Express, and MongoDB.

🚀 Getting Started
📦 Prerequisites
Before you begin, ensure you have the following installed:

Node.js (v14 or higher recommended)

npm

MongoDB (running locally or accessible remotely)

├── config/
│   └── appConfig/
│       └── dbConnection here       # MongoDB URI and other config
├── .env                   # Environment variables
├── app.js              # Entry point
├── package.json
└── README.md


⚙️ Configuration
MongoDB
The app connects to MongoDB using the following URI:
mongodb://localhost:27017/QuizApp?authSource=admin


📌 Useful Scripts
npm start – Starts the server using Node.js


🛠️ Tech Stack
Node.js – Server runtime

Express.js – Web framework

MongoDB – Database