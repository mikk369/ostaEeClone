const vue = Vue.createApp({
    data() {
        return {
            itemInModal: { name: null },
            items: [],
            addModal: {}
        }
    },
    async created() {
        this.items = await (await fetch('http://localhost:8080/items')).json();
    },
    methods: {
        getItem: async function (id) {
            this.itemInModal = await (await fetch(`http://localhost:8080/items/${id}`)).json()
            let itemInfoModal = new bootstrap.Modal(document.getElementById('itemInfoModal'), {})
            itemInfoModal.show()
        },
        addItem: async function () {
            const newItem = {
                name: this.addModal.name,
                price: this.addModal.price,
                description: this.addModal.description
            }
            console.log(newItem)
            await fetch("http://localhost:8080/items", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newItem)
            }).then(response => {this.items.push(newItem)})
        }
    }
}).mount('#app')