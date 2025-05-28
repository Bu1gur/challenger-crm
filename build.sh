#!/usr/bin/env bash
# Build script for render.com

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Install frontend dependencies and build
cd ../frontend 
npm install
npm run build

# Copy build files to backend static directory
mkdir -p ../backend/static
cp -r dist/* ../backend/static/
