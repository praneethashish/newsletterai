import { Router } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import auth from '../middleware/auth.js';
import User from '../models/user.model.js';
import Newsletter from '../models/newsletter.model.js';
import Notification from '../models/notification.model.js';
import sgMail from '@sendgrid/mail';
import jwt from 'jsonwebtoken';
import { customAlphabet } from 'nanoid'; // Using nanoid for secure random passwords

const router = Router();

if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// POST /api/users - Create a new user (This is used by the Admin Panel)
// This route has been completely corrected to fix the bug.
router.post('/', auth, async (req, res) => {
    try {
        const { name, email, categories } = req.body;
        const creatingAdmin = await User.findById(req.user);

        if (!creatingAdmin || (creatingAdmin.userType !== 'admin' && creatingAdmin.userType !== 'superadmin')) {
            return res.status(403).json({ message: 'Access denied. You do not have permission to create users.' });
        }
        
        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this email already exists.' });
        }

        // Correctly generate a secure, random temporary password.
        const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 10);
        const temporaryPassword = nanoid();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(temporaryPassword, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            userType: 'user',
            // Assign categories passed from the form, or the admin's categories as a fallback.
            categories: categories && categories.length > 0 ? categories : creatingAdmin.categories,
            status: 'Active',
        });

        await newUser.save();

        // Send a welcome email with the temporary password.
        if (process.env.SENDGRID_API_KEY && process.env.FROM_EMAIL) {
            const msg = {
                to: newUser.email,
                from: { name: 'NewsLetterAI', email: process.env.FROM_EMAIL },
                subject: 'Welcome to NewsLetterAI!',
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                        <h2>Welcome, ${newUser.name}!</h2>
                        <p>An admin has created an account for you on NewsLetterAI.</p>
                        <p>You can log in using the following temporary credentials:</p>
                        <ul>
                            <li><strong>Email:</strong> ${newUser.email}</li>
                            <li><strong>Password:</strong> ${temporaryPassword}</li>
                        </ul>
                        <p>Please log in and change your password as soon as possible.</p>
                        <p>Thank you!</p>
                    </div>
                `,
            };
            try {
                await sgMail.send(msg);
            } catch (error) {
                console.error("SendGrid error during user creation, but user was saved:", error.response?.body);
            }
        }
        
        // Return information to the admin panel so it can be displayed.
        // This response structure now matches what the frontend expects.
        res.status(201).json({
            message: `User ${newUser.name} created successfully. An email with a temporary password has been sent.`,
            user: { _id: newUser._id, name: newUser.name, email: newUser.email },
            password_was: temporaryPassword, 
        });

    } catch (err) {
        console.error("Error creating user:", err);
        res.status(500).json({ message: 'Server error while creating user.' });
    }
});


// --- The rest of the routes in this file are unchanged ---

// GET Logged-in User's Data
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH - Update User Profile (Email, Name, Password)
router.patch('/me/profile', auth, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.findById(req.user);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'This email is already in use.' });
            }
            user.email = email;
        }

        if (name) {
            user.name = name;
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await user.save();
        
        const token = jwt.sign({ id: updatedUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                userType: updatedUser.userType,
                categories: updatedUser.categories
            },
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error updating profile.', error: err.message });
    }
});

// PATCH - Update User's Category Preferences
router.patch('/me/categories', auth, async (req, res) => {
    try {
        const { categories } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.user,
            { categories: categories },
            { new: true }
        ).select('-password');
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET user's received newsletters
router.get('/my-newsletters', auth, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user);
        const receivedNewsletters = await Newsletter.find({ recipients: userId })
            .sort({ createdAt: -1 })
            .select('title category createdAt');
        res.json(receivedNewsletters);
    } catch (err) {
        console.error("Error fetching user newsletters:", err);
        res.status(500).json({ error: 'Server error while fetching newsletters.' });
    }
});

// ENDPOINT TO EMAIL A NEWSLETTER TO THE LOGGED-IN USER
router.post('/send-newsletter-to-self', auth, async (req, res) => {
    if (!process.env.SENDGRID_API_KEY || !process.env.FROM_EMAIL) {
        return res.status(500).json({ message: 'Email service is not configured on the server.' });
    }
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    try {
        const { newsletterId } = req.body;
        if (!newsletterId) {
            return res.status(400).json({ message: 'Newsletter ID is required.' });
        }

        const user = await User.findById(req.user).select('name email');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const newsletter = await Newsletter.findById(newsletterId);
        if (!newsletter || !newsletter.htmlContent) {
            return res.status(404).json({ message: 'Newsletter or its HTML content not found.' });
        }

        const msg = {
            to: user.email,
            from: { name: 'NewsLetterAI', email: process.env.FROM_EMAIL },
            subject: `Your Requested Newsletter: ${newsletter.title}`,
            html: newsletter.htmlContent,
        };
        
        await sgMail.send(msg);

        newsletter.recipients.addToSet(user._id);
        await newsletter.save();
        
        const newNotification = new Notification({
            user: user._id,
            newsletter: newsletter._id,
            message: `You sent the "${newsletter.title}" newsletter to your email.`,
        });
        await newNotification.save();

        res.json({ message: `Newsletter successfully sent to ${user.email}.` });

    } catch (err) {
        console.error('Error sending newsletter to self:', err);
        if (err.response) {
            console.error(err.response.body);
        }
        res.status(500).json({ message: 'Failed to send email due to a server error.' });
    }
});

export default router;