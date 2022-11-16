const https = require('https');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const app = express();
const port = 8080

const httpsServer = https.createServer({
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem")
    },
    app).listen(port, () => {
        console.log(`API up at: https://localhost:${port}`)
});

var expressWs = require('express-ws')(app, httpsServer)
const delay = ms => new Promise(res => setTimeout(res, ms));

app.use(cors());
app.use(express.json())

var items = [
    { id: 1, name: "Tool", price: "6.99", description: "Tammepuidust tool" },
    { id: 2, name: "Kapp", price: "15.55", description: "Vanamoodne kapp" },
    { id: 3, name: "Laud", price: "59.99", description: "Led-gamer desk" },
]

app.ws('/', function (ws, req) {
    ws.on('message', function (msg) {
        expressWs.getWss().clients.forEach(client => client.send(msg));
    });
});

const users = [{username: "admin", password: "admin", isAdmin: true},
{username: "user", password: "password", isAdmin: false}]

const sessions = []

app.get('/items', async (req, res) => {
    //await delay(3000)
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

app.post('/sessions', (req,res) => {
    if (!req.body.username || !req.body.password){
        return res.status(400).send({error: "One or more parameters missing"})
    } else {
        userMatched = 0
        checkAdmin = false
        users.forEach((element) => {
            if(element.username == req.body.username && element.password == req.body.password){
                userMatched += 1
                if (element.isAdmin == true){
                    checkAdmin = true
                } 
                sessionId = Math.round(Math.random() * 100000000)
                session = {id: sessionId, user: req.body.username}
                sessions.push(session)
            }
        });
        if (userMatched == 0){
            return res.status(401).send({error: "Invalid username or password"})
        }
        else if (userMatched == 1){
            return res.status(201).send({success: true, isAdmin: checkAdmin, sessionId: sessionId})
        }
    }
});

app.post('/logout', (req, res) => {
    if (!req.body.username || !req.body.sessionId){
        return res.status(400).send({error: "One or more parameters missing"})
    } else {
        sessions.forEach((element) => {
            if (element.user == req.body.username || element.id == req.body.sessionId) {
                sessions.splice(element)
                return res.status(201).send({success: true})
            } else {
                return res.status(401).send({error: "Invalid sessionId or username"})
            }
        })
    } 
});