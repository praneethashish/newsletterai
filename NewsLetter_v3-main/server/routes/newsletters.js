import { Router } from 'express';
import { chromium } from 'playwright';
import { format } from 'date-fns';
import sgMail from '@sendgrid/mail';
import Newsletter from '../models/newsletter.model.js';
import User from '../models/user.model.js';
import auth from '../middleware/auth.js';
import Notification from '../models/notification.model.js';
import OpenAI from "openai";
import { templates } from '../utils/templates.js';

const router = Router();

// Azure OpenAI Client
const azureOpenAI = process.env.AZURE_OPENAI_KEY
  ? new OpenAI({
      apiKey: process.env.AZURE_OPENAI_KEY,
      baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}`,
      defaultQuery: { "api-version": process.env.AZURE_OPENAI_API_VERSION },
      defaultHeaders: { "api-key": process.env.AZURE_OPENAI_KEY },
    })
  : null;

// SendGrid Client Initialization
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log("✅ SendGrid client initialized.");
} else {
    console.warn("⚠️ SendGrid API Key not found. Email sending will be disabled.");
}

const createContentGenerationPrompt = (articles, title) => {
    const articlesForPrompt = articles.map(a => `- ${a.title}: ${a.summary}`).join('\n');
    return `
      You are a professional newsletter editor. Based on the following articles, write the body content for a newsletter titled "${title}".
      The content should include a short, engaging introduction, a main body summarizing the key points from the articles, and a brief conclusion.
      Your response must be ONLY the raw HTML content for the body, such as <p>, <ul>, <li>, and <h2> tags.
      Do NOT include a main title, date, or footer.

      ARTICLES:
      ${articlesForPrompt}
     `;
};

const buildArticlesHtml = (articles) => {
    return articles.map(article => `
        <div class="article">
            ${article.imageUrl ? `<img src="${article.imageUrl}" alt="${article.title}">` : ''}
            <h2>${article.title}</h2>
            <p>${article.summary || 'Summary not available.'}</p>
            <a href="${article.originalUrl}" target="_blank" class="read-more-btn">Read More</a>
        </div>
    `).join('');
};

// --- API ROUTES ---

router.get('/', auth, async (req, res) => {
  try {
    // Note: Assuming 'req.user' from your auth middleware contains the user's _id
    const newsletters = await Newsletter.find({ user: req.user }).sort({ createdAt: -1 });
    res.json(newsletters);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching newsletters.' });
  }
});

router.post('/generate-and-save', auth, async (req, res) => {
    // Debugging Step: Check if req.user exists right away.
    if (!req.user) {
        console.error("Authentication error: req.user is not defined. Ensure frontend sends Authorization token.");
        return res.status(401).json({ message: 'Authentication failed: User not found.' });
    }

    if (!azureOpenAI) {
        return res.status(500).json({ message: 'Azure OpenAI client is not initialized.' });
    }
    
    try {
        const { articles, title, category, templateId } = req.body;
        
        if (!articles || articles.length === 0 || !title || !category || !templateId) {
            return res.status(400).json({ message: 'Title, category, articles, and a template selection are required.' });
        }
        
        console.log("[AI LOG] Generating body content...");
        const prompt = createContentGenerationPrompt(articles, title);
        const aiResponse = await azureOpenAI.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
        });
        const generatedContent = aiResponse.choices[0].message.content;

        const template = templates[templateId];
        if (!template) {
            return res.status(400).json({ message: 'Invalid template selected.' });
        }

        const articlesHtml = buildArticlesHtml(articles);
        const finalHtml = template
            .replace('{{TITLE}}', title)
            .replace('{{DATE}}', format(new Date(), 'MMMM do, yyyy'))
            .replace('{{AI_INTRODUCTION}}', generatedContent)
            .replace('{{ARTICLES_HTML}}', articlesHtml);

        console.log("[PDF LOG] Launching headless browser...");
        
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();
        await page.setContent(finalHtml, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();
        console.log("[PDF LOG] PDF generation complete.");

        // 4. Save to Database
        const newNewsletter = new Newsletter({
            title,
            category,
            user: req.user, // The user ID from the auth middleware
            articles: articles.map(a => a._id),
            status: 'Not Sent',
            pdfContent: { data: Buffer.from(pdfBuffer), contentType: 'application/pdf' },
            htmlContent: finalHtml
        });
        await newNewsletter.save();
        
        const notification = new Notification({ 
            user: req.user, 
            newsletter: newNewsletter._id, 
            message: `New newsletter "${newNewsletter.title}" generated.` 
        });
        await notification.save();
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${title.replace(/\s/g, '_')}.pdf"`);
        res.send(pdfBuffer);

    } catch (err) {
        console.error("--- GENERATION FAILED ---", err);
        res.status(500).json({ message: 'Failed to generate newsletter.' });
    }
});

// Other routes remain the same...

router.get('/:id/download', auth, async (req, res) => {
    try {
        const newsletter = await Newsletter.findById(req.params.id);
        if (!newsletter || !newsletter.pdfContent || !newsletter.pdfContent.data) {
            return res.status(404).send('PDF not found.');
        }
        res.setHeader('Content-Type', newsletter.pdfContent.contentType);
        res.setHeader('Content-Disposition', `inline; filename="${newsletter.title.replace(/\s/g, '_')}.pdf"`);
        res.send(newsletter.pdfContent.data);
    } catch (err) {
        res.status(500).send('Server error while retrieving PDF.');
    }
});

router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const updatedNewsletter = await Newsletter.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(updatedNewsletter);
  } catch (err) {
    res.status(500).json({ message: 'Server error updating status.' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const newsletter = await Newsletter.findByIdAndDelete(req.params.id);
    if (!newsletter) {
      return res.status(404).json({ message: 'Newsletter not found.' });
    }
    res.json({ message: 'Newsletter deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error while deleting newsletter.' });
  }
});

router.post('/:id/send', auth, async (req, res) => {
    try {
        const { userIds } = req.body;
        if (!userIds || userIds.length === 0) {
            return res.status(400).json({ message: 'No recipients selected.' });
        }
        
        const newsletter = await Newsletter.findById(req.params.id);
        if (!newsletter) {
            return res.status(404).json({ message: 'Newsletter not found.' });
        }

        if (process.env.SENDGRID_API_KEY) {
            const recipients = await User.find({ '_id': { $in: userIds } }).select('email');
            if (recipients.length > 0) {
                 const msg = {
                    to: recipients.map(r => r.email),
                    from: { name: 'NewsLetterAI', email: process.env.FROM_EMAIL },
                    subject: `Your Newsletter: ${newsletter.title}`,
                    html: newsletter.htmlContent,
                };
                await sgMail.send(msg);
            }
        }

        newsletter.status = 'Sent';
        newsletter.recipients.addToSet(...userIds);
        await newsletter.save();
        
        try {
            const notifications = userIds.map(userId => ({
                user: userId,
                newsletter: newsletter._id,
                message: `You received the "${newsletter.title}" newsletter.`,
            }));
            if (notifications.length > 0) {
                await Notification.insertMany(notifications, { ordered: false });
            }
        } catch (notificationError) {
            console.error('CRITICAL: Failed to create notifications, but email was sent.', notificationError);
        }

        res.json({ message: `Newsletter successfully sent to ${userIds.length} user(s).` });

    } catch (err) {
        console.error('A major error occurred in the /send route:', err);
        res.status(500).json({ message: 'Failed to send newsletter due to a server error.' });
    }
});

export default router;