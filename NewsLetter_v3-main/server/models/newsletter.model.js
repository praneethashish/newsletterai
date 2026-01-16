import mongoose from 'mongoose';
const { Schema } = mongoose;

const newsletterSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    // This field correctly links a newsletter to its creator.
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: true,
        index: true 
    },
    articles: [{
        type: Schema.Types.ObjectId,
        ref: 'Article'
    }],
    status: {
        type: String,
        enum: ['Not Sent', 'Sent', 'Draft'],
        default: 'Not Sent'
    },
    recipients: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    pdfContent: {
        data: Buffer,
        contentType: String
    },
    htmlContent: {
        type: String
    }
}, {
    timestamps: true
});

// This compound index is the key to the performance fix.
// It makes finding newsletters for a specific user very fast.
newsletterSchema.index({ user: 1, category: 1 });

const Newsletter = mongoose.model('Newsletter', newsletterSchema);

export default Newsletter;