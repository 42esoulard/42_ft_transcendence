#! /bin/bash
# Resets node packages and transpiled files
# before running the docker application.
# You may execute this file after if errors after a git pull

rm -rf backend/node_modules
rm -rf frontend/node_modules
rm -rf backend/dist
docker-compose up --build --remove-orphans
