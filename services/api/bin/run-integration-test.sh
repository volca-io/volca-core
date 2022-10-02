#!/usr/bin/env bash
set -e

echo "=> Starting database"
docker-compose down # Make sure database is down
docker-compose --profile integration-test up --remove-orphans -d

echo "=> Waiting for database to start"
wait-on tcp:5432

echo "=> Migrating database"
sls invoke local -f migrate --data "{ \"type\": \"latest\" }"

echo "=> Seed database"
serverless invoke local -f seed

echo "=> Starting service"
yarn start &> /dev/null & 
PID=$!
echo "=> Service started with id $PID"

set +e

echo "=> Waiting for service to respond"
wait-on http://localhost:4000/status

echo "=> Running tests"
jest

RESULT=$?

echo "=> Stopping database"
docker-compose down

echo "=> Stopping serverless offline"
kill $PID


exit $RESULT
