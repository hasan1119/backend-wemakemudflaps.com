#!/bin/bash

APP_DIR="$HOME/projects/steven/backend"

cd $APP_DIR || exit

echo "SSH key setup..."
eval "$(ssh-agent -s)"
ssh-add "$HOME/.ssh/github"


echo "Pulling latest code..."
git pull origin main

# Subgraph matrix
declare -A SUBGRAPHS
SUBGRAPHS[users]="4001 steven_users_subgraph"
SUBGRAPHS[media]="4002 steven_media_subgraph"
SUBGRAPHS[product]="4003 steven_product_subgraph"

# Shared environment variables (replace with actual values or source from secrets)
export FRONTEND_URL="${FRONTEND_URL:-}" # set as needed
export DB_TYPE="${DB_TYPE:-}" # set as needed
export DB_HOST="${DB_HOST:-}" # set as needed
export DB_PORT="${DB_PORT:-}" # set as needed
export DB_USERNAME="${DB_USERNAME:-}" # set as needed
export DB_PASSWORD="${DB_PASSWORD:-}" # set as needed
export DB_NAME="${DB_NAME:-}" # set as needed
export DB_SYNCHRONIZE="${DB_SYNCHRONIZE:-}" # set as needed
export DB_ENTITIES="${DB_ENTITIES:-}" # set as needed
export DB_MIGRATIONS="${DB_MIGRATIONS:-}" # set as needed
export SALT_ROUNDS="${SALT_ROUNDS:-}" # set as needed
export SECRET_KEY="${SECRET_KEY:-}" # set as needed
export EXPIRE="${EXPIRE:-}" # set as needed
export REDIS_HOST="${REDIS_HOST:-}" # set as needed
export REDIS_PORT="${REDIS_PORT:-}" # set as needed
export REDIS_PASSWORD="${REDIS_PASSWORD:-}" # set as needed
export REDIS_SESSION_TTL="${REDIS_SESSION_TTL:-}" # set as needed
export EMAIL_HOST="${EMAIL_HOST:-}" # set as needed
export EMAIL_PORT="${EMAIL_PORT:-}" # set as needed
export EMAIL_USER="${EMAIL_USER:-}" # set as needed
export EMAIL_FROM="${EMAIL_FROM:-}" # set as needed
export EMAIL_PASSWORD="${EMAIL_PASSWORD:-}" # set as needed
export NODE_ENV="${NODE_ENV:-}" # set as needed

# Setup Bun (assumes bun is installed and in PATH)
if ! command -v bun &> /dev/null; then
  echo "Bun not found. Please install Bun before running this script."
  exit 1
fi

# Install dependencies for each subgraph
for subgraph in "${!SUBGRAPHS[@]}"; do
  IFS=' ' read -r PORT PM2 <<< "${SUBGRAPHS[$subgraph]}"
  export SUB_GRAPH_NAME="$subgraph"
  export PORT="$PORT"
  export PM2="$PM2"
  echo "Setting up $subgraph subgraph (port: $PORT, pm2: $PM2)"
  cd "$APP_DIR/$subgraph" || exit
  bun install
  cd "$APP_DIR" || exit
done

