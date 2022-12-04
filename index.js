const https = require('https');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger.json');
const port = 8080;
const logFile = "log.csv";
const {OAuth2Client} = require('google-auth-library');
const OAuth2ClientInstance = new OAuth2Client('561087672076-t9b4gp8i5l4n1cv55s9a4p66a8191lnr.apps.googleusercontent.com');

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
app.use(express.json());
app.use(express.static(__dirname));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

var items = [
    { id: 1, name: "Tool", price: "6.99", description: "Tammepuidust tool" },
    { id: 2, name: "Kapp", price: "15.55", description: "Vanamoodne kapp" },
    { id: 3, name: "Laud", price: "59.99", description: "Led-gamer desk" },
]

let logs = []

async function getClientDataFromGoogle(token){
    const ticket = await OAuth2ClientInstance.verifyIdToken({
        idToken: token,
        audience: '561087672076-t9b4gp8i5l4n1cv55s9a4p66a8191lnr.apps.googleusercontent.com'
    });
    return ticket.getPayload();
};

app.ws('/', function (ws, req) {
    ws.on('message', function (msg) {
        expressWs.getWss().clients.forEach(client => client.send(msg));
    });
});

const users = [{username: "admin", password: "admin", isAdmin: true},
{username: "user", password: "user", isAdmin: false}]

const sessions = []

function createLog(action = {}) {
    let date = new Date().toISOString().split('.')[0].replace("T", " ").replace("Z", "");

    //let content = Object.keys(action).map((key) =>  + ";" + action[key]);
    let content = []
    Object.values(action).forEach((value) => {
      if(typeof(value) == 'string'){
        value = value.replace(/;/g,'\\;')
        content.push(';' + value)
      }else if(typeof(value) == 'object'){
        value.forEach((element) => {
          try{
            element[0] = element[0].replace(/;/g,'\\;')
          }catch(err){
          }
        })
        content.push(';' + value)
      }else{
        content.push(';' + value)
      }
    })
    if(fs.existsSync(logFile)) {
        const writeStream = fs.createWriteStream(logFile, { flags: "a" });
        writeStream.write(`\n${date}`);
        content.forEach((e) => writeStream.write(`${e}`));
        writeStream.end();
    } else {
        const writeStream = fs.createWriteStream(logFile, { flags: "a" });
        writeStream.write(`${date}`);
        content.forEach((e) => writeStream.write(`${e}`));
        writeStream.end();
    }
  };

app.get('/items', async (req, res) => {
    //await delay(3000)
    res.send(items)
});

app.get('/items/:id', (req, res) => {
    if (typeof items[req.params.id - 1] === 'undefined') {
        return res.status(404).send({ error: "Items not found" })
    }
    res.send(items[req.params.id - 1])
});

app.post('/items', (req, res) => {
    let auth = req.headers.authorization;
    let obj = sessions.find((o) => o.id == auth);
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
    createLog({user: obj.user, action: 2, data: `id:${newItem.id}, name:${newItem.name}, price:${newItem.price}`});
    res.status(201).send(items)
});

 app.delete('/items/:id', (req, res) => {
    let auth = req.headers.authorization;
    let obj = sessions.find((o) => o.id == auth);
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
    createLog({user: obj.user, action: 4, data: [`id:${item_id + 1}, name:${req.body.name}, price:${req.body.price}`],});
    expressWs.getWss().clients.forEach(client => client.send(req.params.id));
    res.send("200")
});

 app.put("/items/:id", (req, res) => {
    let auth = req.headers.authorization;
    let obj = sessions.find((o) => o.id == auth);

    items[req.params.id -1].name = req.body.name
    items[req.params.id -1].price = req.body.price
    items[req.params.id -1].description = req.body.description

    createLog({user: obj.user, action: 3, data: [`id:${req.body.id}, name:${req.body.oldName}, price:${req.body.oldPrice}, id:${req.body.id}, name:${req.body.name}, price:${req.body.price},`],});
    expressWs.getWss().clients.forEach(client => client.send(JSON.stringify({action: "edit", dd: req.body})))
    res.send("200")
});

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
                session = {id: sessionId, user: req.body.username, isAdmin: checkAdmin}
                sessions.push(session)
                createLog({user: session.user, action: 0, data: `id:${session.id}, isAdmin:${session.isAdmin}`,});
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

app.post('/oAuth2Login', async (req, res) => {
    try{
        const dataFromGoogle = await getClientDataFromGoogle(req.body.credential)
        sessionId = Math.round(Math.random() * 100000000)
        newSession = {id: sessionId, user: dataFromGoogle.email, isAdmin: false}
        sessions.push(newSession)
        createLog({user: newSession.user, action: 0, data: `id:${sessionId}, isAdmin:${newSession.isAdmin}`,});

        return res.status(201).send({success: true, username: dataFromGoogle.email,isAdmin: false, sessionId: sessionId})

    }catch (err) {
        return res.status(400).send({error: 'Login unsuccessful'})
    }
});

app.post('/logout', (req, res) => {
    if (!req.body.username || !req.body.sessionId){
        return res.status(400).send({error: "One or more parameters missing"})
    } else {
        sessions.forEach((element) => {
            if (element.user == req.body.username || element.id == req.body.sessionId) {
                sessions.splice(element)
                createLog({user: element.user, action: 1, data: `id:${element.id}, isAdmin:${element.isAdmin}`,});
                return res.status(201).send({success: true})
            } else {
                return res.status(401).send({error: "Invalid sessionId or username"})
            }
        })
    } 
});

app.get("/logs", (req, res) => {
    try {
      let contents = fs.readFileSync('log.csv', 'utf-8');
      var logs = contents.split('\n')
      return res.status(200).send({logs})
      }
    catch(error){
      console.log(error)
    }
  });