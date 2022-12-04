const vue = Vue.createApp({
    data() {
        return {
            itemInModal: { name: null },
            items: JSON.parse(localStorage.getItem('items')),
            addModal: {},
            updateModal: {},
            loginModal: {},
            loginError: "",
            activeId: null,
            logs: []

        }
    },
    async created() {
        try{ 
            this.items = await (await fetch('https://localhost:8080/items')).json();}
        catch(error){
            alert("Something went wrong " + error)
        }
        localStorage.setItem('items', JSON.stringify(this.items))
    },
    methods: {
        getItem: async function (id) {
            this.itemInModal = await (await fetch(`https://localhost:8080/items/${id}`)).json()
            let itemInfoModal = new bootstrap.Modal(document.getElementById('itemInfoModal'), {})
            itemInfoModal.show()
            this.activeId = id
        },
        addItem: async function () {
            const newItem = {
                name: this.addModal.name,
                price: this.addModal.price,
                description: this.addModal.description
            }
            await fetch("https://localhost:8080/items", {
                method: "POST",
                headers: {
                    "Authorization": localStorage.getItem('sessionId'),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newItem)
            })
        },
        deleteItem: async function () {
            var itemName = this.items[this.activeId - 1].name
            var itemPrice = this.items[this.activeId - 1].price
            await fetch("https://localhost:8080/items/" + this.activeId, {
                method: "DELETE",
                headers: {
                    "Authorization": localStorage.getItem('sessionId'),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: itemName,
                    price: itemPrice
                })
            })
        },
        removeItem: function (id) {
            this.items.splice(id - 1, 1)
            for (let i = 0; i < this.items.length; i++) {
                this.items[i].id = i + 1
            }
            localStorage.setItem('items', JSON.stringify(this.items))
        },
        updateItem: async function () {
            this.updateModal.name = this.items[this.activeId - 1].name
            this.updateModal.price = this.items[this.activeId - 1].price
            this.updateModal.description = this.items[this.activeId - 1].description
        },
        finalUpdate: async function () {
            var itemName = this.updateModal.name
            var itemPrice = this.updateModal.price
            var itemDescription = this.updateModal.description
            await fetch("https://localhost:8080/items/" + this.activeId, {
                method: "PUT",
                headers: {
                    "Authorization": localStorage.getItem('sessionId'),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: this.activeId,
                    name: itemName,
                    price: itemPrice,
                    description: itemDescription,
                    oldName: this.items[this.activeId - 1].name,
                    oldPrice: this.items[this.activeId - 1].price
                })
            })
        },
        insertItem: function (itemData) {
            this.items.push(itemData)
            localStorage.setItem('items', JSON.stringify(this.items))
        },
        modifyItem: function (itemData) {
            this.items[itemData.id - 1] = itemData
            localStorage.setItem('items', JSON.stringify(this.items))
        },
        login: async function(){
            this.username = this.loginModal.username,
            this.password = this.loginModal.password
            const loginRequest = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: this.username,
                    password: this.password
                })

            };
            await fetch("https://localhost:8080/sessions", loginRequest)
                .then(response => response.json())
                .then(data => {
                    let signInMsg = document.getElementById("si-error-msg")
                    if (data.error){
                        signInMsg.textContent = (data.error)
                    } else if (data.isAdmin == true) {
                        localStorage.setItem('sessionId', data.sessionId)
                        localStorage.setItem('isAdmin', data.isAdmin)
                        localStorage.setItem('username', this.username)
                        document.getElementById("login").style.display = "none"
                        document.getElementById("logout").style.display = ""
                        document.getElementById('deleteBtn').style.display = ""
                        document.getElementById('updateBtn').style.display = ""
                        document.getElementById('listItems').style.display = ""
                        document.getElementById('logs').style.display = ""
                    } else {
                        localStorage.setItem('sessionId', data.sessionId)
                        localStorage.setItem('isAdmin', data.isAdmin)
                        localStorage.setItem('username', this.username)
                        document.getElementById("login").style.display = "none"
                        document.getElementById("logout").style.display = ""
                        document.getElementById('listItems').style.display = ""
                    } 
                })
        },
        logout: async function(){
            const logoutRequest = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    sessionId: localStorage.getItem('sessionId'),
                    username: localStorage.getItem('username')
                }) 
            }
            await fetch("https://localhost:8080/logout", logoutRequest)
            .then(response => response.json())
            .then(data => {
                const signOutMsg = document.getElementById("so-error-msg")
                if (data.error) {
                    signOutMsg.textContent = (data.error)
                } else {
                    document.getElementById("login").style.display = ""
                    document.getElementById("logout").style.display = "none"
                    document.getElementById('deleteBtn').style.display = "none"
                    document.getElementById('updateBtn').style.display = "none"
                    document.getElementById('listItems').style.display = "none"
                    document.getElementById('logs').style.display = "none"
                    localStorage.removeItem('isAdmin')
                    localStorage.removeItem('username')
                    localStorage.removeItem('sessionId')
                }
            })
        },
        getLogs: async function (){
            const getRequest = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": localStorage.getItem('sessionId')
                },
            }
            await fetch(`https://localhost:8080/logs`, getRequest)
                .then(response => response.json())
                .then(data => {
                    data = data;
                    data.logs.forEach(element => {
                        let logFields = element.match(/(\\.|[^;])+/g)
                        let log = []
                        const actions = [
                            "Login",
                            "Logout",
                            "Item added",
                            "Item changed",
                            "Item removed",
                            ]

                        logFields[2] = actions[logFields[2]]

                        logFields.forEach((element, index) => {
                            if(typeof(element) == 'string'){
                                element = element.replace(/\\;/g,';')
                                logFields[index] = element
                            }
                        })

                        //Pushitakse ka vana info uuesti, tekivad duplikaadid
                        log.push(logFields)
                        this.logs.push(log)
                    });
                })
        }
    }
}).mount('#app')

const connection = new WebSocket("wss://localhost:8080/")
connection.onmessage = function (event) {
    let updateData = JSON.parse(event.data)
    if (updateData.action == "edit") {
        vue.modifyItem(updateData.dd)
    } else if (updateData.action == "new") {
        vue.insertItem(updateData.dd)
    } else {
        vue.removeItem(event.data)
    }
}