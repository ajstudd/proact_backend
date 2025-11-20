# ProactiveIndia Backend API

**ProactiveIndia Backend** is the server-side application powering the ProactiveIndia civic-tech platform. Built with Node.js, TypeScript, and Express, it provides a robust RESTful API infrastructure with AI-powered analysis capabilities using Google Gemini. The backend handles authentication, project management, corruption reporting, real-time notifications, and intelligent data analysis to support transparent governance and civic engagement.

**Deployed Link**: [ProactiveIndia](https://www.proactiveindia.site/)  
**Frontend Repository**: [proact_frontend](https://github.com/ajstudd/proact_frontend)

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technical Architecture](#technical-architecture)
- [AI & LLM Integration](#ai--llm-integration)
- [API Structure](#api-structure)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Tech Stack](#tech-stack)

## Project Overview

The ProactiveIndia backend serves as the core infrastructure for a platform that connects citizens, contractors, and government officials. It manages project tracking, feedback collection, anonymous corruption reporting, and provides AI-driven insights for governance accountability. The system is built with scalability, security, and maintainability in mind, featuring modular service architecture and comprehensive type safety.

## Features

- **JWT Authentication**: Secure token-based authentication with role-based access control
- **AI-Powered Report Analysis**: Intelligent corruption report validation, scoring, and summarization using Google Gemini 2.5 Flash
- **Project Management**: Complete CRUD operations for government projects with real-time updates
- **Anonymous Reporting System**: Secure corruption reporting with AI-assisted content moderation
- **Sentiment Analysis**: Real-time sentiment detection on public comments and feedback
- **File Management**: GridFS-based file storage for scalable image and document handling
- **Multi-channel Notifications**: Email (Nodemailer) and SMS (Twilio) integration for real-time alerts
- **Aggregate Analytics**: AI-generated project insights, risk assessment, and financial health analysis
- **Input Validation**: Joi-based schema validation for all API endpoints
- **Error Handling**: Centralized error management with custom HttpError helpers
- **Pagination Support**: Efficient data handling with middleware-based pagination

## Technical Architecture

### Core Technologies

- **Runtime**: Node.js with TypeScript for type-safe development
- **Framework**: Express.js with modular MVC architecture
- **Database**: MongoDB with Mongoose ODM for schema-based data modeling
- **File Storage**: GridFS for handling large files and images
- **Authentication**: JWT tokens with bcrypt password hashing
- **Validation**: Joi schema validation with custom validators
- **Image Processing**: Sharp for image optimization and manipulation
- **AI Integration**: Google Generative AI SDK (@google/genai)

### Project Structure

```
src/
├── controllers/     # Request handlers for all routes (13 controllers)
├── services/        # Business logic layer (16+ services)
├── models/          # Mongoose schemas (12+ data models)
├── routes/          # API endpoint definitions (13 route modules)
├── middlewares/     # Request processing and validation
├── validators/      # Joi validation schemas
├── types/           # TypeScript interfaces and type definitions
├── configs/         # Database and GridFS configuration
├── helpers/         # Utility functions and custom errors
└── utils/           # Environment and utility helpers
```

### Key Components

**Controllers**: Handle HTTP requests and responses

- Authentication, User, Project, Post, Comment controllers
- Corruption Report, Feedback, Notification controllers
- File Upload, Image, Like, OTP controllers
- Analysis controller for AI-generated insights

**Services**: Encapsulate business logic and external integrations

- AI Analysis service with Google Gemini integration
- Email service (Nodemailer) and SMS service (Twilio)
- Project Analysis service for aggregate metrics
- Report service with content moderation
- Upload service with file validation

**Models**: Define data schemas and relationships

- User (role-based: citizen/contractor/official)
- Project, Post, Comment, Like
- Report (corruption reports)
- Notification, Feedback, OTP
- ProjectAnalysis, AggregateAnalysis
- File, Image (GridFS metadata)

**Middlewares**: Request processing pipeline

- Authentication middleware (JWT verification)
- Validation middleware (Joi schema validation)
- Pagination middleware for efficient data retrieval
- Upload middleware (Multer with GridFS storage)
- Custom error handling middleware

## AI & LLM Integration

### Google Gemini Implementation

The backend leverages **Google Gemini 2.5 Flash** for multiple AI-powered features:

#### 1. Intelligent Corruption Report Analysis

**Multi-stage Content Moderation**:

- Inappropriate content detection (abusive language, hate speech)
- Context-aware validation (accepts legitimate corruption claims)
- Automatic filtering with manual review fallback

**AI-Powered Scoring & Analysis**:

- Severity scoring (1-10 scale based on impact)
- Automatic report summarization (max 100 words)
- Validity assessment and confidence scoring
- Tag generation for categorization
- Detection of missing information or incomplete reports

**Implementation Highlights**:

- Structured JSON responses with fallback parsing
- Multi-step analysis pipeline (moderation → scoring → summarization)
- Error-resilient workflows with graceful degradation
- Prompt engineering for consistent output format

#### 2. Sentiment Analysis Engine

**Real-time Comment Analysis**:

- Sentiment classification (positive/negative/neutral)
- Keyword-based fallback for API unavailability
- Integration with aggregate project analysis
- Public feedback sentiment tracking

#### 3. AI-Generated Project Insights

**Automated Project Health Dashboards**:

- Project summaries from contractor updates and reports
- Financial health analysis (budget vs expenditure tracking)
- Risk assessment with severity-based prioritization
- Aggregate sentiment analysis across all comments
- Progress tracking with AI-generated interpretations
- Actionable recommendations for government officials

**Advanced Features**:

- Multi-source data aggregation (comments, reports, updates, feedback)
- Context-aware prompt construction with project metrics
- Structured JSON output for frontend consumption
- Comprehensive error handling and fallback mechanisms

## API Structure

### Main Routes

- `/api/auth` - Authentication (login, register, password management)
- `/api/users` - User management and profile operations
- `/api/projects` - Project CRUD operations and tracking
- `/api/posts` - Contractor updates and project developments
- `/api/comments` - Public feedback and discussions
- `/api/likes` - Like/unlike functionality for posts and comments
- `/api/reports` - Corruption reporting with AI analysis
- `/api/feedback` - User feedback collection
- `/api/notifications` - Real-time notification management
- `/api/analysis` - AI-generated project insights and analytics
- `/api/images` - Image upload and retrieval (GridFS)
- `/api/files` - File upload and management (GridFS)
- `/api/otp` - OTP generation and verification

### Authentication Flow

1. User registration with role selection (citizen/contractor/official)
2. JWT token generation on successful login
3. Token verification middleware on protected routes
4. Role-based access control for sensitive operations

### File Upload Flow

1. Multer middleware for multipart/form-data handling
2. GridFS storage engine for scalable file management
3. Sharp integration for image optimization
4. Metadata storage in MongoDB with file references

## Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn package manager

### Steps

1. Clone the repository:

```bash
git clone https://github.com/ajstudd/proact_backend.git
cd proact_backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory (see Environment Variables section)

4. Build the TypeScript project:

```bash
npm run build
```

5. Start the development server:

```bash
npm run dev
```

6. For production:

```bash
npm start
```

The server will start on the configured port (default: 5000).

## Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/proactiveindia
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/proactiveindia

# JWT Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Google Gemini AI
GOOGLE_API_KEY=your_google_gemini_api_key

# Email Service (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## Scripts

- `npm run dev` - Start development server with hot reload (nodemon)
- `npm run build` - Compile TypeScript to JavaScript (outputs to `/build`)
- `npm start` - Run production server (requires build first)

## Tech Stack

**Core Technologies**:

- Node.js - JavaScript runtime
- TypeScript - Type-safe development
- Express.js - Web framework
- MongoDB - NoSQL database
- Mongoose - ODM for MongoDB

**Authentication & Security**:

- jsonwebtoken - JWT token generation
- bcryptjs - Password hashing
- cors - Cross-origin resource sharing

**AI & Analysis**:

- @google/genai - Google Gemini 2.5 Flash integration

**File Handling**:

- multer - Multipart form data handling
- gridfs-stream - GridFS file storage
- sharp - Image processing and optimization

**Communication**:

- nodemailer - Email service
- twilio - SMS notifications

**Validation & Utilities**:

- joi - Schema validation
- joi-phone-number - Phone number validation
- zod - Additional schema validation
- slugify - URL-friendly string generation

**Development Tools**:

- nodemon - Auto-restart on file changes
- ts-node - TypeScript execution
- eslint - Code linting
- prettier - Code formatting

**Additional Libraries**:

- axios - HTTP client for external API calls
- morgan - HTTP request logging
- dotenv - Environment variable management

---

**Repository**: [proact_backend](https://github.com/ajstudd/proact_backend)  
**Owner**: ajstudd  
**License**: ISC

For frontend implementation, visit: [proact_frontend](https://github.com/ajstudd/proact_frontend)
