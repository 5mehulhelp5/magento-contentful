const mysql = require('mysql2/promise');

class MagentoDatabase {
  constructor() {
    this.connection = null;
    this.config = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4'
    };
  }

  /**
   * Create database connection
   */
  async connect() {
    try {
      if (!this.config.user || !this.config.password || !this.config.database) {
        throw new Error('Database credentials not configured. Please set DB_USER, DB_PASSWORD, and DB_NAME in .env');
      }

      this.connection = await mysql.createConnection(this.config);
      console.log('✅ Connected to Magento database');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
  }

  /**
   * Close database connection
   */
  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
      console.log('📴 Disconnected from database');
    }
  }

  /**
   * Execute a database query
   * @param {string} query - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>} Query results
   */
  async query(query, params = []) {
    if (!this.connection) {
      const connected = await this.connect();
      if (!connected) {
        throw new Error('Failed to connect to database');
      }
    }

    try {
      const [rows] = await this.connection.execute(query, params);
      return rows;
    } catch (error) {
      console.error('❌ Database query error:', error.message);
      throw error;
    }
  }

  /**
   * Set is_searchable field for CMS pages
   * @param {Array|string} identifiers - Page identifiers (single string or array)
   * @param {number} searchable - 1 for searchable, 0 for not searchable
   * @returns {Promise<Object>} Result with affected rows count
   */
  async setCmsPageSearchable(identifiers, searchable = 1) {
    try {
      const isArray = Array.isArray(identifiers);
      const idList = isArray ? identifiers : [identifiers];
      
      if (idList.length === 0) {
        return { success: false, message: 'No identifiers provided', affectedRows: 0 };
      }

      // Create placeholders for the IN clause
      const placeholders = idList.map(() => '?').join(',');
      const query = `
        UPDATE cms_page 
        SET is_searchable = ? 
        WHERE identifier IN (${placeholders})
      `;
      
      const params = [searchable, ...idList];
      
      console.log('🔍 Executing database query:', {
        query: query.replace(/\s+/g, ' ').trim(),
        searchable,
        identifierCount: idList.length,
        identifiers: idList.slice(0, 3).join(', ') + (idList.length > 3 ? '...' : '')
      });

      const result = await this.query(query, params);
      
      const affectedRows = result.affectedRows || 0;
      
      return {
        success: true,
        message: `Updated ${affectedRows} pages to ${searchable ? 'searchable' : 'not searchable'}`,
        affectedRows,
        identifiers: idList
      };

    } catch (error) {
      console.error('❌ Error updating cms page searchable status:', error);
      return {
        success: false,
        message: error.message,
        affectedRows: 0
      };
    }
  }

  /**
   * Get CMS pages with their searchable status
   * @param {Array|string} identifiers - Optional filter by identifiers
   * @returns {Promise<Array>} CMS pages with their searchable status
   */
  async getCmsPageSearchableStatus(identifiers = null) {
    try {
      let query = 'SELECT page_id, identifier, title, is_searchable, active FROM cms_page';
      let params = [];

      if (identifiers) {
        const isArray = Array.isArray(identifiers);
        const idList = isArray ? identifiers : [identifiers];
        const placeholders = idList.map(() => '?').join(',');
        query += ` WHERE identifier IN (${placeholders})`;
        params = idList;
      }

      query += ' ORDER BY identifier';

      const rows = await this.query(query, params);
      
      return rows.map(row => ({
        page_id: row.page_id,
        identifier: row.identifier,
        title: row.title,
        is_searchable: Boolean(row.is_searchable),
        active: Boolean(row.active)
      }));

    } catch (error) {
      console.error('❌ Error getting cms page searchable status:', error);
      return [];
    }
  }

  /**
   * Set all Contentful-generated pages as searchable
   * @returns {Promise<Object>} Result with affected rows count
   */
  async makeContentfulPagesSearchable() {
    try {
      const query = `
        UPDATE cms_page 
        SET is_searchable = 1 
        WHERE identifier LIKE 'cf-%' 
           OR identifier LIKE 'what-to-plant%'
           OR identifier LIKE 'how-to-%'
           OR identifier LIKE 'how-and-when-%'
      `;

      console.log('🔍 Making all Contentful pages searchable...');
      
      const result = await this.query(query);
      const affectedRows = result.affectedRows || 0;
      
      return {
        success: true,
        message: `Updated ${affectedRows} Contentful pages to searchable`,
        affectedRows
      };

    } catch (error) {
      console.error('❌ Error making Contentful pages searchable:', error);
      return {
        success: false,
        message: error.message,
        affectedRows: 0
      };
    }
  }
}

module.exports = MagentoDatabase;