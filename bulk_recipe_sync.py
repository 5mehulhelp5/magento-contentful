#!/usr/bin/env python3
"""
Bulk Recipe Contentful to Magento Sync Tool

This script fetches all recipe entries from Contentful and pushes them
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

class RecipeContentfulMagentoSync:
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

    def is_entry_archived(self, entry: Dict[str, Any]) -> bool:
        """Check if a Contentful entry is archived"""
        # Check the sys.archivedAt field first (primary indicator)
        sys_info = entry.get('sys', {})
        if sys_info.get('archivedAt'):
            return True

        # Fallback: check metadata tags
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

    def fetch_contentful_recipes(self) -> List[Dict[str, Any]]:
        """Fetch all recipe entries from Contentful, excluding archived ones"""
        print("🍳 Fetching recipe entries from Contentful...")

        url = f"https://cdn.contentful.com/spaces/{self.contentful_space_id}/environments/{self.contentful_environment}/entries"
        headers = {
            'Authorization': f'Bearer {self.contentful_access_token}',
            'Content-Type': 'application/json'
        }

        all_recipes = []
        skip = 0
        limit = 100

        while True:
            params = {
                'content_type': 'recipe',
                'limit': limit,
                'skip': skip,
                'include': 2  # Include linked entries (ingredients)
            }

            try:
                response = requests.get(url, headers=headers, params=params)
                response.raise_for_status()
                data = response.json()

                entries = data.get('items', [])
                if not entries:
                    break

                # Filter out archived entries
                active_recipes = [entry for entry in entries if not self.is_entry_archived(entry)]
                all_recipes.extend(active_recipes)

                print(f"📄 Fetched {len(entries)} recipes (skip: {skip}), {len(active_recipes)} active")

                # Check if we've reached the end
                if len(entries) < limit:
                    break

                skip += limit

            except requests.exceptions.RequestException as e:
                print(f"❌ Error fetching recipes: {e}")
                sys.exit(1)

        print(f"✅ Found {len(all_recipes)} active recipe entries")
        return all_recipes

    def sync_recipe_to_magento(self, recipe: Dict[str, Any]) -> Dict[str, Any]:
        """Send a single recipe to Magento via the Express server"""
        recipe_id = recipe['sys']['id']
        recipe_title = recipe.get('fields', {}).get('title', 'Untitled Recipe')

        print(f"🔄 Processing: {recipe_title}")

        # Call the Express server endpoint
        url = f"{self.express_server_url}/render-and-submit-recipe/{recipe_id}"

        try:
            response = requests.post(url)
            response.raise_for_status()
            result = response.json()

            if result.get('success'):
                action = result.get('magento', {}).get('action', 'processed')
                print(f"✅ {recipe_title}: {action} in Magento")
                return {
                    'success': True,
                    'recipe_id': recipe_id,
                    'title': recipe_title,
                    'action': action,
                    'result': result
                }
            else:
                error_msg = result.get('error', 'Unknown error')
                print(f"❌ {recipe_title}: Failed - {error_msg}")
                return {
                    'success': False,
                    'recipe_id': recipe_id,
                    'title': recipe_title,
                    'error': error_msg
                }

        except requests.exceptions.RequestException as e:
            print(f"❌ {recipe_title}: Network error - {str(e)}")
            return {
                'success': False,
                'recipe_id': recipe_id,
                'title': recipe_title,
                'error': str(e)
            }

    def sync_all_recipes(self, delay: float = 1.0):
        """Sync all recipes from Contentful to Magento"""
        print("🚀 Starting bulk recipe sync...")

        # Fetch all recipes
        recipes = self.fetch_contentful_recipes()

        if not recipes:
            print("📭 No recipes found to sync")
            return

        print(f"📊 Found {len(recipes)} recipes to process")

        # Process each recipe
        results = []
        failed_count = 0
        success_count = 0

        for recipe in tqdm(recipes, desc="Syncing recipes"):
            result = self.sync_recipe_to_magento(recipe)
            results.append(result)

            if result['success']:
                success_count += 1
            else:
                failed_count += 1

            # Add delay between requests to avoid overwhelming the server
            if delay > 0:
                time.sleep(delay)

        # Print summary
        print(f"\n📈 Sync Complete!")
        print(f"✅ Successful: {success_count}")
        print(f"❌ Failed: {failed_count}")
        print(f"📊 Total: {len(recipes)}")

        # Show failed recipes if any
        if failed_count > 0:
            print(f"\n❌ Failed Recipes:")
            for result in results:
                if not result['success']:
                    print(f"  - {result['title']} ({result['recipe_id']}): {result['error']}")

        return results


def main():
    """Main function"""
    try:
        # Initialize sync tool
        sync_tool = RecipeContentfulMagentoSync()

        # Parse command line arguments for delay
        delay = 1.0
        if len(sys.argv) > 1:
            try:
                delay = float(sys.argv[1])
                print(f"🕐 Using delay of {delay} seconds between requests")
            except ValueError:
                print("⚠️  Invalid delay value, using default 1.0 seconds")

        # Start the sync process
        sync_tool.sync_all_recipes(delay=delay)

    except KeyboardInterrupt:
        print("\n⏹️  Sync interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"💥 Fatal error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()