const vue = Vue.createApp({
    data() {
        return {
            itemInModal: { name: null },
            items: [],
            addModal: {},
            updateModal: {},
            admin: false,
            loginModal: {},
            loginError: "",
            activeId: null
        }
    },
    async created() {
        this.items = await (await fetch('http://localhost:8080/items')).json();
        this.admin = await (await fetch('http://localhost:8080/power')).json();
        if (this.admin == true) {
            document.querySelector("#login").style.display = "none";
            document.querySelector("#logout").style.display = "";
            document.querySelector("#deleteBtn").style.display = "";
            document.querySelector("#updateBtn").style.display = "";
        }
    },
    methods: {
        getItem: async function (id) {
            this.itemInModal = await (await fetch(`http://localhost:8080/items/${id}`)).json()
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
            await fetch("http://localhost:8080/items", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newItem)
            })
        },
        login: async function () {
            const details = {
                username: this.loginModal.username,
                password: this.loginModal.password
            }
            await fetch("http://localhost:8080/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(details)
            }).then(response => response.json())
                .then(data => {
                    if (data.error)
                        this.loginError = data.error;
                    if (data == true) {
                        window.location.reload()
                    }
                });
        },
        logout: async function () {
            await fetch("http://localhost:8080/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(window.location.reload())
        },
        deleteItem: async function () {
            await fetch("http://localhost:8080/items/" + this.activeId, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
            })
        },
        removeItem: function (id) {
            this.items.splice(id - 1, 1)
            for (let i = 0; i < this.items.length; i++) {
                this.items[i].id = i + 1
            }
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
            await fetch("http://localhost:8080/items/" + this.activeId, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: this.activeId,
                    name: itemName,
                    price: itemPrice,
                    description: itemDescription
                })
            })
        },
        insertItem: function (itemData) {
            this.items.push(itemData)
        },
        modifyItem: function (itemData) {
            this.items[itemData.id - 1] = itemData
        }
    }
}).mount('#app')

const connection = new WebSocket("ws://localhost:8080/")
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