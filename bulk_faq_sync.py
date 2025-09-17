#!/usr/bin/env python3
"""
Bulk FAQ Sync Script for Contentful to Magento

This script fetches FAQ entries from Contentful and submits them to Magento
via the Express server API endpoints. Designed for bulk operations with
rate limiting and error handling.
"""

import os
import sys
import time
import json
import requests
from datetime import datetime
from typing import List, Dict, Optional

# Configuration
CONTENTFUL_SPACE_ID = os.getenv('CONTENTFUL_SPACE_ID')
CONTENTFUL_ACCESS_TOKEN = os.getenv('CONTENTFUL_ACCESS_TOKEN')
EXPRESS_SERVER_URL = os.getenv('EXPRESS_SERVER_URL', 'http://localhost:3000')

# Rate limiting configuration
RATE_LIMIT_DELAY = 2  # seconds between requests
MAX_RETRIES = 3
BATCH_SIZE = 5  # Process FAQs in small batches

class FAQSyncManager:
    def __init__(self):
        self.contentful_base_url = f'https://cdn.contentful.com/spaces/{CONTENTFUL_SPACE_ID}'
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {CONTENTFUL_ACCESS_TOKEN}',
            'Content-Type': 'application/json'
        })
        
        self.stats = {
            'total_processed': 0,
            'successful_imports': 0,
            'failed_imports': 0,
            'errors': []
        }

    def is_entry_archived(self, entry: Dict) -> bool:
        """Check if a Contentful entry is archived"""
        metadata = entry.get('metadata', {})
        tags = metadata.get('tags', [])

        if not tags:
            return False

        # Check if entry has archived tag
        for tag in tags:
            if isinstance(tag, dict):
                tag_id = tag.get('sys', {}).get('id', '')
                if tag_id == 'archived':
                    return True
            elif isinstance(tag, str) and tag.lower() == 'archived':
                return True

        return False

    def get_faq_entries(self, limit: int = 100, skip: int = 0) -> Dict:
        """Fetch FAQ entries from Contentful"""
        url = f'{self.contentful_base_url}/entries'
        params = {
            'content_type': 'faq',
            'limit': min(limit, 100),  # Contentful max is 100
            'skip': skip,
            'include': 2  # Include linked entries
        }
        
        try:
            response = self.session.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"❌ Error fetching FAQ entries: {e}")
            return None

    def get_all_faq_entries(self, max_entries: Optional[int] = None) -> List[Dict]:
        """Get all FAQ entries with pagination, excluding archived ones"""
        all_entries = []
        archived_count = 0
        skip = 0
        limit = 100

        print("🔍 Fetching FAQ entries from Contentful...")

        while True:
            data = self.get_faq_entries(limit, skip)
            if not data or not data.get('items'):
                break

            entries = data['items']

            # Filter out archived entries
            active_entries = []
            for entry in entries:
                if self.is_entry_archived(entry):
                    archived_count += 1
                    faq_title = entry.get('fields', {}).get('title', 'Untitled')
                    print(f"   🗄️  Skipping archived FAQ: {faq_title}")
                else:
                    active_entries.append(entry)

            all_entries.extend(active_entries)

            print(f"   Retrieved {len(active_entries)} active FAQs (total: {len(all_entries)})")

            # Check if we've reached max entries or end of results
            if max_entries and len(all_entries) >= max_entries:
                all_entries = all_entries[:max_entries]
                break

            if len(entries) < limit:
                break

            skip += limit
            time.sleep(0.5)  # Be nice to Contentful API

        if archived_count > 0:
            print(f"⚠️  Filtered out {archived_count} archived FAQs")

        print(f"✅ Total active FAQ entries found: {len(all_entries)}")
        return all_entries

    def submit_faq_to_magento(self, entry_id: str, retry_count: int = 0) -> Dict:
        """Submit a single FAQ to Magento via Express server"""
        url = f'{EXPRESS_SERVER_URL}/render-and-submit-faq/{entry_id}'
        
        try:
            response = requests.post(url, timeout=30)
            
            if response.status_code == 200:
                return response.json()
            else:
                error_data = response.json() if response.headers.get('content-type', '').startswith('application/json') else {'error': response.text}
                return {
                    'success': False,
                    'error': error_data.get('error', f'HTTP {response.status_code}'),
                    'status_code': response.status_code
                }
                
        except requests.RequestException as e:
            if retry_count < MAX_RETRIES:
                print(f"   ⚠️  Request failed, retrying in {RATE_LIMIT_DELAY}s... (attempt {retry_count + 1}/{MAX_RETRIES})")
                time.sleep(RATE_LIMIT_DELAY)
                return self.submit_faq_to_magento(entry_id, retry_count + 1)
            
            return {
                'success': False,
                'error': str(e),
                'retry_exceeded': True
            }

    def process_faq_batch(self, entries: List[Dict]) -> None:
        """Process a batch of FAQ entries"""
        for entry in entries:
            entry_id = entry['sys']['id']
            title = entry.get('fields', {}).get('title', 'Unknown FAQ')
            
            print(f"🔄 Processing FAQ: {title[:60]}{'...' if len(title) > 60 else ''}")
            print(f"   Entry ID: {entry_id}")
            
            # Submit to Magento
            result = self.submit_faq_to_magento(entry_id)
            
            self.stats['total_processed'] += 1
            
            if result.get('success'):
                self.stats['successful_imports'] += 1
                magento_info = result.get('magento', {})
                print(f"   ✅ {result.get('message', 'Success')}")
                print(f"   📝 Magento identifier: {magento_info.get('identifier', 'N/A')}")
            else:
                self.stats['failed_imports'] += 1
                error_msg = result.get('error', 'Unknown error')
                print(f"   ❌ Failed: {error_msg}")
                
                self.stats['errors'].append({
                    'entry_id': entry_id,
                    'title': title,
                    'error': error_msg,
                    'timestamp': datetime.now().isoformat()
                })
            
            # Rate limiting
            print(f"   ⏳ Waiting {RATE_LIMIT_DELAY}s...")
            time.sleep(RATE_LIMIT_DELAY)

    def run_bulk_sync(self, max_entries: Optional[int] = None, test_mode: bool = False) -> None:
        """Run the bulk FAQ sync process"""
        print("=" * 60)
        print("🚀 Starting Bulk FAQ Sync to Magento")
        print("=" * 60)
        print(f"📊 Target: {max_entries or 'All'} FAQs")
        print(f"🔧 Mode: {'Test (first batch only)' if test_mode else 'Full sync'}")
        print(f"🌐 Server: {EXPRESS_SERVER_URL}")
        print()
        
        # Validate configuration
        if not all([CONTENTFUL_SPACE_ID, CONTENTFUL_ACCESS_TOKEN]):
            print("❌ Missing required environment variables:")
            print("   - CONTENTFUL_SPACE_ID")
            print("   - CONTENTFUL_ACCESS_TOKEN")
            sys.exit(1)
        
        # Test Express server connectivity
        try:
            response = requests.get(f'{EXPRESS_SERVER_URL}/api/entries', timeout=10)
            if response.status_code != 200:
                print(f"❌ Express server not responding correctly: HTTP {response.status_code}")
                sys.exit(1)
            print("✅ Express server connectivity verified")
            print()
        except requests.RequestException as e:
            print(f"❌ Cannot connect to Express server: {e}")
            sys.exit(1)
        
        # Get FAQ entries
        all_entries = self.get_all_faq_entries(max_entries)
        
        if not all_entries:
            print("❌ No FAQ entries found")
            return
        
        print()
        
        # Process in batches
        total_batches = (len(all_entries) + BATCH_SIZE - 1) // BATCH_SIZE
        
        for i in range(0, len(all_entries), BATCH_SIZE):
            batch = all_entries[i:i + BATCH_SIZE]
            batch_num = i // BATCH_SIZE + 1
            
            print(f"📦 Processing batch {batch_num}/{total_batches} ({len(batch)} FAQs)")
            print("-" * 40)
            
            self.process_faq_batch(batch)
            
            if test_mode and batch_num == 1:
                print("🧪 Test mode: Stopping after first batch")
                break
            
            if batch_num < total_batches:
                print(f"⏸️  Batch complete. Waiting {RATE_LIMIT_DELAY * 2}s before next batch...")
                time.sleep(RATE_LIMIT_DELAY * 2)
            
            print()
        
        # Final report
        print("=" * 60)
        print("📊 BULK FAQ SYNC COMPLETE")
        print("=" * 60)
        print(f"📈 Total processed: {self.stats['total_processed']}")
        print(f"✅ Successful imports: {self.stats['successful_imports']}")
        print(f"❌ Failed imports: {self.stats['failed_imports']}")
        
        if self.stats['errors']:
            print(f"\n🚨 Errors occurred ({len(self.stats['errors'])}):")
            for error in self.stats['errors'][-5:]:  # Show last 5 errors
                print(f"   • {error['title'][:50]} - {error['error']}")
            
            if len(self.stats['errors']) > 5:
                print(f"   ... and {len(self.stats['errors']) - 5} more errors")
        
        success_rate = (self.stats['successful_imports'] / self.stats['total_processed']) * 100 if self.stats['total_processed'] > 0 else 0
        print(f"\n🎯 Success rate: {success_rate:.1f}%")

def main():
    """Main function with command line argument handling"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Bulk sync FAQs from Contentful to Magento')
    parser.add_argument('--max-entries', type=int, help='Maximum number of FAQs to process')
    parser.add_argument('--test', action='store_true', help='Test mode: process only first batch')
    
    args = parser.parse_args()
    
    # Initialize and run sync
    sync_manager = FAQSyncManager()
    sync_manager.run_bulk_sync(
        max_entries=args.max_entries,
        test_mode=args.test
    )

if __name__ == '__main__':
    main()