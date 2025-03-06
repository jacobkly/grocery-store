
# Grocery Store Management System

This project is a **Grocery Store Management System** for the final project submission of TCSS 445 at the University of Washington Tacoma. The system uses a **React frontend** with **TypeScript** and a **Node.js backend**. The database is set up with **MS SQL Server** to store data.

## Prerequisites

Before running the project, ensure the following software is installed:

- **Node.js**: Required for running the backend server and frontend client.
- **SQL Server**: The database system for storing all project data.

You can download the required tools here:
- [Node.js](https://nodejs.org/)
- [Microsoft SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)

## Setup Instructions

Follow these steps to get the system up and running on your local machine.

### 1. **Clone the Repository**

First, clone the repository to your local machine:

```bash
git clone https://github.com/jacobkly/grocery-store.git
cd grocery-store
```

### 2. **Set Up the Database**

You will need to configure the database in **MS SQL Server**. Ensure your MS SQL Server instance is running.

- Use the `klymenko-chapkin_jacob-anthony_queries.sql` script to create and use the `klymenko_chapkin_jacob_anthony_db' database in **SQL Server Management Studio**
- From the same script file mentioned above, execute the SQl statements to create the tables and input the data. Do **NOT** execute the entire script as it contains test queries towards the bottom to reset the database.

### 3. **Configure the `.env` File**

In the server directory of the project, create a `.env` file with the following content to configure the database connection using the SQL Server Authentication method on SQL Server Management Studio for Microsoft SQL Server:

```plaintext
PORT=3000

DB_USER=<your_db_user>
DB_PASSWORD=<your_db_password>
DB_SERVER=<your_db_server>
DB_DATABASE='klymenko_chapkin_jacob_anthony_db'
DB_PORT=1433
```

### 4. **Install Dependencies**

There are two parts to this project: the **client** (React frontend) and the **server** (Node.js backend). You will need to install dependencies for both parts.

#### 4.1 **Install Server Dependencies**

Navigate to the `server` directory and install the necessary dependencies:

```bash
cd server
npm install
```

#### 4.2 **Install Client Dependencies**

Next, navigate to the `client` directory and install the frontend dependencies:

```bash
cd ../client
npm install
```

### 5. **Running the Application**

To run the application, you will need to start both the backend server and the frontend client in separate terminals.

#### 5.1 **Start the Server**

In the `server` directory, run the following command:

```bash
cd server
npm run dev
```

This will start the backend server on the port specified in the `.env` file (default: 3000).

#### 5.2 **Start the Client**

In a new terminal, navigate to the `client` directory and run the following command:

```bash
cd client
npm run dev
```

This will start the Vite development server for the frontend, and the application should be accessible at:

```plaintext
http://localhost:5173/
```

### 6. **Testing the Application**

Once both the client and server are running, you can begin testing the system. Visit the Vite server at `http://localhost:5173/` and test the typical scenario and analytical queries.

## Troubleshooting

- Ensure your **MS SQL Server** is running and accessible.
- Double-check the **.env** file for correct database credentials (server name, database name, username, password).
- If the client or server is not starting, verify that all dependencies are correctly installed using `npm install` in both directories.
