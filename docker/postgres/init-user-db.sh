#!/bin/bash
set -e

psql -v ON_ERROR_STOP=0 --username "$POSTGRES_USER" <<-EOSQL
  CREATE USER cesium;
  CREATE DATABASE cesium;
  GRANT ALL PRIVILEGES ON DATABASE cesium TO cesium;
EOSQL

