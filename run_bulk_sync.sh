#!/bin/bash

echo "🚀 Starting Contentful to Magento Bulk Sync"
echo "==========================================="

# Check if Express server is running
if ! curl -s http://localhost:3000/test > /dev/null; then
    echo "❌ Express server is not running on localhost:3000"
    echo "   Please start it first with: node server.js"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run ./setup_bulk_sync.sh first"
    exit 1
fi

# Activate virtual environment and run the script
echo "🔌 Activating virtual environment..."
source venv/bin/activate

echo "🏃 Running bulk sync script..."
python bulk_sync.py