#!/bin/bash

echo "1. Starting Docker Compose backend stack (4 services)..."

if ! docker compose up -d --build; then
    echo "ERROR: Docker Compose failed to start the backend services. Check Docker status and logs."
    exit 1
fi

echo "Backend services started: Postgres (5432), RabbitMQ (5672), Node (3000), C# API (5001)."

echo "Waiting 5 seconds for services to connect..."
sleep 5


echo "1.5. Cleaning up ADB processes and Expo cache..."

# Killing all ADB instances to reset the connection (fixes Broken Pipe/32)
# The '-F' flag forces the process to be killed gracefully.
start powershell -NoExit -Command "taskkill /f /im adb.exe; echo ADB processes killed.; exit"

# Clear the Expo cache to ensure a fresh build
start powershell -NoExit -Command "npx expo start --clear; exit"

sleep  # Wait for processes to be killed and cache to clear




echo "2. Launching Frontends in new CMD windows..."

# The 'start' command on Windows opens a new window and runs the subsequent command.
# We launch the shell scripts using 'bash' to ensure they execute correctly.

echo "   -> Launching React Web Client (client-react)..."
start powershell -NoExit -Command "cd client-react; npm run dev"


echo "   -> Launching Mobile Dev Server using LAN host mode..."
start powershell -NoExit -Command "cd HealthSyncExpo; npx expo start --host lan"
echo "   -> Launching Mobile Client Android Build (HealthSyncExpo)..."
start powershell -NoExit -Command "cd HealthSyncExpo; npx expo run:android --no-bundler"

echo "--- Script finished. All six components launched. ---"