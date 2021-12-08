# ft_transcendence

Website for the mighty pong contest. With an admin view, chat with moderators, real-time multiplayer online games.
Built with NestJS (back) and Vue3.js (Front).
Completely dockerized.

## Application structure:

- [Vue.js 3](https://v3.vuejs.org/guide/introduction.html) as frontend accessible on http://localhost:8080
- [NestJS](https://docs.nestjs.com/) as backend accessible on http://localhost:3000
- a database [PostgreSQL](https://www.postgresql.org/docs/13/index.html)
- [Adminer](https://www.adminer.org/en/) as database management tool accessible on http://localhost:8000

## To run the application:

NB: the installation process may take some time

```sh
$ cd ft_transcendence
$ docker-compose up --build
```

The first time you run the application, the database is empty, you may want to seed the db with some users:

```sh
$ ./seed_db.sh
```

If errors occures after a git pull:

```sh
$ ./reset.sh
```

### The front is made of four routes:

- `/`: simply welcome
- `/users`: list all the users in database
- `/adduser`: allows to add user in database
- `/chat`: after entering a random username, a chat module is available. To test it, simply open a second window, enter a username and lets test

### Backend endpoints are documented with OpenAPI:

- to get the documentation UI: http://localhost:3000/api
- to get the API specs as JSON format: http://localhost:3000/api-json

## In a nutshell

The front communicates with the backend API via an sdk, generated thanks to the [OpenApi module (@nestjs/swagger)](https://docs.nestjs.com/openapi/introduction) nested by NestJs and the [swagger editor](https://editor.swagger.io/).  
The chat is working with the [Websocket module (@nestjs/websockets)](https://docs.nestjs.com/websockets/gateways) in backside and the [socket.io-client](https://socket.io/docs/v4/) in frontside.  
Finally, the database is connected to the backend via the package [@nestjs/typeorm](https://docs.nestjs.com/techniques/database).

## Under the hood

Both backend and frontend are made of a lot of files. Don't worry, the file multiplication is part of the frameworks structures but all are needed.

### Backend

The core of our code is organised as an MVC pattern, and stored into the `src` directory. Files are divided into [controllers](https://docs.nestjs.com/controllers), [modules](https://docs.nestjs.com/modules) and [providers](https://docs.nestjs.com/providers) (including services).

- `main.ts` is the entry file of our application, it creates the server (port 3000) and embed some config.
- `app.*.ts` are the main files of our application. Theses files are sufficient to run an "hello world" application, they are organised as an MVC patern:

  - `Controllers`: Controllers are responsible for handling incoming requests and returning responses to the client. Controllers can be considered as the reflect of our API.
  - `Providers`: Here, we only have services, but we could also have repositories, factories, helpers, and so on. Services are responsible for all the logic of out codes: computing values, data storage and retrieval, etc.
  - `Modules`: Modules helps us to organize our application structure. It links providers with controllers. Each application has at least one module, a root module.  
    Because our application will provide several features, we will find one module by feature. A feature module simply organizes code relevant for a specific feature, keeping code organized and establishing clear boundaries. Modules are, by convention, stored into folders named accordingly.

- `./users`: this folder contains module, controller and service to handle the "user" feature of our application. The idea of this feature is to save or retrieve users from our database. For instance, when the _user controller_ recieves a GET request, it automatically ask the _user service_ to make a database query, which returns all users stored in database. The _controller_ can now create a response and send the content via http body.  
  In the `users` folder, you will find several others folders. These are just "helpers" which allows us validating data recieved via POST (`dto`), to describe what is a user (`interface`), and describe the "user" table of our database (`entity`).
- `./chat`: this folder contains the chat module feature. The service associated is called "gateway". Without entering into details, it makes our API compatible with the package socket.io, which manages the WebSocket. The WebSocket is a protocol that operates in a different way than HTTP. Thus, the first connection established between client - server - WebSocket is made by an http request (handcheck). The communication is then upgraded to websocket, the connection can go on a regular TCP socket.
- `./config`: this folder contains some backend configuration, mainly credentials to connect to the database.
- `./migration` and `./scripts` contains utilitary functions to manage database, for development.

#### Frontend

The frontend file organization is way more simple than backend's.  
Before all, it is important to notice that we don't use the [CDN](https://v3.vuejs.org/guide/installation.html#cdn) version of Vue.js, but the [self hosted](https://v3.vuejs.org/guide/installation.html#download-and-self-host) one, which supplies more features, like routes. With self-hosted installation, a lot of files are with `.vue` extension. These are simply files written in javascript or typescript, where all of our code is embedded. In these files, we need to respect a particular template (see [The Net Ninja tutorial](https://youtu.be/GWRvrSqnFbM?t=960)).  
Before entering into details, some knowledges about Vue.js are necessary. If you don't know Vue.js, please follow some tutorials to learn vue.js, [The Net Ninja](https://www.youtube.com/c/TheNetNinja/playlists) make some tremendous one on [Youtube](https://www.youtube.com/playlist?list=PL4cUxeGkcC9hYYGbV60Vq3IXYNfDk8At1) !

**Alright, in the `frontend` directory, you will notice several folders:**

- `./public`: contains the main html file (index.html) displayed by the browser. It is important to notice here the `<div id="app"></div>`.
- `./sdk`: which contains our autogenerated sdk. The sdk supplies a set of functions which simplifies the communication between backend and frontend.

- `./src`: contains the core of our application:

  - `main.ts`: Just as NestJS, the main.ts is the entry file of the frontend, it simply "mounts" all html generated by our application in place of the `<div id="app">` in index.html.
  - `App.vue`: is the main vue file, which calls all of the others embedded in the `views` folder (by the mean of [routes](vhttps://v3.vuejs.org/guide/routing.html#official-router)).
  - `views/*.vue`: they simply code the different pages of our application, using sdk's functions to GET/POST data from/to the backend. Here `Users.vue` get the list of users from database to display it. `AddUser.vue` codes for a form to POST a new user to database. `Chat.vue` is more tricky and allows to communicate with the WebSocket instanciated by the backend.  
    NB: these `.vue` files code for different "pages" of our website. Becareful, these ar not pages but simply components, displayed or not, by the mean of events. Our application is still a [Single Page Application](https://developer.mozilla.org/en-US/docs/Glossary/SPA) !

  - `./types`: simply contains some interfaces to create some custom types (ie. the _User_ type).
  - `./router`: contains a kind of config file which handles routes, used in _App.vue_.

## Some ressources

### Vue.js 3

**Official documentation**: https://v3.vuejs.org/guide/introduction.html  
**The Net Ninja tutorial on Youtube**: https://www.outube.com/watch?v=YrxBCBibVo0&list=PL4cUxeGkcC9hYYGbV60Vq3IXYNfDk8At1  
**The Complete Guide to Vue 3 Plug-ins**: https://www.codemag.com/Article/2103071/The-Complete-Guide-to-Vue-3-Plug-ins-Part-2

### NestJS

**Official documentation**: https://docs.nestjs.com/  
**codeconcept tutorial on Youtube (french)**: https://www.youtube.com/watch?v=PMva3v8K6h4&list=PLs_WqGRq69UiSaXX85NRUX4rkeiNP3K6l

### Node js

**npm global or local packages**: https://nodejs.dev/learn/npm-global-or-local-packages

### Database handling

**TypeORM Entities**: https://typeorm.io/#/entities  
**Using TypeORM with NestJS**: https://docs.nestjs.com/techniques/database

### Chat & WebSocket

**Socket.IO official documentation**: https://socket.io/docs/v4  
**Build a Real-time Chat App with Vue 3, Socket.io and Nodejs**: https://masteringbackend.com/posts/build-a-real-time-chat-app-with-vue-3-socket-io-and-nodejs/

### Generals

**Build a NestJS - Vue.js app from scratch**: https://scotch.io/tutorials/building-a-modern-app-using-nestjs-mongodb-and-vuejs#toc-what-you-ll-build
