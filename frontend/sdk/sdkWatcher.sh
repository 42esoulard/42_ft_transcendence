#!/bin/bash
# echo "Initializing SDK..."
# rm -rf ./typescript-axios-client-generated/* && npx @openapitools/openapi-generator-cli generate -i ../../backend/api-spec.json -g typescript-axios --additional-properties=modelPropertyNaming=original -o ./typescript-axios-client-generated/

echo "Watching changes on the API..."
while [[ 1 ]]; do inotifywait -e modify ../../backend/api-spec.json;
echo "Changes on the api-spec.json file!" \
&& echo "Rebuilding SDK...(this might take a minute)" \
&& rm -rf ./typescript-axios-client-generated/* && npx @openapitools/openapi-generator-cli generate -i ../../backend/api-spec.json -g typescript-axios --additional-properties=modelPropertyNaming=original -o ./typescript-axios-client-generated/ ; done
