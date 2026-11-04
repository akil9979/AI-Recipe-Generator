# AI Recipe Generator

A full-stack recipe management application that helps users generate recipes using available ingredients, manage pantry inventory, save recipes, plan weekly meals, and organize shopping lists.

## Overview

AI Recipe Generator is built using the PERN stack (PostgreSQL, Express.js, React, and Node.js). It integrates Google's Gemini API to generate recipes based on ingredients and user preferences.

The application brings recipe generation, pantry management, meal planning, and grocery organization into one place.

## Features

### Authentication
- User registration and login
- Password hashing with bcrypt
- JWT-based authentication
- Protected application routes

### Pantry Management
- Add and manage pantry ingredients
- Track quantities, categories, and expiry dates
- Identify ingredients that are running low
- View ingredients approaching their expiry date

### AI Recipe Generation
- Generate recipes from manually entered ingredients
- Use pantry ingredients as recipe inputs
- Customize cuisine, dietary preferences, servings, and cooking time
- View recipe instructions and nutritional information

### Recipe Collection
- Save generated recipes
- Browse and search saved recipes
- View recipe details
- Manage saved recipes

### Meal Planner
- Organize meals using a weekly calendar
- Assign saved recipes to breakfast, lunch, and dinner
- Add and remove planned meals

### Shopping List
- Add shopping items manually
- Generate a list from planned meals
- Mark items as purchased
- Move checked items into the pantry

### User Settings
- Update profile information
- Manage dietary restrictions and cuisine preferences
- Configure default servings and measurement units
- Change account password

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript |
| Styling | Tailwind CSS |
| Routing | React Router |
| HTTP Client | Axios |
| State Management | React Context API |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Database Client | node-postgres (`pg`) |
| Authentication | JWT, bcryptjs |
| AI Integration | Google Gemini API |

## Project Structure

```text
AI-Recipe-Generator/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── migrate.js
│   └── server.js
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       ├── App.jsx
│       └── main.jsx
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js
- npm
- PostgreSQL database
- Google Gemini API key

### 1. Clone the repository

```bash
git clone https://github.com/akil9979/AI-Recipe-Generator.git
cd AI-Recipe-Generator
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
PORT=8000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

Run the database migration:

```bash
node migrate.js
```

Start the backend development server:

```bash
npm run dev
```

### 3. Set up the frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend` directory:

```env
VITE_API_URL=http://localhost:8000/api
```

Start the frontend:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` by default, and the backend API at `http://localhost:8000/api`.

## Environment Variables

Never commit real credentials or `.env` files.

Use the provided `.env.example` files as configuration templates and replace their placeholder values locally.

## Future Improvements

- Improve navigation and page-loading performance
- Add automated tests for frontend and backend workflows
- Improve error handling and loading states
- Add recipe recommendations and nutritional analytics
- Explore responsive mobile enhancements

## Acknowledgements

This project was developed using the PERN stack and Google's Gemini API. It builds on an existing project/reference implementation; original contributors and applicable licence notices should be credited according to the source repository's licence.

## License

See the repository's `LICENSE` file for the applicable licence and terms.
