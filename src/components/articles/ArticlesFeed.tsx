import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ArticleCard from './ArticleCard';
import { Article } from '../../types';

const ArticlesFeed: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/articles?page=${page}&limit=4`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }
        
        const data = await response.json();
        setArticles(data.articles);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError('Failed to load health articles');
        
        // Use fallback dummy data for demo purposes
        setArticles([
          {
            id: 1,
            title: "Understanding Optimal Sleep Duration",
            summary: "Learn about the importance of sleep and how much you really need based on your age and lifestyle.",
            imageUrl: "https://images.pexels.com/photos/271897/pexels-photo-271897.jpeg",
            category: "Wellness",
            readTime: "4 min read"
          },
          {
            id: 2,
            title: "Home Remedies for Common Cold",
            summary: "Effective ways to alleviate cold symptoms and speed up recovery using items you already have at home.",
            imageUrl: "https://images.pexels.com/photos/3873173/pexels-photo-3873173.jpeg",
            category: "Home Care",
            readTime: "5 min read"
          },
          {
            id: 3,
            title: "Managing Seasonal Allergies",
            summary: "Practical tips to minimize allergy symptoms during peak seasons.",
            imageUrl: "https://images.pexels.com/photos/3807332/pexels-photo-3807332.jpeg",
            category: "Allergies",
            readTime: "3 min read"
          },
          {
            id: 4,
            title: "Effective Home Acne Treatments",
            summary: "Science-backed approaches to treating acne with common household ingredients.",
            imageUrl: "https://images.pexels.com/photos/3785176/pexels-photo-3785176.jpeg",
            category: "Skin Care",
            readTime: "6 min read"
          }
        ]);
        setTotalPages(2);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [page]);

  const handlePrevPage = () => {
    setPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-textPrimary">📚 Health Articles</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevPage}
            disabled={page === 1 || loading}
            className="p-1.5 rounded-full text-textSecondary hover:text-primary hover:bg-primary/10 disabled:text-textMuted disabled:hover:bg-transparent transition-all duration-200 btn-interactive"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-textSecondary bg-glass px-2 py-1 rounded-full">
            {page} / {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={page === totalPages || loading}
            className="p-1.5 rounded-full text-textSecondary hover:text-primary hover:bg-primary/10 disabled:text-textMuted disabled:hover:bg-transparent transition-all duration-200 btn-interactive"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-pulse flex space-x-3 w-full">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex-1 glass rounded-lg h-32 shimmer"></div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-4 text-error glass rounded-lg">
          <p className="text-sm font-medium">{error}</p>
          <p className="text-textMuted mt-1 text-xs">Using demo articles instead</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {articles.map((article, index) => (
            <div key={article.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <ArticleCard 
                article={article} 
                isCompact={true} 
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArticlesFeed;