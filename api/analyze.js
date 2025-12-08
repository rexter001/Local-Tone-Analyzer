const express = require('express');
const cors = require('cors');
const Sentiment = require('sentiment');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/analyze', (req, res) => {
    const sentiment = new Sentiment();
    const text = req.body.text.toLowerCase();
    const language = req.body.language || 'en';
    
    // Language-specific sentiment words
    const languageSentimentWords = {
        en: {},
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
            'shanadar': 5, 'adbhut': 5, 'bhavya': 4, 'sundar': 4, 'khushi': 3, 'shandaar': 5, 'bahut accha': 5,
            'nafrat': -4, 'bhayanak': -4, 'ghatia': -3, 'kharab': -3, 'dukh': -2, 'bura': -4,
            'खुशी': 5, 'शानदार': 5, 'अद्भुत': 5, 'सुंदर': 4, 'प्यार': 4, 'भव्य': 5,
            'नफरत': -5, 'भयानक': -5, 'बुरा': -4, 'घटिया': -4, 'दुख': -3, 'बदसूरत': -4,
        },
        te: {
            'mancham': 4, 'abhutham': 5, 'sundaram': 4, 'bagundi': 4, 'priyam': 3,
            'bhayankaram': -4, 'chedda': -3, 'inka': -2, 'dvesha': -4,
            'ఆనందం': 5, 'బాగుంది': 4, 'అద్భుతమైన': 5, 'సుందరం': 4, 'మంచం': 4, 'ప్రియం': 4,
            'ఇంక': -2, 'భయంకరమైన': -5, 'డమ్ముల': -3, 'చెడ్డ': -4, 'ద్వేష': -4,
        },
        ta: {
            'sandosham': 4, 'nallam': 4, 'arupudhamaana': 5, 'nandraaga': 4, 'anbu': 4,
            'sogam': -3, 'payangaram': -4, 'mosam': -3, 'ketta': -4, 'vexam': -3,
            'சந்தோஷம்': 5, 'நல்லம்': 4, 'அற்புதமான': 5, 'நன்றாக': 4, 'அன்பு': 4,
            'சோகம்': -4, 'பயங்கரமான': -5, 'மோசமான': -4, 'கெட்ட': -4,
        },
        ja: {
            'shiawase': 4, 'subarashii': 5, 'suteki': 4, 'yushu': 4, 'ai': 3,
            'kanashii': -4, 'osoroshii': -5, 'warui': -3, 'kirai': -4, 'minikui': -3,
            '幸せ': 5, '素晴らしい': 5, '素敵': 4, '優秀': 4, '愛': 4,
            '悲しい': -5, '恐ろしい': -5, '悪い': -4, '嫌い': -4, '醜い': -4,
        },
        zh: {
            'gaoxing': 4, 'henhao': 4, 'miaomiao': 5, 'chuose': 4, 'ai': 3,
            'shangxin': -4, 'kepa': -4, 'huaida': -3, 'taoyan': -4, 'choulou': -4,
            '高兴': 5, '很好': 5, '妙妙': 5, '出色': 4, '爱': 4,
            '伤心': -5, '可怕': -5, '坏的': -4, '讨厌': -5, '丑陋': -4,
        },
        la: {
            'laetus': 4, 'magnus': 4, 'mirabilis': 5, 'pulcher': 4, 'amatissimus': 4,
            'tristis': -4, 'terribilis': -5, 'horribilis': -5, 'malus': -3, 'odium': -4, 'turpis': -4,
        }
    };
    
    const customWords = languageSentimentWords[language] || {};
    
    let customScore = 0;
    let customPositive = [];
    let customNegative = [];
    
    const words = text.split(/\s+/);
    
    for (let word of words) {
        if (customWords[word]) {
            const score = customWords[word];
            if (score > 0) {
                customPositive.push(word);
                customScore += score;
            } else if (score < 0) {
                customNegative.push(word);
                customScore += score;
            }
        }
    }
    
    let result = { positive: [], negative: [], score: 0 };
    
    if (language === 'en') {
        result = sentiment.analyze(text);
    }
    
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
        comparative: finalScore / (words.length || 1),
        positiveWords: finalPositive,
        negativeWords: finalNegative
    });
});

module.exports = app;
