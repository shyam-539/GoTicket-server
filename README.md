# GoTicket - Movie Ticket Booking Application (Backend)

Welcome to the **GoTicket** project! 🎬🍿 This is the backend of the GoTicket Movie Ticket Booking Application, developed using the **MERN Stack** (MongoDB, Express, React, Node.js). GoTicket provides users with the ability to book movie tickets, and theater owners can manage their theaters and shows through the admin panel. 

---

## 🚀 Features

### **User Features**
- **User Registration & Login**: Secure user authentication with JWT.
- **Browse Movies**: Explore available movies and theaters.
- **Ticket Booking**: Select seats and book tickets online.
- **User Profile Management**: Update personal information and view past bookings.

### **Admin Features**
- **Admin Dashboard**: View statistics like users, theaters, bookings, and movies.
- **Manage Users**: Admin can update user roles and status.
- **Manage Theaters & Movies**: Admin can approve or reject theaters and movies.
- **Revenue Reports**: Track revenue with detailed analytics.
  
---

## 🛠 Technologies Used

- **Backend**: 
  - **Node.js**: JavaScript runtime built on Chrome's V8 JavaScript engine.
  - **Express.js**: Fast, unopinionated, minimalist web framework for Node.js.
  - **MongoDB**: NoSQL database for storing user, theater, movie, and booking data.
  - **JWT**: JSON Web Tokens for secure authentication.
  - **bcrypt.js**: Library for hashing passwords.
  - **dotenv**: Loads environment variables from a `.env` file.
  - **Mongoose**: ODM (Object Data Modeling) library for MongoDB and Node.js.
  - **Helmet**: Security middleware for HTTP headers to protect the app from common vulnerabilities.

- **Libraries**:
  - **axios**: Promise-based HTTP client for making requests to the API.
  - **cors**: Package for enabling Cross-Origin Request Sharing.
  - **express-validator**: Validation library for Express.js to validate inputs.
  - **cookie-parser**: Parse cookies for JWT-based authentication.

---

## 🏗️ Project Structure

The backend is organized into the following structure:
## 📌 **Backend**

```
/backend
│── src/
│   │── config/             # DB & Env Config
│   │── controllers/        # Request Handlers
│   │── models/             # Mongoose Schemas
│   │── middlewares/        # Auth & Error Handling
│   │── routes/             # API Endpoints
│   │── utils/              # Helpers (Email, Token)
│   │── server.js          # Express Server Entry
│── package.json           # Backend Dependencies
│── .env                   # Backend Env Variables

```

## 🔐 Authentication & Security

| Feature | Library / Package | Purpose |
| --- | --- | --- |
| 🔑 User Authentication | **Passport.js** / Firebase Auth | Secure login/signup |
| 🔒 Password Hashing | **bcrypt** | Secure password storage |
| 🛡️ Token Authentication | **jsonwebtoken (JWT)** | User sessions |
| 🏰 Security Middleware | **Helmet** | Secure HTTP headers |
| 🌍 CORS Handling | **CORS** | Cross-origin requests |
