#!/bin/bash

# Bulk Recipe Sync Runner
# This script runs the Python recipe bulk sync tool with proper environment setup

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🍳 Contentful Recipe to Magento Bulk Sync Tool${NC}"
echo "=================================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please create a .env file with the required environment variables:"
    echo "  - CONTENTFUL_SPACE_ID"
    echo "  - CONTENTFUL_ACCESS_TOKEN"
    echo "  - PORT (optional, defaults to 3000)"
    exit 1
fi

# Check if Express server is running
echo -e "${YELLOW}🔍 Checking if Express server is running...${NC}"
PORT=${PORT:-3000}
if ! curl -s "http://localhost:$PORT" > /dev/null 2>&1; then
    echo -e "${RED}❌ Express server is not running on port $PORT${NC}"
    echo -e "${YELLOW}💡 Please start the server first with: npm start or npm run dev${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Express server is running${NC}"

# Check Python dependencies
echo -e "${YELLOW}🔍 Checking Python dependencies...${NC}"
python3 -c "import requests, tqdm, dotenv" 2>/dev/null || {
    echo -e "${RED}❌ Missing required Python packages${NC}"
    echo "Please install them with:"
    echo "  pip3 install requests tqdm python-dotenv"
    exit 1
}

echo -e "${GREEN}✅ Python dependencies are available${NC}"

# Parse command line arguments
DELAY="1.0"

while [[ $# -gt 0 ]]; do
    case $1 in
        --delay)
            DELAY="$2"
            shift
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --delay N              Delay in seconds between requests (default: 1.0)"
            echo "  --help                 Show this help message"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Confirm before proceeding
echo ""
echo -e "${YELLOW}⚠️  This will submit recipe pages to Magento${NC}"
echo -e "   • All published recipes will be processed"
echo -e "   • Recipes will include structured JSON-LD schema markup"
echo -e "   • Delay between requests: ${DELAY}s"
echo ""
read -p "Do you want to continue? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🛑 Operation cancelled${NC}"
    exit 0
fi

# Run the Python script
echo ""
echo -e "${BLUE}🐍 Running Python bulk recipe sync...${NC}"
echo "Processing recipes with structured ingredients and instructions..."
echo ""

python3 bulk_recipe_sync.py "$DELAY"

# Check exit code
if [ $? -eq 0 ]; then
    echo -e "${GREEN}🎉 Recipe sync completed successfully!${NC}"
    echo -e "${GREEN}📄 All recipes are now available in Magento with structured data${NC}"
else
    echo -e "${RED}❌ Recipe sync failed - check the output above for details${NC}"
    exit 1
fi