#!/bin/bash

echo "🔧 Setting up Contentful to Magento Bulk Sync Tool"
echo "=================================================="

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "📥 Installing Python dependencies..."
pip install -r requirements.txt

echo ""
echo "✅ Setup complete!"
echo ""
echo "To run the bulk sync:"
echo "1. Make sure your Express server is running: node server.js"
echo "2. Run: source venv/bin/activate && python bulk_sync.py"
echo ""
echo "Or use the quick start script: ./run_bulk_sync.sh"