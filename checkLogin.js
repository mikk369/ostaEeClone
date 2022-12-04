window.onload = checkIfLoggedIn();
function checkIfLoggedIn() {
    if (localStorage.length >= 2) {
        document.getElementById('login').style.display = "none"
        document.getElementById('logout').style.display = ""
        document.getElementById('listItems').style.display = ""
        if (localStorage.getItem('isAdmin') == 'true') { 
            document.getElementById('deleteBtn').style.display = ""
            document.getElementById('updateBtn').style.display = ""
            document.getElementById('logs').style.display = ""
        }	
    }
}