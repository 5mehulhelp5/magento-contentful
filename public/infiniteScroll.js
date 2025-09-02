/**
 * Infinite Scroll Implementation for Category List Pages
 * Handles client-side loading of additional articles in batches of 12
 */

class InfiniteScroll {
  constructor() {
    this.articlesPerBatch = 12;
    this.currentlyDisplayed = 0;
    this.allArticles = [];
    this.linkBase = '';
    this.totalCount = 0;
    this.isLoading = false;
    this.observer = null;
    
    this.init();
  }

  /**
   * Initialize the infinite scroll functionality
   */
  init() {
    // Load article data from embedded JSON
    this.loadArticleData();
    
    // Set up intersection observer for scroll detection
    this.setupIntersectionObserver();
    
    // Set up loading indicator
    this.setupLoadingIndicator();
  }

  /**
   * Load article data from the embedded JSON script tag
   */
  loadArticleData() {
    const dataScript = document.getElementById('article-data');
    if (!dataScript) {
      console.error('Article data not found');
      return;
    }

    try {
      const data = JSON.parse(dataScript.textContent);
      this.allArticles = data.articles || [];
      this.linkBase = data.linkBase || '';
      this.currentlyDisplayed = data.initialCount || 12;
      this.totalCount = data.totalCount || 0;
      
      console.log(`Infinite scroll initialized: ${this.currentlyDisplayed} of ${this.allArticles.length} articles displayed`);
    } catch (error) {
      console.error('Error parsing article data:', error);
    }
  }

  /**
   * Set up Intersection Observer for detecting when user reaches bottom
   */
  setupIntersectionObserver() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (!loadingIndicator) return;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isLoading) {
          this.loadMoreArticles();
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '100px'
    });

    this.observer.observe(loadingIndicator);
  }

  /**
   * Set up the loading indicator visibility
   */
  setupLoadingIndicator() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (!loadingIndicator) return;

    // Show loading indicator if there are more articles to load
    if (this.hasMoreArticles()) {
      loadingIndicator.style.display = 'block';
    }
  }

  /**
   * Check if there are more articles to load
   */
  hasMoreArticles() {
    return this.currentlyDisplayed < this.allArticles.length;
  }

  /**
   * Load the next batch of articles
   */
  async loadMoreArticles() {
    if (this.isLoading || !this.hasMoreArticles()) return;

    this.isLoading = true;
    this.showLoading();

    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));

    const nextBatch = this.allArticles.slice(
      this.currentlyDisplayed,
      this.currentlyDisplayed + this.articlesPerBatch
    );

    this.renderArticles(nextBatch);
    this.currentlyDisplayed += nextBatch.length;
    this.updateResultsCount();

    this.isLoading = false;
    this.hideLoading();

    // Hide loading indicator if no more articles
    if (!this.hasMoreArticles()) {
      this.hideLoadingIndicator();
    }
  }

  /**
   * Render articles dynamically and append to grid
   */
  renderArticles(articles) {
    const articlesGrid = document.getElementById('articles-grid');
    if (!articlesGrid) return;

    const loadingIndicator = document.getElementById('loading-indicator');
    
    articles.forEach((article, index) => {
      const articleElement = this.createArticleElement(article);
      
      // Insert before loading indicator
      if (loadingIndicator) {
        articlesGrid.insertBefore(articleElement, loadingIndicator);
      } else {
        articlesGrid.appendChild(articleElement);
      }
    });
  }

  /**
   * Create an article card element
   * This mirrors the ArticleCard component structure
   */
  createArticleElement(article) {
    // Use unified template to generate complete article card HTML
    const cardHTML = window.ArticleCardTemplate.generateArticleCardHTML(article, this.linkBase);
    
    // Create DOM element from HTML string
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cardHTML;
    const articleElement = tempDiv.firstElementChild;
    
    // Add infinite scroll specific classes for animations
    articleElement.classList.add('infinite-scroll-new');
    
    // Debug logging
    const { title, isGrowingGuide } = window.ArticleCardTemplate.getArticleMetadata(article, this.linkBase);
    console.log(`Article: "${title}", isGrowingGuide: ${isGrowingGuide}`);
    
    // Add loaded class after a short delay for animation
    setTimeout(() => {
      articleElement.classList.add('loaded');
    }, 50);
    
    return articleElement;
  }

  /**
   * Update the results count display
   */
  updateResultsCount() {
    const countElement = document.getElementById('current-article-count');
    if (countElement) {
      countElement.textContent = this.currentlyDisplayed.toString();
    }
  }

  /**
   * Show loading state
   */
  showLoading() {
    const loadingSpinner = document.querySelector('.loading-spinner');
    if (loadingSpinner) {
      loadingSpinner.textContent = 'Loading more articles...';
    }
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    const loadingSpinner = document.querySelector('.loading-spinner');
    if (loadingSpinner) {
      loadingSpinner.textContent = '';
    }
  }

  /**
   * Hide the loading indicator when all articles are loaded
   */
  hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }

    // Disconnect observer
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Initialize infinite scroll when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('InfiniteScroll script loaded - v3.0 (Unified Template)');
  
  // Only initialize if we're on a category page with articles
  const articlesGrid = document.getElementById('articles-grid');
  const articleData = document.getElementById('article-data');
  
  if (articlesGrid && articleData) {
    console.log('Initializing InfiniteScroll');
    new InfiniteScroll();
  } else {
    console.log('InfiniteScroll not initialized - missing elements:', { articlesGrid: !!articlesGrid, articleData: !!articleData });
  }
});