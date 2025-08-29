/**
 * Category Sidebar JavaScript - Handles collapsible dropdown interactions
 * This script manages the expand/collapse functionality for category navigation
 */

class CategorySidebar {
  constructor() {
    this.init();
  }

  /**
   * Initialize the category sidebar functionality
   */
  init() {
    console.log('CategorySidebar script loaded');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
    } else {
      this.setupEventListeners();
    }
  }

  /**
   * Set up event listeners for category toggles
   */
  setupEventListeners() {
    const sidebar = document.getElementById('category-sidebar');
    if (!sidebar) {
      console.log('Category sidebar not found');
      return;
    }

    // Find all toggle buttons
    const toggleButtons = sidebar.querySelectorAll('.category-toggle');
    console.log(`Found ${toggleButtons.length} category toggle buttons`);

    toggleButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleCategory(button);
      });
    });

    // Also allow clicking on the category header (excluding the link) to toggle
    const categoryHeaders = sidebar.querySelectorAll('.category-header');
    categoryHeaders.forEach(header => {
      header.addEventListener('click', (e) => {
        // Only toggle if clicking on the header itself, not the link
        if (e.target === header || e.target.classList.contains('toggle-icon')) {
          e.preventDefault();
          const toggleButton = header.querySelector('.category-toggle');
          if (toggleButton) {
            this.toggleCategory(toggleButton);
          }
        }
      });
    });
  }

  /**
   * Toggle the expanded/collapsed state of a category
   * @param {HTMLElement} toggleButton - The toggle button that was clicked
   */
  toggleCategory(toggleButton) {
    const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
    const subcategoryListId = toggleButton.getAttribute('aria-controls');
    
    if (!subcategoryListId) {
      console.warn('Toggle button missing aria-controls attribute');
      return;
    }

    const subcategoryList = document.getElementById(subcategoryListId);
    if (!subcategoryList) {
      console.warn(`Subcategory list not found: ${subcategoryListId}`);
      return;
    }

    // Toggle the expanded state
    const newExpandedState = !isExpanded;
    
    // Update button state
    toggleButton.setAttribute('aria-expanded', newExpandedState.toString());
    
    // Update subcategory list state
    subcategoryList.setAttribute('aria-expanded', newExpandedState.toString());
    
    if (newExpandedState) {
      // Expanding
      subcategoryList.classList.remove('collapsed');
      subcategoryList.classList.add('expanded');
    } else {
      // Collapsing
      subcategoryList.classList.remove('expanded');
      subcategoryList.classList.add('collapsed');
    }

    console.log(`Category ${newExpandedState ? 'expanded' : 'collapsed'}: ${subcategoryListId}`);
  }

  /**
   * Expand a specific category by its ID (useful for deep linking)
   * @param {string} categoryId - The category ID to expand
   */
  expandCategory(categoryId) {
    const sidebar = document.getElementById('category-sidebar');
    if (!sidebar) return;

    const categoryHeader = sidebar.querySelector(`[data-category-id="${categoryId}"]`);
    if (!categoryHeader) return;

    const toggleButton = categoryHeader.querySelector('.category-toggle');
    if (toggleButton && toggleButton.getAttribute('aria-expanded') === 'false') {
      this.toggleCategory(toggleButton);
    }
  }

  /**
   * Collapse all categories
   */
  collapseAll() {
    const sidebar = document.getElementById('category-sidebar');
    if (!sidebar) return;

    const toggleButtons = sidebar.querySelectorAll('.category-toggle[aria-expanded="true"]');
    toggleButtons.forEach(button => {
      this.toggleCategory(button);
    });
  }

  /**
   * Expand all categories
   */
  expandAll() {
    const sidebar = document.getElementById('category-sidebar');
    if (!sidebar) return;

    const toggleButtons = sidebar.querySelectorAll('.category-toggle[aria-expanded="false"]');
    toggleButtons.forEach(button => {
      this.toggleCategory(button);
    });
  }
}

// Initialize the category sidebar when the script loads
console.log('CategorySidebar script loading...');
new CategorySidebar();