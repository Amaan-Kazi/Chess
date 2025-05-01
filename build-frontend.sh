#!/bin/bash


# Documentation
printf "\n\n----------------------------------\n"
printf "Building Documentation [VitePress]"
printf "\n----------------------------------\n\n"

cd docs
npm install
npm run docs:build
cd ..


# Copying documentation to frontend
printf "\n\n---------------------------------\n"
printf "Copying documentation to frontend"
printf "\n---------------------------------\n\n"

rm -rf frontend/public/docs
mkdir -p frontend/public/docs
cp -r docs/.vitepress/dist/* frontend/public/docs


# Frontend
printf "\n\n--------------------------\n"
printf "Building Frontend [NextJS]"
printf "\n--------------------------\n\n"

cd frontend
npm install
npm run build
cd ..


printf "\n\n---------------------------------------\n"
printf "Build completed. Output in frontend/out"
printf "\n---------------------------------------\n\n"

