#!/bin/bash

echo "Deleting old SDK..."
rm -rf ./typescript-axios-client-generated/*
echo "Generating SDK [this might take up to a minute]..."
npx @openapitools/openapi-generator-cli generate -i ../../backend/api-spec.json -g typescript-axios --additional-properties=modelPropertyNaming=original -o ./typescript-axios-client-generated/
