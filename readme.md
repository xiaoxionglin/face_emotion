# important parameters before serving the website
## 
put the server IPs in ./public/config.js
The client connects to them one by one until success.

## should you want relay the data to some client
after successfully receiving message from the desired receiving client (i.e., your touchdesigner), copy its client ID and put it in the "receiver" constant in ./server.js

## generate your own key

openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365

change httpsOptions.passphrase in ./server.js accordingly