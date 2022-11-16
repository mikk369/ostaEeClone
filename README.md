<h1 align="center">✨ Ostake website ✨</h1>

## 📜 | About

This website is a primitive clone of the website Osta.ee . The website is made purely for learning purposes. The purpose of making this website is to teach us about User Stories & Web Development.

## 🚧 Prerequisites & Tutorial:

- [Node.js 14+](https://nodejs.org/en/download/)

- [OpenSSL](https://slproweb.com/products/Win32OpenSSL.html)

* Download dependencies: npm install

* To run your server: node index.js

## HTTPS SSL certificate generation:
### 📝 Creating an SSL Certificate
To configure an SSL certificate, you can either use a public certificate, trusted certificate or a self-signed certificate. 

> If you’re running the application in production environment, always be sure to acquire and install a trusted certificate!

### 📝 Creating self-signed certificate (for testing)
1. First, generate a key file used for self-signed certificate generation with the command below. The command will create a private key as a file called key.pem.
```
openssl genrsa -out key.pem
```

2. Next, generate a certificate service request (CSR) with the command below. You’ll need a CSR to provide all of the input necessary to create the actual certificate.
```
openssl req -new -key key.pem -out csr.pem
```

3. Finally, generate your certificate by providing the private key created to sign it with the public key created in step two with an expiry date (in this example I chose 9,999 days).
```
openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
```

4. Visit [https://localhost:8080](https://localhost:8080) and make your web browser trust your self-signed certificate by clicking advanced and then clicking the link to continue to the website.


## 💨 Accessing the website
In order to visit the website, you need to open the index.html file located in your website folder using your browser.

## ✨ | Authors

* **Chris Erman** - [UwUBeebi](https://github.com/UwUBeebi)