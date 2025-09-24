#!/bin/bash

# FAQ Sync Script for Contentful to Magento
# Automatically loads environment variables and runs the FAQ sync

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check if environment variables are set
if [ -z "$CONTENTFUL_SPACE_ID" ] || [ -z "$CONTENTFUL_ACCESS_TOKEN" ]; then
    echo "❌ Missing required environment variables in .env file"
    echo "   Required: CONTENTFUL_SPACE_ID, CONTENTFUL_ACCESS_TOKEN"
    exit 1
fi

echo "🚀 Starting FAQ Sync Script"
echo "📝 Loading environment from .env file"
echo "🌐 Express Server: ${EXPRESS_SERVER_URL:-http://localhost:3000}"
echo

# Run the Python sync script with passed arguments
python3 bulk_faq_sync.py "$@"