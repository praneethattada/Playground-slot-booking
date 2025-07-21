# Playground Slot Booking System

This is a full-stack web application designed to streamline the process of booking slots for sports playgrounds. The system features separate interfaces for regular users and administrators, ensuring a secure and manageable booking experience.

## Features

* **User Authentication**: Secure sign-up and login functionality for users.
* **Admin Authentication**: Separate and secure login for administrators.
* **City & Playground Browse**: Users can browse through different cities and view the playgrounds available in each.
* **Slot Booking**: Authenticated users can select a date and book available time slots for any playground.
* **Booking Confirmation**: Users receive a confirmation of their booking with all relevant details.
* **Admin Dashboard**: Admins can view all cities and playgrounds.
* **Slot Management**: Admins can add new available slots for any playground on any date.
* **Booking Management**: Admins can view all user bookings and have the ability to edit or delete them.

---
## Tech Stack

This project is built on the **MERN** stack with additional libraries for enhanced functionality and security.

### Frontend
* **React.js**: For building the user interface.
* **React Router**: For client-side routing and navigation.
* **Axios**: For making API requests to the backend.
* **SweetAlert2**: For clean and user-friendly pop-up notifications.
* **Material-UI (MUI)**: For UI components like the Date Picker and Checkboxes.

### Backend
* **Node.js**: As the JavaScript runtime environment.
* **Express.js**: As the web application framework.
* **MongoDB**: As the NoSQL database for storing data.
* **JSON Web Tokens (JWT)**: For secure user and admin authentication.
* **Bcrypt.js**: For securely hashing passwords.
* **Dotenv**: For managing environment variables.
* **Helmet**: For securing Express apps by setting various HTTP headers.

---
## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

* Node.js installed on your machine.
* MongoDB installed and running locally, or a connection string to a cloud instance (like MongoDB Atlas).

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <your-repository-url>
    cd <your-project-directory>
    ```

2.  **Set up the Backend Server**:
    * Navigate to the server directory (e.g., `cd server`).
    * Install the dependencies:
        ```bash
        npm install
        ```
    * Create a file named `.env` in the server's root directory.
    * Add the following environment variables to your `.env` file:
        ```env
        PORT=3003
        MONGODB_URI=mongodb://localhost:27017/project
        JWT_SECRET=your_super_secret_key_for_jwt
        ```
    * Start the server:
        ```bash
        node server.js
        ```
    * The server should now be running on `http://localhost:3003`.

3.  **Set up the Frontend Client**:
    * Navigate to the client directory (e.g., `cd client`).
    * Install the dependencies:
        ```bash
        npm install
        ```
    * Start the React development server:
        ```bash
        npm start
        ```
    * The application should now be running and open in your browser at `http://localhost:3000`.