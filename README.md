# BROWNSON

**Transforming Food Supply with Seamless Innovation**

Brownson is an all-in-one developer platform that combines a user-friendly e-commerce storefront with real-time production management, built on a scalable MERN stack architecture. It enables developers to craft engaging, efficient online shopping experiences while streamlining operational workflows.

### Why Brownson?

This project empowers developers to build comprehensive e-commerce solutions with integrated admin dashboards, real-time order processing, and seamless backend services. The core features include:

* **Modular MERN Stack:** Ensures scalable, maintainable architecture for complex applications.
* **Admin Management:** Provides interfaces for product, order, user, and review oversight.
* **Real-Time Interactions:** Supports live production updates and chatbot communication.
* **Secure Payments:** Integrates Stripe for smooth, secure transaction processing.
* **Centralized State Management:** Uses Redux to maintain a cohesive user experience across the platform.

### Built with the tools and technologies:

![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![JSON](https://img.shields.io/badge/JSON-000000?style=for-the-badge&logo=json&logoColor=white)
![Markdown](https://img.shields.io/badge/Markdown-000000?style=for-the-badge&logo=markdown&logoColor=white)
![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-800000?style=for-the-badge&logo=mongoose&logoColor=white)
![.ENV](https://img.shields.io/badge/.ENV-FFFFFF?style=for-the-badge&logo=dotenv&logoColor=black)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Nodemon](https://img.shields.io/badge/Nodemon-76D04B?style=for-the-badge&logo=nodemon&logoColor=white)
![React Bootstrap](https://img.shields.io/badge/React%20Bootstrap-781582?style=for-the-badge&logo=react-bootstrap&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-60A4F6?style=for-the-badge&logo=stripe&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-781582?style=for-the-badge&logo=bootstrap&logoColor=white)

---

## Development Methodology

We embrace an **Agile PRINCE2** hybrid methodology for this project. This approach combines the rigorous, structured governance and well-defined project management principles of PRINCE2 with the iterative, flexible, and adaptive nature of Agile development. This balanced strategy ensures clear project direction, effective risk management, and the agility to quickly respond to evolving requirements and integrate continuous feedback.

## Getting Started (For Developers)

To set up and run this project on your local machine for development, follow these steps:

### Prerequisites

Please ensure you have the following software installed on your system:

* **Node.js**: [LTS version recommended](https://nodejs.org/en/download/)
* **npm** (Node Package Manager) or **Yarn**: (Usually comes with Node.js installation, or [install Yarn separately](https://yarnpkg.com/)).
* **MongoDB**: Either a [local MongoDB installation](https://www.mongodb.com/try/download/community) or access to a cloud-hosted service like [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

### Installation & Setup

1.  **Clone the Repository:**
    Start by getting a local copy of the project:
    ```bash
    git clone [https://github.com/YourUsername/Brownson.git](https://github.com/YourUsername/Brownson.git) # Replace with your actual repository URL
    cd Brownson
    ```

2.  **Backend Configuration:**
    Navigate into the `backend` directory and install its dependencies. You'll also need to set up your environment variables.
    ```bash
    cd backend
    npm install # or yarn install
    ```
    Create a `.env` file within the `backend/config/` directory (e.g., `backend/config/config.env`). Populate it with your database connection string, JWT secrets, port numbers, and any other necessary backend variables.
    *(Tip: Check for a `config.env.example` file in the `backend/config` folder for guidance on required variables.)*

3.  **Frontend Configuration:**
    Move back to the project root and then into the `frontend` directory to install its dependencies.
    ```bash
    cd ../frontend
    npm install # or yarn install
    ```
    Create a `.env` file (e.g., `frontend/.env.local` or `frontend/.env`) in the `frontend` directory. Add any frontend-specific environment variables, such as your API base URL (`REACT_APP_API_URL=http://localhost:4000`).

### Running the Application Locally

You'll need two separate terminal windows for the backend and frontend.

1.  **Start the Backend Server:**
    In your first terminal, navigate to the `backend` directory and run:
    ```bash
    cd backend
    npm start # or yarn start
    ```
    You should see a message indicating the backend server is running (typically on `http://localhost:4000`).

2.  **Start the Frontend Development Server:**
    In your second terminal, navigate to the `frontend` directory and run:
    ```bash
    cd frontend
    npm start # or yarn start
    ```
    This will usually open the frontend application automatically in your default web browser at `http://localhost:3000`.

## Project Structure

This repository is organized into distinct, manageable parts:

* **`backend/`**: Contains the robust Node.js/Express.js API that powers the application. [Learn more about the Backend](./backend/README.md)
* **`frontend/`**: Houses the interactive React.js user interface. [Explore the Frontend](./frontend/README.md)
* **`Testing/`**: Dedicated to our comprehensive Playwright end-to-end test suite. [Dive into Testing Details](./Testing/README.md)

## Contributing

We welcome contributions to the Brownson project! If you'd like to get involved, please follow these general steps:

1.  Fork the repository.
2.  Create a new feature branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes, ensuring tests pass and code adheres to style guidelines.
4.  Commit your changes with a clear, concise message (`git commit -m 'feat: Implement new user authentication flow'`).
5.  Push your branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request describing your changes.

## License

This project is licensed under the MIT License. See the `LICENSE` file in the project root for full details.
