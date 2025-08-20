const { createClient } = require('contentful-management');

/**
 * Contentful Management API utility for updating entries
 */
class ContentfulManagement {
  constructor() {
    this.client = createClient({
      accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN
    });
    this.spaceId = process.env.CONTENTFUL_SPACE_ID;
    this.environmentId = process.env.CONTENTFUL_ENVIRONMENT || 'master';
  }

  /**
   * Update a Contentful entry with the Magento ID
   * @param {string} entryId - Contentful entry ID
   * @param {string} magentoId - Magento page ID to save
   * @returns {Promise<Object>} Result of the operation
   */
  async updateEntryWithMagentoId(entryId, magentoId) {
    try {
      console.log(`Updating Contentful entry ${entryId} with Magento ID: ${magentoId}`);
      
      const space = await this.client.getSpace(this.spaceId);
      const environment = await space.getEnvironment(this.environmentId);
      
      // Get the entry
      const entry = await environment.getEntry(entryId);
      
      // Update the magentoId field
      entry.fields.magentoId = {
        'en-US': magentoId.toString()
      };
      
      // Save the entry
      const updatedEntry = await entry.update();
      
      // Publish the entry to make the change live
      await updatedEntry.publish();
      
      console.log(`✅ Successfully updated Contentful entry ${entryId} with Magento ID: ${magentoId}`);
      
      return {
        success: true,
        entryId: entryId,
        magentoId: magentoId,
        message: 'Entry updated with Magento ID'
      };
      
    } catch (error) {
      console.error(`❌ Failed to update Contentful entry ${entryId} with Magento ID:`, error);
      
      return {
        success: false,
        entryId: entryId,
        magentoId: magentoId,
        error: error.message,
        message: 'Failed to update entry with Magento ID'
      };
    }
  }

  /**
   * Get an entry with its current magentoId
   * @param {string} entryId - Contentful entry ID
   * @returns {Promise<Object|null>} Entry data or null if not found
   */
  async getEntry(entryId) {
    try {
      const space = await this.client.getSpace(this.spaceId);
      const environment = await space.getEnvironment(this.environmentId);
      const entry = await environment.getEntry(entryId);
      
      return {
        sys: entry.sys,
        fields: entry.fields
      };
    } catch (error) {
      console.error(`Error fetching Contentful entry ${entryId}:`, error);
      return null;
    }
  }
}

module.exports = ContentfulManagement;