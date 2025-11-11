#!/bin/bash

# Script to migrate picture.png to Git LFS
# Run this script to fix the large file warning

echo "Step 1: Ensuring Git LFS is installed and initialized..."
git lfs install

echo "Step 2: Removing picture.png from git cache..."
git rm --cached public/picture.png

echo "Step 3: Re-adding picture.png (will be tracked by LFS)..."
git add public/picture.png

echo "Step 4: Committing the change..."
git commit -m "Migrate picture.png to Git LFS"

echo "Step 5: Pushing to remote..."
git push origin main

echo "Done! The file should now be tracked by Git LFS."

