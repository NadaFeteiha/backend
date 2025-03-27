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

### Setup Instructions

1. Clone the repo `git clone <repo-url> <new-project-name>`
2. cd into your new project folder and run `npm i`
3. Remove previous git repo: `rm -rf .git`
4. Create a new `.env` file and add the `MONGODB_URI`
5. Run the app with: `npm run dev`

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
