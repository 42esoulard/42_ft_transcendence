#! /bin/bash
# Resets node packages and transpiled files
# before running the docker application.
# NB. You may execute this file after if errors after a git pull
# If you want to delete the database, add '-d' as argument: ./reset -d

if [ $# -ge 1 ] && ([[ "$1" = '-d' ]] || [[ "$1" = '--database' ]]); then
    rm -rf postgresdata
    if [ $? == 1 ]; then
        echo "run as sudo in order to delete database files"
        exit 1
    fi
fi

rm -rf backend/node_modules
rm -rf frontend/node_modules
docker system prune --all
# rm -rf backend/dist
# rm -rf frontend/dist
docker-compose up --build --remove-orphans

# To reset Auto-increment on table "users"
# ALTER SEQUENCE users_id_seq RESTART WITH 1;