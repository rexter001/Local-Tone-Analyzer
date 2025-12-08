const express = require('express');
const cors = require('cors');
const Sentiment = require('sentiment');

const app = express();
app.use(cors());
app.use(express.json()); // <-- built-in JSON parser

app.post('/analyze', (req, res) => {
    const sentiment = new Sentiment();
    const text = req.body.text.toLowerCase();
    const language = req.body.language || 'en'; // Get language from request
    
    // Language-specific sentiment words
    const languageSentimentWords = {
        en: {
            // English - use default sentiment analysis
        },
        es: {
            'maravilloso': 5, 'magnífico': 5, 'fantástico': 5, 'excelente': 5, 'perfecto': 5,
            'asqueroso': -5, 'repugnante': -5, 'horrible': -5, 'terrible': -5, 'decepcionado': -3,
            'encanta': 4, 'hermoso': 4, 'genial': 4, 'odio': -4, 'feo': -3,
        },
        fr: {
            'merveilleux': 5, 'magnifique': 5, 'fantastique': 5, 'excellent': 5, 'adorable': 4,
            'dégoûtant': -5, 'horrible': -5, 'terrible': -5, 'déçu': -3, 'haïr': -4, 'laid': -3,
        },
        de: {
            'wunderbar': 5, 'hervorragend': 5, 'fantastisch': 5, 'ausgezeichnet': 5, 'schön': 4,
            'ekelhaft': -5, 'schrecklich': -5, 'furchtbar': -5, 'enttäuscht': -3, 'hasse': -4, 'hässlich': -3,
        },
        hi: {
            // Romanized
            'shanadar': 5, 'adbhut': 5, 'bhavya': 4, 'sundar': 4, 'khushi': 3, 'shandaar': 5, 'bahut accha': 5,
            'nafrat': -4, 'bhayanak': -4, 'ghatia': -3, 'kharab': -3, 'dukh': -2, 'bura': -4, 'bilkul': -1,
            'bagundi': 4, 'mancham': 4, 'pyaar': 3, 'accha': 4, 'achha': 4,
            'chota': -2, 'ganda': -4, 'badsurath': -4, 'apriay': -3, 'abse': -4, 'abuse': -4,
            // Native Hindi Script
            'खुशी': 5, 'शानदार': 5, 'अद्भुत': 5, 'सुंदर': 4, 'प्यार': 4, 'भव्य': 5,
            'नफरत': -5, 'भयानक': -5, 'बुरा': -4, 'घटिया': -4, 'दुख': -3, 'बदसूरत': -4, 'अप्रिय': -3,
        },
        te: {
            // Romanized
            'mancham': 4, 'abhutham': 5, 'sundaram': 4, 'bagundi': 4, 'priyam': 3,
            'bhayankaram': -4, 'chedda': -3, 'inka': -2, 'dvesha': -4,
            // Native Telugu Script
            'ఆనందం': 5, 'బాగుంది': 4, 'అద్భుతమైన': 5, 'సుందరం': 4, 'మంచం': 4, 'ప్రియం': 4,
            'ఇంక': -2, 'భయంకరమైన': -5, 'డమ్ముల': -3, 'చెడ్డ': -4, 'ద్వేష': -4,
        },
        ta: {
            // Romanized
            'nallam': 4, 'arutputhiam': 5, 'sundarai': 4, 'anpu': 3, 'nandrai': 4,
            'sogam': -3, 'mosam': -3, 'veruppam': -4, 'kettu': -3,
            // Native Tamil Script
            'சந்தோஷம்': 5, 'நல்லம்': 4, 'அற்புதமான': 5, 'சுந்தரை': 4, 'அன்பு': 4,
            'சோகம்': -4, 'பயங்கரமான': -5, 'மோசமான': -4, 'கெட்ட': -4, 'வெறுப்பு': -4,
        },
        ja: {
            // Romanized
            'subarashii': 5, 'saiko': 4, 'yushu': 4, 'shiawase': 4, 'suteki': 4,
            'kanashii': -3, 'warui': -3, 'osoroshii': -4, 'saiaku': -4,
            // Native Japanese Script
            '幸せ': 5, '素晴らしい': 5, '素敵': 4, '愛': 4, '美しい': 4, '最高': 5,
            '悲しい': -4, '恐ろしい': -5, '悪い': -3, '嫌い': -4, '最悪': -5,
        },
        zh: {
            // Romanized (Pinyin)
            'miaomiao': 5, 'henhao': 4, 'gaoxing': 4, 'ai': 3, 'lihai': 4,
            'shangxin': -3, 'kepa': -3, 'taoyan': -4, 'zaogao': -3,
            // Native Chinese Script
            '高兴': 5, '很好': 4, '妙妙': 5, '爱': 4, '美丽': 4, '厉害': 4,
            '伤心': -4, '可怕': -4, '坏的': -3, '讨厌': -5, '丑陋': -4, '糟糕': -4,
        },
        la: {
            'mirabilis': 4, 'pulcher': 4, 'laetus': 3, 'amor': 3,
            'horribilis': -4, 'terribilis': -4, 'odium': -4
        }
    };
    
    // First get the default sentiment analysis (for English)
    const result = sentiment.analyze(text);
    
    // Get sentiment words for the selected language
    const currentLanguageWords = languageSentimentWords[language] || {};
    
    // Add language-specific sentiment words
    let customScore = 0;
    let customPositive = [];
    let customNegative = [];
    
    for (const [word, value] of Object.entries(currentLanguageWords)) {
        if (text.includes(word)) {
            if (value > 0) {
                customPositive.push(word);
                customScore += value;
            } else {
                customNegative.push(word);
                customScore += value;
            }
        }
    }
    
    // For English, use default sentiment words. For other languages, use custom words only
    let finalPositive = customPositive;
    let finalNegative = customNegative;
    let finalScore = customScore;
    
    if (language === 'en') {
        finalPositive = [...new Set([...result.positive, ...customPositive])];
        finalNegative = [...new Set([...result.negative, ...customNegative])];
        finalScore = result.score + customScore;
    }
    
    res.json({
        text: text,
        score: finalScore,
        comparative: finalScore / text.split(/\s+/).length,
        positiveWords: finalPositive,
        negativeWords: finalNegative
    });
});

app.get('/', (req, res) => {
    res.send('Welcome to Local Tone Analyzer!');
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
}

// Export for Vercel
module.exports = app;
