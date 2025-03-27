# Backend API for Roadmap Learning Platform

This is the backend service for the Roadmap Learning Platform, a web-based platform designed to help users achieve their learning goals through structured roadmaps. The backend handles user authentication, roadmap data management, progress tracking, and integration with external APIs.

## Features

- **User Authentication**: Secure user login and registration using JWT
- **Roadmap Management**: CRUD operations for roadmaps and their steps
- **Progress Tracking**: APIs to update and retrieve user progress
- **AI Integration**: Support for AI-powered chatbot interactions
- **Database Management**: MongoDB for storing user data, roadmaps, and progress

## Tech Stack

- **Node.js**: JavaScript runtime for building the backend
- **Express.js**: Web framework for creating RESTful APIs
- **MongoDB**: NoSQL database for storing application data
- **Mongoose**: ODM library for MongoDB
- **dotenv**: For managing environment variables
- **JWT**: For secure user authentication

## Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB instance
- Git

### Setup Instructions

1. Clone the repository:

   ```bash
   git clone <repo-url>
   cd Capstone
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory with the following:

   ```env
   MONGODB_URI=<your-mongodb-connection-string>
   PORT=4000
   JWT_SECRET=<your-jwt-secret-key>
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive a JWT token

### Roadmaps

- `GET /api/roadmaps` - Retrieve all roadmaps
- `POST /api/roadmaps` - Create a new roadmap
- `GET /api/roadmaps/:id` - Get a specific roadmap
- `PUT /api/roadmaps/:id` - Update a roadmap
- `DELETE /api/roadmaps/:id` - Delete a roadmap

### Progress Tracking

- `GET /api/progress/:userId` - Get user progress
- `PUT /api/progress/:userId` - Update user progress

## Folder Structure

```
backend/
├── models/            # Mongoose schemas and models
├── routes/            # Express route definitions
├── controllers/       # Business logic for routes
├── middleware/        # Authentication and error handlers
├── utils/             # Utility functions and helpers
├── .env.example       # Environment variables template
├── app.js             # Main application file
└── package.json       # Project dependencies
```

## Development

To run in development mode:

```bash
npm run dev
```

To run in production mode:

```bash
npm start
```
