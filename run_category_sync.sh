#!/bin/bash

# Bulk Category Sync Runner
# This script runs the Python category bulk sync tool with proper environment setup

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Contentful Category to Magento Bulk Sync Tool${NC}"
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
python3 -c "import requests, tqdm, python_dotenv" 2>/dev/null || {
    echo -e "${RED}❌ Missing required Python packages${NC}"
    echo "Please install them with:"
    echo "  pip3 install requests tqdm python-dotenv"
    exit 1
}

echo -e "${GREEN}✅ Python dependencies are available${NC}"

# Parse command line arguments
DRY_RUN=""
VERBOSE=""
IGNORE_RENDER_PAGE=""
DELAY="2.0"

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN="--dry-run"
            shift
            ;;
        --verbose)
            VERBOSE="--verbose"
            shift
            ;;
        --ignore-render-page)
            IGNORE_RENDER_PAGE="--ignore-render-page"
            shift
            ;;
        --delay)
            DELAY="$2"
            shift
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --dry-run              Show what would be processed without making requests"
            echo "  --ignore-render-page   Process ALL categories, ignoring renderPage attribute"
            echo "  --verbose              Enable verbose logging"
            echo "  --delay N              Delay in seconds between requests (default: 2.0)"
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

# Confirm before proceeding (unless dry run)
if [ -z "$DRY_RUN" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  This will submit category pages to Magento${NC}"
    if [ -n "$IGNORE_RENDER_PAGE" ]; then
        echo -e "   • ALL categories will be processed (ignoring renderPage)"
        echo -e "   • ⚠️  This may create many pages - consider using --dry-run first"
    else
        echo -e "   • Categories with renderPage=true will be processed"
    fi
    echo -e "   • Each page will include the new category sidebar"
    echo -e "   • Delay between requests: ${DELAY}s"
    echo ""
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}🛑 Operation cancelled${NC}"
        exit 0
    fi
fi

# Run the Python script
echo ""
echo -e "${BLUE}🐍 Running Python bulk category sync...${NC}"
echo "Log file will be created in the current directory"
echo ""

python3 bulk_category_sync.py \
    --delay "$DELAY" \
    $DRY_RUN \
    $IGNORE_RENDER_PAGE \
    $VERBOSE

# Check exit code
if [ $? -eq 0 ]; then
    if [ -n "$DRY_RUN" ]; then
        echo -e "${GREEN}✅ Dry run completed successfully${NC}"
    else
        echo -e "${GREEN}🎉 Category sync completed successfully!${NC}"
    fi
else
    echo -e "${RED}❌ Category sync failed - check the log file for details${NC}"
    exit 1
fi