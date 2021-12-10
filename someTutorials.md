# 42_ft_transcendence

### [MINDMAP](https://app.mindmup.com/map/_free/2021/09/25828b20168011ecb33a8fface99c92d) (!careful, it's public and if we save it the url needs to be updated)

# TECHS USED + DOC AND TUTORIALS

- ### [FT_TRANSCENDENCE DOC](https://github.com/qingqingqingli/ft_transcendence/wiki)

- ### JAVASCRIPT

  [You Don't Know JS: a free online 6 parts book for in depth understanding of JS](https://github.com/getify/You-Dont-Know-JS/tree/1st-ed)

- ### FRONTEND: VueJS - a typescript framework
  Google says Vue performs better regarding memory allocation, is lighter, and easier to learn than Angular. Sooo...
  [Net Ninja: Vue 3](https://www.youtube.com/watch?v=YrxBCBibVo0&list=PL4cUxeGkcC9hYYGbV60Vq3IXYNfDk8At1)
- ### BACKEND: NestJS

  [A 1h intro video](https://www.youtube.com/watch?v=F_oOtaxb0L8)

- ### DB: PostgreSQL

  [A very thorough tutorial](https://www.postgresqltutorial.com/)

- ### DOCKER && DOCKER-COMPOSE
  [Official tutorial](https://docs.docker.com/compose/gettingstarted/)
  [Docker Compose Tutorial: advanced Docker made simple](https://www.educative.io/blog/docker-compose-tutorial)

# TEAM CONVENTIONS

- #### camelCase
- #### Clear module accesses!! (ie necessary documentation for each module like a README.md, self explanatory function names)
- #### At all times, we must have a board with a to do list, a who's-doing-what, a who-did-what
- #### Weekly organisation meeting (who did what, who struggles with what, who needs what)

# Git etiquette:

1. Create and go to a new branch (by name or by element you're working on)  
   `git checkout -b my_branch`
2. Spend some time in your branch, do your work and commits there (give them self-explanatory commit names)  
   2.1. (optional) If like me you're afraid of losing your local work but not ready to push to main yet, while in your branch you can always push to your remote branch: `git push origin my_branch`  
   2.2. (optional) if you actually lost your local branch for some unfortunate reason, dry your tears, create and checkout a new local branch and pull your remote branch from there (/!\ not in the main branch):  
    `git checkout -b my_branch`  
    `git pull origin my_branch`

3. Once you're ready to push to the main branch, go to the main branch:  
   `git checkout main`

4. Get the freshest version of the main branch (to avoid unleashing hell if you haven't pulled your friend's latest glorious commit)  
   `git pull`

5. Try to merge your branch with main  
    `git merge my_branch`  
   5.1. IF THERE'S CONFLICTS:

   - git and VSCode are letting you know which files and lines are conflicting. Stay on main, solve each conflict appropriately, commit the now fixed versions and try again from step 4!
   - If your attempt at merging is a mess and you panic (like I often do), you can always `git reset --hard`: /!\ **this will delete all the non-committed local changes** (the main branch will go back to its last committed state, your friend's latest glorious commit will be safe, and your committed work is still safe in your branch). Take a deep breath and try again from step 4.

6. Once no conflicts are encountered upon merging our branch with main, we can push!  
   `git push origin main`

# CHECKLIST

### UI - The different pages / main nodes (predesign each):

- 0. login
- 1. User page: avatar + edit, name + edit, stats, friends (with their online/offline status + link to their profile + msg + unfriend)
- 2. Public user profile: avatar, name, stats, add friend
- 3. List of users ranked by best player ? (+ link to their profile)
- 4. List of channels
- 5. Chat
- 6. Game

### SECURITY

- Passwords stored in the db should be encrypted:[pgcrypto](https://x-team.com/blog/storing-secure-passwords-with-postgresql/)
- Defense against SQL injections:[a good tutorial](https://blog.crunchydata.com/blog/preventing-sql-injection-attacks-in-postgresql)
- Check and protection against user inputs/forms (see SQL defence tutorial above + [JS validation API](https://www.w3schools.com/js/js_validation_api.asp))

### USER ACCOUNT

- log in with 42 OAuth (API):[42API doc](https://api.intra.42.fr/apidoc), [Introduction to OAuth 2](https://www.digitalocean.com/community/tutorials/an-introduction-to-oauth-2),[Fat IBM tutorial](https://www.ibm.com/docs/en/acfc?topic=endpoint-tutorial-securing-api-by-using-oauth-20), [NestJS auth doc](https://docs.nestjs.com/security/authentication#authentication), [A simpler Nest Auth tuto](https://www.nerd.vision/post/nestjs-third-party-oauth2-authentication), [passport-42](https://www.npmjs.com/package/passport-42)
- 2-factor authentication can be activated (like google authenticator or an SMS etc...)[google authenticator](https://github.com/speakeasyjs/speakeasy), [SMS](https://cloud.google.com/identity-platform/docs/web/mfa)
- can choose a display name (ALGO/DB)
- A user has several victories and losses and other stats (ladder level, achievements...)(ALGO/DB)
- must have avatar generated or uploaded by the user(ALGO/DB)
- can add other users as friends, and see their current status (online, offline, in a game...)(ALGO/DB)
- match history (including duel, ladder) that can be consulted by anyone logged-in(ALGO/DB)

### [CHAT: a tutorial with Vue 3, Socket.io and Nodejs](https://masteringbackend.com/posts/build-a-real-time-chat-app-with-vue-3-socket-io-and-nodejs/)

- Users must be able to create channels public/private or protected by a password
- Users must be able to send direct messages to other users
- Users must be able to block other user and therefore they will not see their messages anymore
- A user that creates a new channel is automatically its owner until he leaves the channel
  - owner of a channel can add/change/remove a password to access the channel
  - owner can select a user to be an administrator and is also an administrator of the channel
  - administrator can ban or mute users for a certain amount of time
- Through the chat interface users should be able to ask other players to do a Pong match (Ping? Pong)
- Through the chat interface users must be able to see other players profiles

### [GAME: JS/HTML/CSS pong tutorial](https://medium.com/nerd-for-tech/building-pong-with-javascript-c0dd0ab79c9c)

- play pong directly on the website and live against another player.[socket.io + nodeJS for continuous client-server communication](https://www.youtube.com/watch?v=w6EIMfJmpZ4)
- match-making system, user can join a game queue and are automatically matched with another player.(ALGO/DB)
- It can be on a canvas or it can be with 3d effects, it can be ugly but it must be a pong like the one from 1972.
- game customization options (power-ups, different maps etc) but the user must be able to play a default pong game without any added stuff.
- The game must be responsive!
- Other users can watch the game live without interfering in it.

### REQUIREMENTS:

- Low latency!!!!!
  - [Use async JS for API requests, DB handling and other slow stuff](https://javascript.info/async-await)
