#!/usr/bin/env python3
"""
Bulk Contentful to Magento Sync Tool

This script fetches all article entries from Contentful and pushes them
to Magento one by one using the Express server API endpoint.
"""

import os
import sys
import requests
import time
from typing import List, Dict, Any
from tqdm import tqdm
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class ContentfulMagentoSync:
    def __init__(self):
        # Contentful configuration
        self.contentful_space_id = os.getenv('CONTENTFUL_SPACE_ID')
        self.contentful_access_token = os.getenv('CONTENTFUL_ACCESS_TOKEN')
        self.contentful_environment = os.getenv('CONTENTFUL_ENVIRONMENT', 'master')
        
        # Express server configuration
        self.express_server_url = f"http://localhost:{os.getenv('PORT', '3000')}"
        
        # Validate configuration
        if not all([self.contentful_space_id, self.contentful_access_token]):
            raise ValueError("Missing required Contentful environment variables")
    
    def fetch_contentful_entries(self) -> List[Dict[str, Any]]:
        """Fetch all article entries from Contentful"""
        print("🔍 Fetching entries from Contentful...")
        
        url = f"https://cdn.contentful.com/spaces/{self.contentful_space_id}/environments/{self.contentful_environment}/entries"
        headers = {
            'Authorization': f'Bearer {self.contentful_access_token}',
            'Content-Type': 'application/json'
        }
        
        all_entries = []
        skip = 0
        limit = 100  # Contentful's max limit per request
        
        while True:
            params = {
                'content_type': 'article',  # Only fetch articles
                'limit': limit,
                'skip': skip,
                'select': 'sys.id,fields.title'  # Only get what we need
            }
            
            try:
                response = requests.get(url, headers=headers, params=params)
                response.raise_for_status()
                data = response.json()
                
                items = data.get('items', [])
                if not items:
                    break  # No more entries
                
                all_entries.extend(items)
                skip += limit
                
                print(f"   📄 Fetched {len(all_entries)} entries so far...")
                
                # Check if we've got all entries
                if len(items) < limit:
                    break
                    
            except requests.exceptions.RequestException as e:
                print(f"❌ Error fetching Contentful entries: {e}")
                sys.exit(1)
        
        print(f"✅ Found {len(all_entries)} article entries in Contentful")
        return all_entries
    
    def sync_entry_to_magento(self, entry_id: str, title: str) -> Dict[str, Any]:
        """Sync a single entry to Magento via Express server"""
        url = f"{self.express_server_url}/render-and-submit/{entry_id}"
        
        try:
            response = requests.post(url, timeout=30)  # 30 second timeout
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': str(e),
                'entryId': entry_id,
                'title': title
            }
    
    def run_bulk_sync(self, delay_seconds: float = 1.0):
        """Run the bulk synchronization process"""
        print("🚀 Starting Contentful to Magento bulk sync...\n")
        print("💡 Pages are automatically made searchable during create/update\n")
        
        # Fetch all entries
        entries = self.fetch_contentful_entries()
        
        if not entries:
            print("❌ No entries found to sync")
            return
        
        # Process each entry
        results = {
            'success': 0,
            'failed': 0,
            'created': 0,
            'updated': 0,
            'errors': []
        }
        
        print(f"\n📤 Processing {len(entries)} entries...\n")
        
        # Use tqdm for progress bar
        for entry in tqdm(entries, desc="Syncing articles", unit="article"):
            entry_id = entry['sys']['id']
            title = entry.get('fields', {}).get('title', 'Untitled')[:50]  # Truncate for display
            
            # Update progress bar description
            tqdm.write(f"Processing: {title}")
            
            result = self.sync_entry_to_magento(entry_id, title)
            
            if result.get('success'):
                results['success'] += 1
                action = result.get('magento', {}).get('action', 'processed')
                if action == 'created':
                    results['created'] += 1
                elif action == 'updated':
                    results['updated'] += 1
                tqdm.write(f"✅ {action.capitalize()} & made searchable: {title}")
            else:
                results['failed'] += 1
                error_msg = result.get('error', 'Unknown error')
                results['errors'].append({
                    'id': entry_id,
                    'title': title,
                    'error': error_msg
                })
                tqdm.write(f"❌ Failed: {title} - {error_msg}")
            
            # Add delay between requests to avoid overwhelming the server
            if delay_seconds > 0:
                time.sleep(delay_seconds)
        
        # Print final results
        self.print_results(results)
    
    def make_pages_searchable(self):
        """Make all Contentful pages searchable via database update"""
        url = f"{self.express_server_url}/db/cms-pages/make-contentful-searchable"
        
        try:
            response = requests.post(url, timeout=30)
            response.raise_for_status()
            result = response.json()
            
            if result.get('success'):
                print(f"✅ {result.get('message', 'Updated pages to be searchable')}")
            else:
                print(f"❌ Failed to update searchable status: {result.get('message', 'Unknown error')}")
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Error updating searchable status: {e}")
            print("💡 Note: You may need to configure database credentials in .env file")
    
    def print_results(self, results: Dict[str, Any]):
        """Print the final sync results"""
        print(f"\n{'='*60}")
        print("📊 BULK SYNC RESULTS")
        print(f"{'='*60}")
        print(f"✅ Successful: {results['success']}")
        print(f"   📝 Created: {results['created']}")
        print(f"   🔄 Updated: {results['updated']}")
        print(f"❌ Failed: {results['failed']}")
        print(f"📈 Total processed: {results['success'] + results['failed']}")
        
        if results['errors']:
            print(f"\n❌ FAILED ENTRIES ({len(results['errors'])}):")
            print("-" * 40)
            for error in results['errors'][:10]:  # Show first 10 errors
                print(f"• {error['title']} ({error['id']})")
                print(f"  Error: {error['error']}")
            
            if len(results['errors']) > 10:
                print(f"... and {len(results['errors']) - 10} more errors")
        
        print(f"\n{'='*60}")

def main():
    """Main function"""
    print("🔧 Contentful to Magento Bulk Sync Tool")
    print("=" * 50)
    
    try:
        syncer = ContentfulMagentoSync()
        
        # Ask user for delay between requests
        try:
            delay = float(input("Enter delay between requests in seconds (default 1.0): ") or "1.0")
        except ValueError:
            delay = 1.0
        
        # Confirm before starting
        confirm = input(f"\nStart bulk sync with {delay}s delay? (y/N): ").lower().strip()
        if confirm != 'y':
            print("❌ Bulk sync cancelled")
            return
        
        syncer.run_bulk_sync(delay_seconds=delay)
        
    except KeyboardInterrupt:
        print("\n\n⏹️  Bulk sync interrupted by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()