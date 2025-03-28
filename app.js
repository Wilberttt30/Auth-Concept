const express = require('express')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const { PrismaClient } = require('@prisma/client')

const app = express()
const prisma = new PrismaClient()

dotenv.config()

const secretKey = 'abc123'

app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
    res.send('Hi')
})

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

    res.status(201).json({msg: 'Successfully Created', account: register})
})

app.post('/login', async (req, res) => {
    const username = req.body.username
    const password = req.body.password

    if (username == "" || password == "") return res.json({err: 'Field must be filled!'})

    const login = await prisma.register.findMany({
        where: {
            username: username,
            password: password
        }
    })

    if (login.length == 0) return res.json({err: 'ID Not Found'})

    const loginID = login[0].id
    const loginPassword = login[0].password

    if (password !== loginPassword) return res.json({err: 'Wrong Password'})

    const tokenValue = jwt.sign(loginID, secretKey)
    res.cookie('token', tokenValue, {
        httpOnly: true
    })
    res.send('Cookie Set')
})

app.post('/login2', (req, res) => {
    const cookies = req.cookies
    res.send(cookies)
})

app.get('/protected', async (req, res) => {
    try {
        console.log(req.cookies.token)
        const verified = jwt.verify(req.cookies.token, secretKey);
        
        if (verified) {
            const user = await prisma.register.findUnique({
                where: { id: parseInt(verified) },
                select: { id: true, username: true, createdAt: true }
            })
            res.send(user)
        }
    } catch (error) {
        return res.json({err: 'Authenthication is invalid!'});
    }
})

app.get('/protected2', (req, res) => {
    const headersToken = req.headers.authorization
    const token = headersToken.split(" ")[1]
    
    res.send(token)
})

app.listen(3000, (err) => {
    if (err) console.log(err)
})