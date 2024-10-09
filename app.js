const express = require('express')
const app = express()

const connectDatabase = require('./db')

const appRoutes = require('./routes/app.route')
connectDatabase()

// Middleware to parse JSON
app.use(express.json())
app.use('/api', appRoutes)

const PORT = process.env.PORT || 8080

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})