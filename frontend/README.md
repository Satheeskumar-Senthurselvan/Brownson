# Brownson Frontend Application

This directory contains the user-facing part of the Brownson E-commerce & Production Management System, built with React.js.

## Purpose

The frontend application provides the interactive interface for users (customers and potentially internal staff) to:
* Browse products and view details.
* Add items to a shopping cart.
* Complete the checkout process.
* Manage user profiles and view order history.
* (If applicable) Access dashboards or tools for production management (admin view).

## Technologies Used

* **React.js**: The core library for building our user interface.
* **React Router Dom**: For handling client-side routing and navigation.
* **React Bootstrap**: Our primary UI framework for responsive and pre-styled components.
* **State Management**: (e.g., React Context API for global state, or Redux if used).
* **Axios**: For making HTTP requests to the backend API.
* **CSS/Sass Modules**: (Mention if you use CSS Modules, Sass, or a specific styling approach).

## Component Structure Overview

The React application is structured into logical components, typically found in `src/components`, `src/pages`, `src/assets`, etc.

* `src/App.js`: The main application component where routes are defined.
* `src/index.js`: The entry point for the React application.
* `src/components/`: Reusable UI elements (e.g., `Header`, `ProductCard`, `Footer`).
* `src/pages/`: Top-level components representing different views/pages (e.g., `HomePage`, `ProductPage`, `CartPage`, `LoginPage`).
* `src/utils/`: Utility functions.
* `src/context/` or `src/redux/`: (If applicable) Contains state management logic.

## Running the Frontend Locally

To run the frontend application on its own:

1.  **Ensure your Backend API is running first** (usually on `http://localhost:4000`).
2.  **Navigate to the `frontend` directory:**
    ```bash
    cd /path/to/your/Brownson/frontend
    ```
3.  **Ensure all dependencies are installed:**
    ```bash
    npm install # or yarn install
    ```
4.  **Set up your environment variables (if any):**
    Make sure your `frontend/.env.local` (or `.env`) file has `REACT_APP_API_URL` pointing to your backend (e.g., `REACT_APP_API_URL=http://localhost:4000`).
5.  **Start the development server:**
    ```bash
    npm start # or yarn start
    ```
    This will usually open the application in your browser at `http://localhost:3000`.

## Contributing to the Frontend

Please see the [main project README.md](../../README.md) for general contribution guidelines.