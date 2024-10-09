# Backend for Blog Application

## Overview

This backend is built using Node.js and Express.js, and it connects to a MongoDB database. It provides a RESTful API for managing blog posts and user authentication.

## Features

- User registration and authentication with JWT
- CRUD operations for blog posts
- Role-based access control (author/admin)
- Pagination for blog post listings
- Increment view counts for each blog post

## Technologies Used

- **Node.js**: JavaScript runtime for building server-side applications
- **Express.js**: Web framework for Node.js to build APIs
- **MongoDB**: NoSQL database to store user and blog data
- **Mongoose**: ODM (Object Data Modeling) library for MongoDB
- **Joi**: Data validation library
- **MD5**: Hashing function for passwords

## Installation

### Prerequisites

- [Node.js](http://nodejs.org) (version 14 or higher)
- [MongoDB](https://www.mongodb.com/) (local installation or cloud service)

### Setup the Backend App
- Clone the Repository
```bash
git clone https://github.com/rajsinghlodhi08/blogging-backend.git

   ```
   - Go inside backend directory: 
   ```bash
   cd blogging-backend
   ```
   - Install node_modules using command: 
   ```bash
   $ npm install
   ```
   
   ### Configure Environment
   - Open `blogging-backend/.env_example` then rename it with `.env`

   ### Running the project
   - Start a server using command:
   ```bash 
   npm start
   ```
*Note: To run the preceding commands, [Node.js](http://nodejs.org) and [npm](https://npmjs.com) must be installed.*

