import { Router } from 'express';
import User from '../models/user.model.js';
import auth from '../middleware/auth.js';
import axios from 'axios';
import { format, subDays } from 'date-fns';
import Category from '../models/category.model.js';
import OpenAI from "openai";

const router = Router();

// --- FINAL DEBUGGING CODE for Azure OpenAI Client ---
const azureOpenAI = process.env.AZURE_OPENAI_KEY
  ? new OpenAI({
      apiKey: process.env.AZURE_OPENAI_KEY,
      // Manually building the full base URL to isolate the issue
      baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}`,
      defaultQuery: { "api-version": process.env.AZURE_OPENAI_API_VERSION },
      defaultHeaders: { "api-key": process.env.AZURE_OPENAI_KEY },
    })
  : null;

// GET /api/news - Fetch relevant news from NewsAPI.org
router.get('/', auth, async (req, res) => {
    try {
        const admin = await User.findById(req.user);
        let query;

        if (req.query.search) {
            query = req.query.search;
        } else {
            if (!admin || !admin.categories || admin.categories.length === 0) {
                return res.json({ articles: [] });
            }
    
            const categories = await Category.find({ name: { $in: admin.categories } });
            const allKeywords = categories.flatMap(cat => cat.keywords && cat.keywords.length > 0 ? cat.keywords : `"${cat.name}"`);
    
            query = allKeywords.join(' OR ');
        }

        const fromDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');

        const newsApiResponse = await axios.get('https://newsapi.org/v2/everything', {
            params: {
                q: query,
                from: fromDate,
                sortBy: 'relevancy',
                language: 'en',
                apiKey: process.env.NEWS_API_KEY,
            }
        });

        res.json({ articles: newsApiResponse.data.articles });

    } catch (err) {
        if (err.response) {
            console.error('NewsAPI Error:', err.response.data);
            return res.status(500).json({ message: `Failed to fetch news: ${err.response.data.message}` });
        }
        res.status(500).json({ message: 'Failed to fetch news from NewsAPI.org.', error: err.message });
    }
});

// POST /api/news/summarize - Summarize article text using Azure OpenAI
router.post('/summarize', auth, async (req, res) => {
    if (!azureOpenAI) {
        return res.status(500).json({ message: 'Azure OpenAI client is not initialized. Please check your API key.' });
    }
    try {
        const { textToSummarize } = req.body;
        if (!textToSummarize) return res.status(400).json({ message: 'No text provided to summarize.' });

        const prompt = `
            Generate a professional, newsletter-style summary of the following text.
            The summary must be approximately 2-3 paragraphs long, engaging, and informative.
            It must capture the main topic, key findings, and important conclusions.
            The tone should be objective and clear. Do not start with conversational phrases.

            TEXT:
            """
            ${textToSummarize}
            """

            SUMMARY:
        `;
        
        const response = await azureOpenAI.chat.completions.create({
            // The 'model' parameter is REMOVED because it's now part of the baseURL
            messages: [{ role: "user", content: prompt }],
        });
        
        const summary = response.choices[0].message.content;
        res.json({ summary });

    } catch (err) {
        console.error("Error during summarization with Azure OpenAI:", err);
        res.status(500).json({ message: 'Failed to generate summary.', error: err.message });
    }
});

export default router;