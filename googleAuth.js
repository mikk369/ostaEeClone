function handleCredentialResponse(response) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://localhost:8080/oAuth2Login');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
        if (xhr.status === 201) {
            let sessionId = JSON.parse(xhr.response).sessionId
            let username = JSON.parse(xhr.response).username

            localStorage.setItem("sessionId", sessionId)
            localStorage.setItem("username", username)
            localStorage.setItem("isAdmin", false)

            document.getElementById("login").style.display = "none"
            document.getElementById("logout").style.display = ""
            document.getElementById('listItems').style.display = ""

        } else {
            console.log('Request failed.  Returned status of ' + xhr.status + " " + xhr.statusText + " " + xhr.responseText);
        }
    };
    xhr.send(JSON.stringify(response));
}

window.onload = function () {
    google.accounts.id.initialize({
        client_id: "561087672076-t9b4gp8i5l4n1cv55s9a4p66a8191lnr.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });

    google.accounts.id.renderButton(
        document.getElementById("googleSigninDiv"), 
        { theme: "outline", size: "large" }  
    );
}