#!/bin/bash

YELLOW="\033[1;31m"
MAGENTA="\033[1;35m"
NC="\033[0;0m"
options=("y" "n")

read -n 1 -p $'\nPress \033[1;31m y \033[0;0m to launch \033[1;31mautomatic\033[0;0m SDK update (\033[1;35many other key\033[0;0m for \033[1;35mmanual\033[0;0m update)\n' y
case $y in
  [Yy]* ) echo -e "${YELLOW}\nLAUNCHING SDK WATCHER...${NC}\n" &&
          docker-compose -f docker-compose.dev.yml exec sdk sh -c 'cd ./frontend/sdk && sh sdkWatcher.sh';;
  * ) while true; do
        read -n 1 -s -r -p $'\n\033[1;35mPress any key to regenerate SDK...\n\033[0;0m' 
        docker-compose -f docker-compose.dev.yml exec sdk sh -c 'cd ./frontend/sdk && sh generateSDK.sh' &&
            echo -e "${MAGENTA}SDK regenerated!${NC}"
      done;;
esac