# 42_ft_transcendence


# TECHS USED + DOC AND TUTORIALS

  - ### JAVASCRIPT
      [You Don't Know JS: a free online 6 parts book for in depth understanding of JS](https://github.com/getify/You-Dont-Know-JS/tree/1st-ed)

  - ### FRONTEND: TBD typescript front framework (Angular?)

  - ### BACKEND: NestJS
    [A 1h intro video](https://www.youtube.com/watch?v=F_oOtaxb0L8)

  - ### DB: PostgreSQL

  - ### DOCKER && DOCKER-COMPOSE


# CHECKLIST

### SECURITY
  - Passwords stored in the db should be encrypted
  - Defense against SQL injections
  - Check and protection against user inputs/forms

### USER ACCOUNT
  - log in with 42 OAuth (API)
  - can choose a display name
  - A user has several victories and losses and other stats (ladder level, achievements...)
  - must have avatar generated or uploaded by the user
  - 2-factor authentication can be activated (like google authenticator or an SMS etc...)
  - can add other users as friends, and see their current status (online, offline, in a game...)
  - match history (including duel, ladder) that can be consulted by anyone logged-in

### CHAT
  - Users must be able to create channels public/private or protected by a password
  - Users must be able to send direct messages to other users
  - Users must be able to block other user and therefore they will not see their messages anymore
  - A user that creates a new channel is automatically its owner until he leaves the channel
    - owner of a channel can add/change/remove a password to access the channel
    - owner can select a user to be an administrator and is also an administrator of the channel
    - administrator can ban or mute users for a certain amount of time
  - Through the chat interface users should be able to ask other players to do a Pong match (Ping? Pong)
  - Through the chat interface users must be able to see other players profiles

### GAME
  - play pong directly on the website and live against another player.
  - match-making system, user can join a game queue and are automatically matched with another player.
  - It can be on a canvas or it can be with 3d effects, it can be ugly but it must be a pong like the one from 1972.
  - game customization options (power-ups, different maps etc) but the user must be able to play a default pong game without any added stuff.
  - The game must be responsive!
  - Other users can watch the game live without interfering in it.


### REQUIREMENTS:
  - Low latency
