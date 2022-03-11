const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());        // Avoid CORS errors in browsers
app.use(express.json()) // Populate req.body

const items = [
    { id: 1, name: "Tool", price: 6.99, desc: "Tammepuidust tool" },
    { id: 2, name: "Kapp", price: 15.55, desc: "Vanamoodne kapp" },
    { id: 3, name: "Laud", price: 59.99, desc: "Led-gamer desk" },
]

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
    if (!req.body.name || !req.body.price || !req.body.desc) {
        return res.status(400).send({ error: 'One or all params are missing' })
    }
    let newItem = {
        id: items.length + 1,
        price: req.body.price,
        name: req.body.name,
        desc: req.body.desc
    }
    items.push(newItem)
    res.status(201).location('localhost:8080/items/' + (items.length)).send(
        newItem
    )
})

app.listen(8080, () => {
    console.log(`API up at: http://localhost:8080`)
})
