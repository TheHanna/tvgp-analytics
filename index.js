const express = require('express')
const routes = require('@paciolan/express-easy-routes')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 3000

app.use(cors())

routes({ app, path: __dirname + '/**/*.controller.js'})

app.listen(port, err => err ? console.log(err) : console.log(`server is listening on port ${port}`))
