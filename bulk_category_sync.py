#!/usr/bin/env python3
"""
Bulk Category Page Submission to Magento

This script fetches all category entries from Contentful and creates/submits
their category pages to Magento using the Express server API endpoint.
Only processes categories that have renderPage=true.
"""

import os
import sys
import requests
import time
from typing import List, Dict, Any, Optional
from tqdm import tqdm
from dotenv import load_dotenv
import json
import logging
from datetime import datetime

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'category_sync_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

class CategoryMagentoSync:
    def __init__(self):
        """Initialize the Category Magento Sync tool"""
        # Contentful configuration
        self.contentful_space_id = os.getenv('CONTENTFUL_SPACE_ID')
        self.contentful_access_token = os.getenv('CONTENTFUL_ACCESS_TOKEN')
        self.contentful_environment = os.getenv('CONTENTFUL_ENVIRONMENT', 'master')
        
        # Express server configuration
        self.express_server_url = f"http://localhost:{os.getenv('PORT', '3000')}"
        
        # Validate configuration
        if not all([self.contentful_space_id, self.contentful_access_token]):
            raise ValueError("Missing required Contentful environment variables:\n"
                           "   - CONTENTFUL_SPACE_ID\n"
                           "   - CONTENTFUL_ACCESS_TOKEN")
        
        self.logger = logging.getLogger(__name__)
        self.logger.info(f"Initialized CategoryMagentoSync with:")
        self.logger.info(f"  - Contentful Space: {self.contentful_space_id}")
        self.logger.info(f"  - Express Server: {self.express_server_url}")
    
    def fetch_all_categories(self) -> List[Dict[str, Any]]:
        """Fetch all category entries from Contentful"""
        self.logger.info("🔍 Fetching categories from Contentful...")
        
        url = f"https://cdn.contentful.com/spaces/{self.contentful_space_id}/environments/{self.contentful_environment}/entries"
        headers = {
            'Authorization': f'Bearer {self.contentful_access_token}',
            'Content-Type': 'application/json'
        }
        
        all_categories = []
        skip = 0
        limit = 100  # Contentful's max limit per request
        
        while True:
            params = {
                'content_type': 'category',  # Only fetch categories
                'limit': limit,
                'skip': skip,
                'include': 1,  # Include linked entries
                'order': 'fields.title'  # Sort by title for consistent processing
            }
            
            try:
                response = requests.get(url, headers=headers, params=params)
                response.raise_for_status()
                data = response.json()
                
                entries = data.get('items', [])
                all_categories.extend(entries)
                
                # Log progress
                self.logger.info(f"   Fetched {len(entries)} categories (total: {len(all_categories)})")
                
                # Check if we have more entries to fetch
                if len(entries) < limit:
                    break
                
                skip += limit
                time.sleep(0.1)  # Small delay to be nice to Contentful API
                
            except requests.exceptions.RequestException as e:
                self.logger.error(f"❌ Error fetching Contentful categories: {e}")
                sys.exit(1)
        
        self.logger.info(f"✅ Found {len(all_categories)} total categories in Contentful")
        return all_categories
    
    def filter_renderable_categories(self, categories: List[Dict[str, Any]], ignore_render_page: bool = False) -> List[Dict[str, Any]]:
        """Filter categories that should have pages rendered (renderPage=true or ignore flag)"""
        renderable = []
        
        if ignore_render_page:
            self.logger.info("⚠️  Ignoring renderPage attribute - processing ALL categories")
            renderable = categories.copy()
            for category in categories:
                title = category.get('fields', {}).get('title', 'Untitled')
                self.logger.debug(f"   ✓ Will render: {title} (ignoring renderPage)")
        else:
            for category in categories:
                fields = category.get('fields', {})
                render_page = fields.get('renderPage', False)
                
                if render_page:
                    renderable.append(category)
                    title = fields.get('title', 'Untitled')
                    self.logger.debug(f"   ✓ Will render: {title}")
                else:
                    title = fields.get('title', 'Untitled')
                    self.logger.debug(f"   ⏭ Skipping: {title} (renderPage=false)")
        
        if ignore_render_page:
            self.logger.info(f"📄 Will process ALL {len(renderable)} categories (renderPage ignored)")
        else:
            self.logger.info(f"📄 Found {len(renderable)} categories marked for page rendering")
        return renderable
    
    def build_category_hierarchy(self, categories: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Build a hierarchy map for better logging context"""
        hierarchy = {}
        
        for category in categories:
            cat_id = category['sys']['id']
            fields = category.get('fields', {})
            title = fields.get('title', 'Untitled')
            parent_ref = fields.get('parent', {})
            parent_id = parent_ref.get('sys', {}).get('id') if parent_ref else None
            
            hierarchy[cat_id] = {
                'title': title,
                'parent_id': parent_id,
                'level': 'top-level' if not parent_id else 'subcategory'
            }
        
        return hierarchy
    
    def sync_category_to_magento(self, category_id: str, title: str, hierarchy_info: Dict[str, Any]) -> Dict[str, Any]:
        """Sync a single category page to Magento via Express server"""
        url = f"{self.express_server_url}/render-and-submit-category/{category_id}"
        
        level = hierarchy_info.get('level', 'unknown')
        parent_id = hierarchy_info.get('parent_id')
        
        self.logger.info(f"🔄 Submitting {level} category: {title}")
        if parent_id:
            self.logger.info(f"   └─ Parent category ID: {parent_id}")
        
        try:
            response = requests.post(url, timeout=60)  # Longer timeout for category pages
            response.raise_for_status()
            result = response.json()
            
            # Log success details
            if result.get('success'):
                magento_id = result.get('magentoPageId', 'unknown')
                self.logger.info(f"✅ Successfully submitted: {title}")
                self.logger.info(f"   └─ Magento Page ID: {magento_id}")
                
                # Check if this was a create or update operation
                if 'created new page' in str(result.get('message', '')).lower():
                    result['operation'] = 'created'
                else:
                    result['operation'] = 'updated'
            else:
                self.logger.error(f"❌ Failed to submit: {title}")
                self.logger.error(f"   └─ Error: {result.get('error', 'Unknown error')}")
                
            return result
            
        except requests.exceptions.Timeout:
            error_msg = f"Request timeout after 60 seconds for category: {title}"
            self.logger.error(f"⏰ {error_msg}")
            return {
                'success': False,
                'error': error_msg,
                'categoryId': category_id,
                'title': title
            }
        except requests.exceptions.RequestException as e:
            error_msg = str(e)
            self.logger.error(f"🔌 Network error for {title}: {error_msg}")
            return {
                'success': False,
                'error': error_msg,
                'categoryId': category_id,
                'title': title
            }
    
    def run_bulk_category_sync(self, delay_seconds: float = 2.0, dry_run: bool = False, ignore_render_page: bool = False):
        """Run the bulk category synchronization process"""
        self.logger.info("🚀 Starting Category Page bulk submission to Magento...")
        
        if dry_run:
            self.logger.info("🔍 DRY RUN MODE - No actual submissions will be made")
        
        if ignore_render_page:
            self.logger.info("⚠️  IGNORING renderPage attribute - ALL categories will be processed")
        
        self.logger.info("💡 Category pages will be created/updated with sidebar navigation\n")
        
        # Fetch all categories
        all_categories = self.fetch_all_categories()
        
        if not all_categories:
            self.logger.error("❌ No categories found in Contentful")
            return
        
        # Filter to only renderable categories (or all if ignoring renderPage)
        renderable_categories = self.filter_renderable_categories(all_categories, ignore_render_page)
        
        if not renderable_categories:
            self.logger.error("❌ No categories marked for page rendering (renderPage=true)")
            return
        
        # Build hierarchy for context
        hierarchy = self.build_category_hierarchy(all_categories)
        
        if dry_run:
            self.logger.info(f"\n🔍 DRY RUN: Would process {len(renderable_categories)} categories:")
            for category in renderable_categories:
                cat_id = category['sys']['id']
                title = category.get('fields', {}).get('title', 'Untitled')
                level = hierarchy.get(cat_id, {}).get('level', 'unknown')
                self.logger.info(f"   • {title} ({level})")
            return
        
        # Process each category
        results = {
            'success': 0,
            'failed': 0,
            'created': 0,
            'updated': 0,
            'errors': []
        }
        
        self.logger.info(f"\n📤 Processing {len(renderable_categories)} category pages...\n")
        
        # Use tqdm for progress bar
        for category in tqdm(renderable_categories, desc="Syncing category pages", unit="category"):
            category_id = category['sys']['id']
            title = category.get('fields', {}).get('title', 'Untitled')
            hierarchy_info = hierarchy.get(category_id, {})
            
            # Sync to Magento
            result = self.sync_category_to_magento(category_id, title, hierarchy_info)
            
            # Process results
            if result.get('success'):
                results['success'] += 1
                operation = result.get('operation', 'processed')
                if operation == 'created':
                    results['created'] += 1
                elif operation == 'updated':
                    results['updated'] += 1
            else:
                results['failed'] += 1
                results['errors'].append({
                    'categoryId': category_id,
                    'title': title,
                    'error': result.get('error', 'Unknown error')
                })
                
            # Delay between requests to avoid overwhelming the server
            if delay_seconds > 0:
                time.sleep(delay_seconds)
        
        # Final summary
        self.logger.info(f"\n🎉 Bulk category sync completed!")
        self.logger.info(f"📊 Results Summary:")
        self.logger.info(f"   ✅ Successful: {results['success']}")
        self.logger.info(f"   ❌ Failed: {results['failed']}")
        self.logger.info(f"   🆕 Created: {results['created']}")
        self.logger.info(f"   🔄 Updated: {results['updated']}")
        
        if results['errors']:
            self.logger.error(f"\n❌ Failed category submissions:")
            for error in results['errors']:
                self.logger.error(f"   • {error['title']}: {error['error']}")
        
        return results

def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Bulk sync category pages from Contentful to Magento')
    parser.add_argument('--delay', type=float, default=2.0, 
                       help='Delay in seconds between requests (default: 2.0)')
    parser.add_argument('--dry-run', action='store_true',
                       help='Show what would be processed without making actual requests')
    parser.add_argument('--ignore-render-page', action='store_true',
                       help='Process ALL categories, ignoring renderPage attribute')
    parser.add_argument('--verbose', action='store_true',
                       help='Enable verbose logging')
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    try:
        sync_tool = CategoryMagentoSync()
        results = sync_tool.run_bulk_category_sync(
            delay_seconds=args.delay,
            dry_run=args.dry_run,
            ignore_render_page=args.ignore_render_page
        )
        
        if not args.dry_run and results:
            # Exit with error code if there were failures
            if results['failed'] > 0:
                print(f"\n⚠️  Process completed with {results['failed']} failures")
                sys.exit(1)
            else:
                print(f"\n🎉 All {results['success']} category pages successfully submitted!")
        
    except KeyboardInterrupt:
        print("\n🛑 Process interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Fatal error: {e}")
        logging.exception("Fatal error occurred")
        sys.exit(1)

if __name__ == "__main__":
    main()