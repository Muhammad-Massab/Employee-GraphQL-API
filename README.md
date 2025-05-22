# 🧑‍💼 Employee GraphQL API

A clean and scalable GraphQL API built with Node.js, designed to manage employee data including personal info, subjects, attendance, authentication, pagination, and role-based access.

---

## 🚀 Tech Stack

- Node.js
- Express
- Apollo Server (GraphQL)
- MongoDB (via Mongoose)
- JWT Authentication
- Role-based Access Control (Admin & Employee)
- Caching, Pagination & Sorting
- Helmet, CORS, Compression
- ESM Module Support

---

## 📦 Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/en/) (v18 or above recommended)
- [npm](https://www.npmjs.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or local MongoDB
- Git

---

## ⚙️ Installation & Setup

1. **Clone the Repository**

```bash
git clone https://github.com/Muhammad-Massab/Employee-GraphQL-API.git
cd Employee-GraphQL-API
```

2. **Install Dependencies**

```bash
npm install
```

3. **Environment Variables**

Create a .env file in the root directory and add the following:

```bash
MONGODB_URI=your-mongodb-url
JWT_SECRET=any-secret-key
```

4. **Start the Server (Development Mode)**

```bash
npm run dev
```

The server should now be running at:

```bash
http://localhost:4000/graphql
```
