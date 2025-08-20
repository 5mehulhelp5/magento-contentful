#!/usr/bin/env python3
"""
Small Batch Contentful to Magento Sync Tool

This script fetches only the first 20 article entries from Contentful and pushes them
to Magento one by one using the Express server API endpoint. Perfect for testing
the new Magento ID workflow.
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

class ContentfulMagentoSyncSmall:
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
    
    def fetch_contentful_entries(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Fetch first N article entries from Contentful"""
        print(f"🔍 Fetching first {limit} entries from Contentful...")
        
        url = f"https://cdn.contentful.com/spaces/{self.contentful_space_id}/environments/{self.contentful_environment}/entries"
        headers = {
            'Authorization': f'Bearer {self.contentful_access_token}',
            'Content-Type': 'application/json'
        }
        
        params = {
            'content_type': 'article',  # Only fetch articles
            'limit': min(limit, 100),   # Contentful's max limit per request is 100
            'skip': 0,
            'select': 'sys.id,fields.title,fields.magentoId',  # Get ID, title, and existing Magento ID
            'order': 'sys.createdAt'  # Order by creation date (oldest first)
        }
        
        try:
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            
            entries = data.get('items', [])
            
            print(f"✅ Found {len(entries)} article entries in Contentful")
            
            # Show preview of what we'll sync
            print(f"\n📋 Preview of entries to sync:")
            for i, entry in enumerate(entries[:5], 1):
                title = entry.get('fields', {}).get('title', 'Untitled')[:50]
                has_magento_id = 'magentoId' in entry.get('fields', {})
                status = "🔗 Has Magento ID" if has_magento_id else "🆕 New"
                print(f"   {i}. {title} - {status}")
            
            if len(entries) > 5:
                print(f"   ... and {len(entries) - 5} more entries")
            
            return entries
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Error fetching Contentful entries: {e}")
            sys.exit(1)
    
    def sync_entry_to_magento(self, entry_id: str, title: str) -> Dict[str, Any]:
        """Sync a single entry to Magento via Express server"""
        url = f"{self.express_server_url}/render-and-submit/{entry_id}"
        
        try:
            response = requests.post(url, timeout=60)  # 60 second timeout for safety
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': str(e),
                'entryId': entry_id,
                'title': title
            }
    
    def run_small_sync(self, limit: int = 20, delay_seconds: float = 2.0):
        """Run the small batch synchronization process"""
        print("🚀 Starting SMALL BATCH Contentful to Magento sync...\n")
        print("💡 This will test the new Magento ID workflow with a limited set of articles\n")
        
        # Fetch limited entries
        entries = self.fetch_contentful_entries(limit)
        
        if not entries:
            print("❌ No entries found to sync")
            return
        
        # Process each entry
        results = {
            'success': 0,
            'failed': 0,
            'created': 0,
            'updated': 0,
            'recreated': 0,  # New action type
            'errors': []
        }
        
        print(f"\n📤 Processing {len(entries)} entries with {delay_seconds}s delay...\n")
        
        # Use tqdm for progress bar
        for entry in tqdm(entries, desc="Syncing articles", unit="article"):
            entry_id = entry['sys']['id']
            title = entry.get('fields', {}).get('title', 'Untitled')[:50]  # Truncate for display
            has_existing_id = 'magentoId' in entry.get('fields', {})
            
            # Update progress bar description
            status_emoji = "🔗" if has_existing_id else "🆕"
            tqdm.write(f"{status_emoji} Processing: {title}")
            
            result = self.sync_entry_to_magento(entry_id, title)
            
            if result.get('success'):
                results['success'] += 1
                action = result.get('magento', {}).get('action', 'processed')
                
                # Track different action types
                if action == 'created':
                    results['created'] += 1
                elif action == 'updated':
                    results['updated'] += 1
                elif action == 'recreated':
                    results['recreated'] += 1
                
                magento_id = result.get('magentoId', 'Unknown')
                tqdm.write(f"✅ {action.capitalize()}: {title} (Magento ID: {magento_id})")
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
    
    def print_results(self, results: Dict[str, Any]):
        """Print the final sync results"""
        print(f"\n{'='*60}")
        print("📊 SMALL BATCH SYNC RESULTS")
        print(f"{'='*60}")
        print(f"✅ Successful: {results['success']}")
        print(f"   🆕 Created: {results['created']}")
        print(f"   🔄 Updated: {results['updated']}")
        if results['recreated'] > 0:
            print(f"   🔄 Recreated: {results['recreated']} (Magento page was missing)")
        print(f"❌ Failed: {results['failed']}")
        print(f"📈 Total processed: {results['success'] + results['failed']}")
        
        if results['errors']:
            print(f"\n❌ FAILED ENTRIES ({len(results['errors'])}):")
            print("-" * 40)
            for error in results['errors']:
                print(f"• {error['title']} ({error['id']})")
                print(f"  Error: {error['error']}")
        
        print(f"\n{'='*60}")

def main():
    """Main function"""
    print("🔧 Small Batch Contentful to Magento Sync Tool")
    print("=" * 50)
    print("This tool syncs only the first 20 articles for testing purposes")
    print()
    
    try:
        syncer = ContentfulMagentoSyncSmall()
        
        # Ask user for number of entries
        try:
            limit = int(input("Number of entries to sync (default 20, max 50): ") or "20")
            limit = min(max(limit, 1), 50)  # Clamp between 1 and 50
        except ValueError:
            limit = 20
        
        # Ask user for delay between requests
        try:
            delay = float(input("Enter delay between requests in seconds (default 2.0): ") or "2.0")
        except ValueError:
            delay = 2.0
        
        # Confirm before starting
        print(f"\n📋 Configuration:")
        print(f"   • Entries to sync: {limit}")
        print(f"   • Delay between requests: {delay}s")
        print(f"   • Server URL: http://localhost:3000")
        
        confirm = input(f"\nStart small batch sync? (y/N): ").lower().strip()
        if confirm != 'y':
            print("❌ Sync cancelled")
            return
        
        syncer.run_small_sync(limit=limit, delay_seconds=delay)
        
        print(f"\n💡 Tip: Check the server logs to see detailed Magento ID workflow information")
        
    except KeyboardInterrupt:
        print("\n\n⏹️  Sync interrupted by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()