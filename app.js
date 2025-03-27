const express = require('express')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')

const app = express()
const prisma = new PrismaClient()

dotenv.config()

let tokenValue = null
const secretKey = 'abc123'

app.use(express.json())

app.get('/', (req, res) => {
    res.send('Hi')
})

app.post('/login', async (req, res) => {
    const username = req.body.username
    const password = req.body.password

    const login = await prisma.register.findMany({
        where: {
            username: username
        }
    })

    const loginID = login[0].id
    const loginPassword = login[0].password

    if (password !== loginPassword) return res.json({err: 'Wrong Password'})

    tokenValue = jwt.sign(loginID, secretKey)
    res.send(tokenValue)    
})

app.post('/register', async (req, res) => {
    const username = req.body.username
    const password = req.body.password

    const register = await prisma.register.create({
        data: {
            username: username,
            password: password
        }
    })

    res.status(201).json({msg: 'Successfully Created', account: register})
})

app.get('/protected', async (req, res) => {
    try {
        const verified = jwt.verify(tokenValue, secretKey);
        console.log(verified)
        if (verified) {
            const user = await prisma.register.findUnique({
                where: {
                    id: parseInt(verified)
                },
                select: {
                    id: true,
                    username: true,
                    createdAt: true
                }
            })
            res.send(user)
        } else {
            // Access Denied
            return res.status(401).send(error);
        }
    } catch (error) {
        // Access Denied
        return res.status(401).send(error);
    }
})

app.listen(3000)