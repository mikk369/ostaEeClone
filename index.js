const express = require('express');
const cors = require('cors');
const app = express();
let expressWs = require('express-ws')(app)

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


app.ws('/', function(ws, req) {
    ws.on('message', function(msg) {
        expressWs.getWss().clients.forEach(client => client.send(msg));
    });
})

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
    expressWs.getWss().clients.forEach(client => client.send(JSON.stringify({action: "new", dd: newItem})))
    res.status(201).send(items)
})

app.get('/power', (req, res) => {
    res.send(powers)
})

app.post('/login', (req, res) => {
    if (req.body.username == details.username && req.body.password == details.password) {
        powers = true
        res.send("true")
    } else
        res.send({ error: "wrong username or password" })
})

 app.post('/logout', (req, res) => {
    powers = false
})

 app.delete('/items/:id', (req, res) => {
    items.splice(req.params.id - 1, 1)
    var item_id = (req.params.id -1);
    var copy_list = [];
    items.forEach(item => {
        if (item.id !== item_id +1)
            copy_list.push(item)
    })
    items = copy_list

    var i = 1
    items.forEach(item => {
        item.id = i
        i += 1
    })
    expressWs.getWss().clients.forEach(client => client.send(req.params.id));
    res.send("200")
})

 app.put("/items/:id", (req, res) => {
    items[req.params.id -1].name = req.body.name
    items[req.params.id -1].price = req.body.price
    items[req.params.id -1].description = req.body.description

    expressWs.getWss().clients.forEach(client => client.send(JSON.stringify({action: "edit", dd: req.body})))
    res.send("200")
})

app.listen(8080, () => {
    console.log(`API up at: http://localhost:8080`)
})
