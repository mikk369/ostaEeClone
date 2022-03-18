const vue = Vue.createApp({
    data() {
        return {
            itemInModal: {name: null},
            items: []
        }
    },
    async created(){
        this.items = await (await fetch('http://localhost:8080/items')).json();
    },
    methods: {
        getItem: async function (id) {
            this.itemInModal = await (await fetch(`http://localhost:8080/items/${id}`)).json()
            let itemInfoModal = new bootstrap.Modal(document.getElementById('itemInfoModal'), {})
            itemInfoModal.show()
        }
    }
}).mount('#app')