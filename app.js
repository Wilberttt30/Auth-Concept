const express = require('express')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const { PrismaClient } = require('@prisma/client')
const { log } = require('console')

const app = express()
const prisma = new PrismaClient()

dotenv.config()

const secretKey = 'abc123'

app.use(express.json())
app.use(cookieParser())

app.post('/register', async (req, res) => {
    const username = req.body.username
    const password = req.body.password

    if (username == "" || password == "") return res.json({err: 'Field must be filled!'})

    const register = await prisma.register.create({
        data: {
            username: username,
            password: password
        }
    })
    console.log(register)

    res.status(201).json({msg: 'Registration Sucessful', account: register})
})

app.post('/login', async (req, res) => {
    const username = req.body.username
    const password = req.body.password

    if (username == "" || password == "") return res.json({err: 'Field must be filled!'})

    const login = await prisma.register.findFirst({
        where: {
            username: username
        }
    })

    if (login == null) return res.json({err: 'ID Not Found'})

    const loginID = login.id
    const loginUsername = login.username
    const loginPassword = login.password

    if (username !== loginUsername) return res.json({message: 'Invalid Username'})
    if (password !== loginPassword) return res.json({message: 'Wrong Password'})


    // Generate Token
    const tokenValue = jwt.sign({ id: loginID }, secretKey, { expiresIn: '1h' })
    console.log(tokenValue)

    res.cookie('cookie', tokenValue, {
        httpOnly: true,
        expires: new Date(Date.now() + 3600000)
    })

    res.status(201).json({message: 'Cookie Generated'})
})

app.post('/login2', (req, res) => {
    const cookies = req.cookies
    if (!cookies) return res.status(404).json({message: 'Cookies Not Found!'})
    res.status(200).json({ message: 'Get Token Success' })
})

app.get('/protected', async (req, res) => {
    const cookie = req.cookies.cookie
    var decoded = jwt.verify(cookie, secretKey)
    if (!decoded.id) return res.status(404).json({message: 'Authenthication Invalid!'})
    const user = await prisma.register.findUnique({
        where: {
            id: decoded.id
        }
    })
    res.status(200).json({message: 'Authenthication Sucess'})
})

app.get('/protected2', (req, res) => {
    const headersToken = req.headers.authorization
    const headersCookie = req.headers.cookie

    const token = headersToken.split(" ")[1]
    const cookie = headersCookie.split("=")[1]

    if (token !== cookie) return res.status(401).json({message: 'Invalid Authentication!'})
    
    res.status(202).json({message: 'User Authenthication'})
})

app.listen(3000, (err) => {
    if (err) console.log(err)
})