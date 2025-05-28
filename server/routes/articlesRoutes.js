import express from 'express';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load articles from JSON file
const articlesPath = join(__dirname, '../data/articles.json');
let articlesData = [];

try {
  articlesData = JSON.parse(readFileSync(articlesPath, 'utf8'));
} catch (error) {
  console.error('Error loading articles data:', error);
  // Initialize with default data if file doesn't exist
  articlesData = [
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
    },
    {
      id: 5,
      title: "Understanding Headache Types",
      summary: "Learn to identify different types of headaches and when to seek medical attention.",
      imageUrl: "https://images.pexels.com/photos/7176026/pexels-photo-7176026.jpeg",
      category: "Pain Management",
      readTime: "4 min read"
    }
  ];
}

/**
 * @route GET /api/articles
 * @desc Get all health articles
 * @access Public
 */
router.get('/', (req, res) => {
  try {
    // Add pagination if needed in the future
    const { limit = 10, page = 1 } = req.query;
    
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    
    const paginatedArticles = articlesData.slice(startIndex, endIndex);
    
    res.json({
      articles: paginatedArticles,
      currentPage: Number(page),
      totalPages: Math.ceil(articlesData.length / Number(limit)),
      totalArticles: articlesData.length
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route GET /api/articles/:id
 * @desc Get article by ID
 * @access Public
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const article = articlesData.find(article => article.id === Number(id));
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;