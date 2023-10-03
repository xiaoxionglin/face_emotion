# emotion recognition website

developed for [Hidalgo festival "Who Are You"](https://hidalgofestival.de/hidalgo-kollektiv/produktion/who-are-you/)

It captures audience's facial emotion and send the realtime data to modify the art song performance.

# important parameters before serving the website

## ~~server IP~~
~~put the server IPs in ./public/config.js~~

~~The client connects to them one by one until success.~~

now the IP is automatically detected, no need to be manually put in

## should you want relay the data to some client
after successfully receiving message from the desired receiving client (i.e., your touchdesigner), copy its client ID and put it in the "receiver" constant in ./server.js

## generate your own key

openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365

change httpsOptions.passphrase in ./server.js accordingly

# references

face recognition and emotion detection using: https://github.com/justadudewhohacks/face-api.js
webpage visuals adapted from: https://github.com/SimHub/avatar-face-expression