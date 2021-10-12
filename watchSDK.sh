#!/bin/bash
echo "Installing inotify-tools (to watch changes on the API and update the SDK accordingly)..."
sudo apt-get install inotify-tools

while [[ 1 ]]; do inotifywait -e modify ./backend/api-spec.json; 
echo "Changes on the api-spec.json file!" && echo "Rebuilding SDK...(this might take a minute)" && cd frontend && npm run api && cd ..;done