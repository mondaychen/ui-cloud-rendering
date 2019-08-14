# Cloud Rendering

This TodoMVC app is a proof-of-concept of cloud-rendering based web development. 

## Key Features 

- All the "rendering", computing, state management and business logic run on server instead of client.
- JS code loaded to client side will always stay the same small size no matter how big your application is.
- Near-perfect performance (since your front-end JS code only work on communicating with server, patching HTML and binding events).

## Roadmap

- Use diff instead of full HTML string to patch
- Find a better way (complier?) to annotate event binding and `checked`
- Allow some JS code to be compiled to front-end to solve the problem of intensive inputs
- Add UI to notify users of connection lost
- Try Vue.js

## Setup

```
$ npm run install
$ npm run start
```
