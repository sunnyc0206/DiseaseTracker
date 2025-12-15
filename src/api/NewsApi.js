import axios from 'axios';
import { adminApi } from './AdminApi';

// Working news sources with CORS support
const NEWS_SOURCES = {
  // RSS2JSON converts RSS feeds to JSON with CORS support
  WHO_RSS: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.who.int/rss-feeds/disease-outbreak-news.xml&api_key=q5ijkolkdjk3urzrcfaehxeoimxr3tdu5ieiqcrq&count=50',
  // CDC RSS feed
  CDC_RSS: 'https://api.rss2json.com/v1/api.json?rss_url=https://tools.cdc.gov/api/v2/resources/media/316422.rss&api_key=q5ijkolkdjk3urzrcfaehxeoimxr3tdu5ieiqcrq&count=50',
  // AllOrigins proxy for APIs without CORS
  ALLORIGINS: 'https://api.allorigins.win/raw?url=',
  // ProxyAPI for backup
  PROXY_API: 'https://corsproxy.io/?'
};

// Cache configuration
const CACHE_KEY = 'newsCache';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Create axios instance
const apiClient = axios.create({
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

class NewsApi {
  constructor() {
    this.cache = new Map();
    this.loadCacheFromStorage();
  }

  // Load cache from localStorage
  loadCacheFromStorage() {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          this.cache.set('news', data);
        } else {
          localStorage.removeItem(CACHE_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading cache:', error);
    }
  }

  // Save cache to localStorage
  saveCacheToStorage(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error saving cache:', error);
    }
  }

  // Fetch news from multiple real sources
  async fetchFromMultipleSources() {
    const allNews = [];
    const errors = [];

    // Fetch WHO RSS feed
    try {
      console.log('Fetching WHO news...');
      const whoResponse = await apiClient.get(NEWS_SOURCES.WHO_RSS);
      if (whoResponse.data && whoResponse.data.items) {
        const whoNews = whoResponse.data.items.map((item, index) => ({
          id: `who-${Date.now()}-${index}`,
          title: item.title,
          summary: this.extractSummary(item.description),
          content: item.description,
          publishedAt: item.pubDate,
          source: 'WHO Disease Outbreak News',
          category: 'Disease Outbreak',
          url: item.link
        }));
        allNews.push(...whoNews);
        console.log(`Fetched ${whoNews.length} WHO articles`);
      }
    } catch (error) {
      console.error('WHO RSS fetch failed:', error.message);
      errors.push('WHO');
    }

    // Fetch CDC RSS feed
    try {
      console.log('Fetching CDC news...');
      const cdcResponse = await apiClient.get(NEWS_SOURCES.CDC_RSS);
      if (cdcResponse.data && cdcResponse.data.items) {
        const cdcNews = cdcResponse.data.items.map((item, index) => ({
          id: `cdc-${Date.now()}-${index}`,
          title: item.title,
          summary: this.extractSummary(item.description),
          content: item.description,
          publishedAt: item.pubDate,
          source: 'CDC',
          category: 'Health Alert',
          url: item.link
        }));
        allNews.push(...cdcNews);
        console.log(`Fetched ${cdcNews.length} CDC articles`);
      }
    } catch (error) {
      console.error('CDC RSS fetch failed:', error.message);
      errors.push('CDC');
    }

    // Try NewsAPI if user has API key
    try {
      const apiKeyResponse = await adminApi.getPublicApiKey('NewsAPI');
      if (apiKeyResponse.success && apiKeyResponse.data && apiKeyResponse.data.keyValue && apiKeyResponse.data.active) {
        const newsApiKey = apiKeyResponse.data.keyValue;
        console.log('Fetching NewsAPI articles...');
        const newsApiUrl = `https://newsapi.org/v2/everything?q=disease+outbreak+epidemic+health+WHO+CDC+pandemic&language=en&sortBy=publishedAt&pageSize=50&apiKey=${newsApiKey}`;
        const newsResponse = await apiClient.get(newsApiUrl);
        
        if (newsResponse.data && newsResponse.data.articles) {
          const newsApiArticles = newsResponse.data.articles
            .filter(article => article.title && article.url) // Filter out invalid articles
            .map((article, index) => ({
              id: `newsapi-${Date.now()}-${index}`,
              title: article.title,
              summary: article.description || article.title,
              content: article.content || article.description || article.title,
              publishedAt: article.publishedAt,
              source: article.source.name || 'News',
              category: 'Health News',
              url: article.url
            }));
          allNews.push(...newsApiArticles);
          console.log(`Fetched ${newsApiArticles.length} NewsAPI articles`);
        }
      }
    } catch (error) {
      console.error('NewsAPI fetch failed:', error.message);
      errors.push('NewsAPI');
    }

    // Try alternative health news sources via proxy
    try {
      console.log('Fetching from alternative sources...');
      // UN News Health RSS
      const unNewsUrl = NEWS_SOURCES.ALLORIGINS + encodeURIComponent('https://news.un.org/feed/subscribe/en/news/topic/health/feed/rss.xml');
      const unResponse = await apiClient.get(unNewsUrl);
      
      // Parse RSS XML response
      if (unResponse.data) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(unResponse.data, 'text/xml');
        const items = xmlDoc.querySelectorAll('item');
        
        const unNews = Array.from(items).slice(0, 20).map((item, index) => ({
          id: `un-${Date.now()}-${index}`,
          title: item.querySelector('title')?.textContent || '',
          summary: this.extractSummary(item.querySelector('description')?.textContent || ''),
          content: item.querySelector('description')?.textContent || '',
          publishedAt: item.querySelector('pubDate')?.textContent || new Date().toISOString(),
          source: 'UN News',
          category: 'Global Health',
          url: item.querySelector('link')?.textContent || ''
        }));
        
        allNews.push(...unNews.filter(n => n.title && n.url));
        console.log(`Fetched ${unNews.length} UN News articles`);
      }
    } catch (error) {
      console.error('UN News fetch failed:', error.message);
      errors.push('UN News');
    }

    // If all sources failed, throw error
    if (allNews.length === 0 && errors.length > 0) {
      throw new Error(`All news sources failed: ${errors.join(', ')}`);
    }

    // Sort by date and remove duplicates
    const uniqueNews = allNews
      .filter(news => news.title && news.url) // Ensure valid articles
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .filter((news, index, self) => 
        index === self.findIndex(n => n.title.toLowerCase() === news.title.toLowerCase())
      );

    console.log(`Total unique articles: ${uniqueNews.length}`);
    return uniqueNews;
  }

  // Fetch news with pagination
  async getNews(page = 1, pageSize = 10) {
    const cacheKey = `news-${page}-${pageSize}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Returning cached news');
      return cached.data;
    }

    try {
      // Fetch from external sources
      const externalNews = await this.fetchFromMultipleSources();
      
      // Fetch admin news from localStorage
      const adminNews = JSON.parse(localStorage.getItem('adminNews') || '[]')
        .filter(news => news.visible !== false) // Only include visible news
        .map(news => ({
          id: news.id,
          title: news.title,
          description: news.description,
          url: news.url || '#',
          publishedAt: news.createdAt || news.publishedAt,
          source: news.source || 'Admin',
          category: news.category || 'Admin Update',
          imageUrl: news.imageUrl || null
        }));
      
      // Combine all news
      const allNews = [...adminNews, ...externalNews];
      
      if (allNews.length === 0) {
        throw new Error('No news articles fetched');
      }
      
      const totalItems = allNews.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      
      const result = {
        data: allNews.slice(startIndex, endIndex),
        pagination: {
          page,
          pageSize,
          totalPages,
          totalItems,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };

      // Cache the result
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      this.saveCacheToStorage(Array.from(this.cache.entries()));

      return result;
    } catch (error) {
      console.error('Error fetching news:', error);
      
      // If we have cached data (even expired), return it
      if (cached) {
        console.log('Returning expired cache due to fetch error');
        return cached.data;
      }
      
      // Return empty data structure
      return {
        data: [],
        pagination: {
          page: 1,
          pageSize,
          totalPages: 0,
          totalItems: 0,
          hasNextPage: false,
          hasPrevPage: false
        }
      };
    }
  }

  // Search news
  async searchNews(query, page = 1, pageSize = 10) {
    const cacheKey = `search-${query}-${page}-${pageSize}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      const allNews = await this.fetchFromMultipleSources();
      const queryLower = query.toLowerCase();
      
      const filtered = allNews.filter(item => 
        item.title.toLowerCase().includes(queryLower) ||
        item.summary.toLowerCase().includes(queryLower) ||
        item.source.toLowerCase().includes(queryLower)
      );
      
      const totalItems = filtered.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      
      const result = {
        data: filtered.slice(startIndex, endIndex),
        pagination: {
          page,
          pageSize,
          totalPages,
          totalItems,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };

      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error('Error searching news:', error);
      return {
        data: [],
        pagination: {
          page: 1,
          pageSize,
          totalPages: 0,
          totalItems: 0,
          hasNextPage: false,
          hasPrevPage: false
        }
      };
    }
  }

  // Get latest news
  async getLatestNews(limit = 5) {
    const cacheKey = `latest-${limit}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    try {
      const allNews = await this.fetchFromMultipleSources();
      const result = allNews.slice(0, limit);
      
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error('Error fetching latest news:', error);
      return [];
    }
  }

  // Get news by ID
  async getNewsById(id) {
    try {
      const allNews = await this.fetchFromMultipleSources();
      return allNews.find(news => news.id === id) || null;
    } catch (error) {
      console.error('Error fetching news by ID:', error);
      return null;
    }
  }

  // Preload adjacent pages
  preloadAdjacentPages(currentPage, pageSize) {
    if (currentPage > 0) {
      this.getNews(currentPage + 1, pageSize).catch(() => {});
    }
    
    if (currentPage > 1) {
      this.getNews(currentPage - 1, pageSize).catch(() => {});
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
    localStorage.removeItem(CACHE_KEY);
  }

  // Helper method to extract summary
  extractSummary(content) {
    if (!content) return '';
    
    const textContent = content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&[^;]+;/g, ' ') // Remove HTML entities
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    return textContent.length > 200 
      ? textContent.substring(0, 200) + '...' 
      : textContent;
  }
}

// Export singleton instance
export default new NewsApi(); 