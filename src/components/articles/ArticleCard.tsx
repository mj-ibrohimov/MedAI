import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Article } from '../../types';

interface ArticleCardProps {
  article: Article;
  isCompact?: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, isCompact = false }) => {
  return (
    <div className={`glass rounded-xl overflow-hidden hover:glass-intense transition-all duration-300 group hover:scale-105 hover:shadow-xl btn-interactive ${isCompact ? 'h-40' : ''}`}>
      <div className={`relative overflow-hidden ${isCompact ? 'h-20' : 'h-40'}`}>
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className={`absolute ${isCompact ? 'top-1 left-1' : 'top-3 left-3'}`}>
          <span className={`bg-primary/90 backdrop-blur-sm text-white font-medium rounded-full shadow-lg ${isCompact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'}`}>
            {article.category}
          </span>
        </div>
        <div className={`absolute ${isCompact ? 'bottom-1 right-1' : 'bottom-3 right-3'}`}>
          <span className={`bg-black/50 backdrop-blur-sm text-white rounded-full ${isCompact ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-xs'}`}>
            {article.readTime}
          </span>
        </div>
      </div>
      
      <div className={`${isCompact ? 'p-3' : 'p-5'}`}>
        <h3 className={`font-semibold text-textPrimary mb-2 line-clamp-2 group-hover:text-accent transition-colors duration-200 ${isCompact ? 'text-sm mb-1' : 'text-lg mb-3'}`}>
          {article.title}
        </h3>
        {!isCompact && (
          <p className="text-sm text-textSecondary mb-4 line-clamp-3 leading-relaxed">
            {article.summary}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <button className={`text-primary hover:text-accent flex items-center font-medium transition-all duration-200 hover:scale-105 ${isCompact ? 'text-xs' : 'text-sm'}`}>
            <span className="mr-1">Read</span>
            <ExternalLink className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'}`} />
          </button>
          
          <div className={`bg-gradient-aurora rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300 ${isCompact ? 'w-6 h-0.5' : 'w-8 h-1'}`} />
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;