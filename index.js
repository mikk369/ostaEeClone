const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json())
var items = [
    { id: 1, name: "Tool", price: "6.99", description: "Tammepuidust tool" },
    { id: 2, name: "Kapp", price: "15.55", description: "Vanamoodne kapp" },
    { id: 3, name: "Laud", price: "59.99", description: "Led-gamer desk" },
]
const details = {
    username: "admin",
    password: "123"
}

var powers = false

app.get('/items', (req, res) => {
    res.send(items)
})

app.get('/items/:id', (req, res) => {
    if (typeof items[req.params.id - 1] === 'undefined') {
        return res.status(404).send({ error: "Items not found" })
    }
    res.send(items[req.params.id - 1])
})

app.post('/items', (req, res) => {
    if (!req.body.name || !req.body.price || !req.body.description) {
        return res.status(400).send({ error: 'One or all params are missing' })
    }
    let newItem = {
        id: items.length + 1,
        price: req.body.price,
        name: req.body.name,
        description: req.body.description
    }
    items.push(newItem)
    res.status(201).send(items)
})

app.get('/power', (req, res) => {
    res.send(powers)
})

app.post('/login', (req, res) => {
    console.log("hi")
    if (req.body.username == details.username && req.body.password == details.password) {
        powers = true
        res.send("true")
    } else
        res.send({ error: "wrong username or password" })
})

 app.post('/logout', (req, res) => {
    powers = false
})

app.listen(8080, () => {
    console.log(`API up at: http://localhost:8080`)
})
