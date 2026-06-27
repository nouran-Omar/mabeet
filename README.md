# Mabeet - Full-Stack Property Booking Platform

Mabeet is a comprehensive full-stack property booking platform designed to connect property owners with users. It features a robust backend API built with ASP.NET Core and a dynamic, framework-free frontend dashboard for property owners.

[![.NET](https://img.shields.io/badge/.NET-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![SQL Server](https://img.shields.io/badge/SQL_Server-CC2927?style=for-the-badge&logo=microsoft-sql-server&logoColor=white)](https://www.microsoft.com/en-us/sql-server)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)

---

## 🏛️ Project Architecture

The project follows a modern client-server architecture, separating the frontend presentation layer from the backend business logic and data layer.

### Backend (`/MabeetApi`)

A powerful RESTful API built with **ASP.NET Core**. It is responsible for:

- User authentication and authorization using JWT.
- Business logic for managing users, accommodations, and bookings.
- Data persistence using Entity Framework Core with a SQL Server database.
- Serving data to the frontend client.

➡️ **View Backend README for full details**

### Frontend (`/Froant`)

A client-side dashboard built with **Vanilla JavaScript, HTML, and Bootstrap**. It provides an interface for property owners to:

- Log in securely to their accounts.
- Perform full CRUD (Create, Read, Update, Delete) operations on their properties.
- Upload images for their listings.
- View their managed accommodations.

➡️ **View Frontend README for full details**

---

## 🚀 Getting Started

To run the full application, you need to run both the backend and frontend services simultaneously.

1.  **Start the Backend:**
    - Navigate to the `/MabeetApi` directory.
    - Follow the instructions in its `README.md` to configure the database and run the server.

2.  **Start the Frontend:**
    - Navigate to the `/Froant` directory.
    - Follow the instructions in its `README.md` to configure the API connection and launch the application in your browser.

This separation allows for independent development, scaling, and deployment of the client and server.
