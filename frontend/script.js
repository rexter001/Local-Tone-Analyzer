// Configuration
// Detect if running locally or on Vercel
let API_URL;
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    API_URL = 'http://localhost:3000'; // Local development
} else {
    API_URL = window.location.origin; // Vercel or production
}

// Language Examples (Display in native script)
const languageExamples = {
    en: {
        positive: ['happy', 'great', 'excellent', 'wonderful', 'awesome', 'love', 'beautiful'],
        negative: ['sad', 'terrible', 'awful', 'horrible', 'bad', 'hate', 'ugly']
    },
    te: {
        positive: ['ఆనందం (joy)', 'బాగుంది (good)', 'అద్భుతమైన (wonderful)', 'సుందరం (beautiful)', 'మంచం (good)', 'ప్రియం (lovely)', 'శ్రీవ్యయం (excellent)'],
        negative: ['ఇంక (further)', 'భయంకరమైన (terrifying)', 'డమ్ముల (bad)', 'చెడ్డ (bad)', 'ద్వేష (hate)', 'అరుగుతున్నము (suffering)', 'అసెలనం (waste)']
    },
    hi: {
        positive: ['खुशी (happiness)', 'बहुत अच्छा (very good)', 'शानदार (wonderful)', 'अद्भुत (amazing)', 'सुंदर (beautiful)', 'प्यार (love)', 'भव्य (magnificent)'],
        negative: ['दुख (sadness)', 'भयानक (terrifying)', 'बुरा (bad)', 'घटिया (poor)', 'नफरत (hate)', 'बदसूरत (ugly)', 'अप्रिय (unpleasant)']
    },
    ta: {
        positive: ['சந்தோஷம் (happiness)', 'நல்லம் (good)', 'அற்புதமான (wonderful)', 'நன்றாக (good)', 'அன்பு (love)', 'சுந்தரை (beautiful)', 'பணிவை (humble)'],
        negative: ['சோகம் (sadness)', 'பயங்கரமான (terrifying)', 'மோசமான (bad)', 'கெட்ட (bad)', 'வெறுப்பு (hate)', 'கோணம் (angle/wrong)', 'அப்రியமான (unpleasant)']
    },
    de: {
        positive: ['glücklich', 'hervorragend', 'wunderbar', 'großartig', 'toll', 'liebe', 'schön'],
        negative: ['traurig', 'schrecklich', 'furchtbar', 'schlecht', 'hasse', 'hässlich', 'unangenehm']
    },
    la: {
        positive: ['laetus', 'magnus', 'mirabilis', 'pulcher', 'amatissimus', 'amor', 'bonus'],
        negative: ['tristis', 'terribilis', 'horribilis', 'malus', 'odium', 'turpis', 'ingratus']
    },
    ja: {
        positive: ['幸せ (shiawase-happiness)', '素晴らしい (subarashii-wonderful)', '素敵 (suteki-lovely)', '優秀 (yushu-excellent)', '愛 (ai-love)', '美しい (utsukushii-beautiful)', '最高 (saiko-best)'],
        negative: ['悲しい (kanashii-sad)', '恐ろしい (osoroshii-terrifying)', '悪い (warui-bad)', '嫌い (kirai-hate)', '醜い (minikui-ugly)', '不快 (fukai-unpleasant)', '最悪 (saiaku-worst)']
    },
    zh: {
        positive: ['高兴 (gaoxing-happy)', '很好 (henhao-very good)', '妙妙 (miaomiao-wonderful)', '出色 (chuose-excellent)', '爱 (ai-love)', '美丽 (meili-beautiful)', '厉害 (lihai-amazing)'],
        negative: ['伤心 (shangxin-sad)', '可怕 (kepa-scary)', '坏的 (huaida-bad)', '讨厌 (taoyan-hate)', '丑陋 (choulou-ugly)', '令人不快 (unpleasant)', '糟糕 (zaogao-terrible)']
    },
    es: {
        positive: ['feliz', 'excelente', 'maravilloso', 'genial', 'magnífico', 'me encanta', 'hermoso'],
        negative: ['triste', 'terrible', 'horrible', 'malo', 'odio', 'feo', 'desagradable']
    },
    fr: {
        positive: ['heureux', 'excellent', 'merveilleux', 'super', 'magnifique', 'adorable', 'beau'],
        negative: ['triste', 'terrible', 'horrible', 'mauvais', 'haïr', 'laid', 'désagréable']
    }
};

// DOM Elements
const textInput = document.getElementById('textInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const spinner = document.getElementById('spinner');
const btnText = document.getElementById('btnText');
const errorMsg = document.getElementById('errorMsg');
const results = document.getElementById('results');
const languageSelect = document.getElementById('languageSelect');
const examplesBox = document.getElementById('examplesBox');
const examplePositive = document.getElementById('examplePositive');
const exampleNegative = document.getElementById('exampleNegative');

// Results Elements
const sentimentBar = document.getElementById('sentimentBar');
const scoreValue = document.getElementById('scoreValue');
const sentimentType = document.getElementById('sentimentType');
const comparativeScore = document.getElementById('comparativeScore');
const positiveWords = document.getElementById('positiveWords');
const negativeWords = document.getElementById('negativeWords');
const positiveCount = document.getElementById('positiveCount');
const negativeCount = document.getElementById('negativeCount');
const totalWords = document.getElementById('totalWords');

// Event Listeners
analyzeBtn.addEventListener('click', analyzeSentiment);
languageSelect.addEventListener('change', updateExamples);
textInput.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        analyzeSentiment();
    }
});

// Initialize
updateExamples();

function updateExamples() {
    const lang = languageSelect.value;
    const examples = languageExamples[lang];
    
    if (examples) {
        examplePositive.textContent = examples.positive.join(', ');
        exampleNegative.textContent = examples.negative.join(', ');
    }
}

// Main Analysis Function
async function analyzeSentiment() {
    const text = textInput.value.trim();

    // Validation
    if (!text) {
        showError('Please enter some text to analyze');
        return;
    }

    if (text.length < 3) {
        showError('Please enter at least 3 characters');
        return;
    }

    // Reset UI
    hideError();
    setLoading(true);
    results.classList.add('hidden');

    try {
        // API Call
        const response = await fetch(`${API_URL}/api/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                text: text,
                language: languageSelect.value
            }),
        });

        if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}`);
        }

        const data = await response.json();

        // Display Results
        displayResults(data);
        results.classList.remove('hidden');

    } catch (error) {
        console.error('Error:', error);
        const errorMessage = error.message.includes('fetch') 
            ? 'Cannot connect to server. Make sure the backend is running on http://localhost:3000'
            : `Failed to analyze sentiment: ${error.message}`;
        showError(errorMessage);
    } finally {
        setLoading(false);
    }
}

// Display Results
function displayResults(data) {
    // Extract data with defaults
    const score = data.score || 0;
    const comparative = data.comparative || 0;
    const posWords = data.positiveWords || [];
    const negWords = data.negativeWords || [];

    // Update Score and Bar
    scoreValue.textContent = score.toFixed(2);
    const percentage = Math.min(100, Math.max(0, (score + 5) * 10));
    sentimentBar.style.width = percentage + '%';

    // Update Sentiment Type
    if (score > 0.5) {
        sentimentType.textContent = 'Very Positive';
        sentimentType.className = 'detail-value positive';
    } else if (score > 0) {
        sentimentType.textContent = 'Positive';
        sentimentType.className = 'detail-value positive';
    } else if (score < -0.5) {
        sentimentType.textContent = 'Very Negative';
        sentimentType.className = 'detail-value negative';
    } else if (score < 0) {
        sentimentType.textContent = 'Negative';
        sentimentType.className = 'detail-value negative';
    } else {
        sentimentType.textContent = 'Neutral';
        sentimentType.className = 'detail-value';
    }

    // Update Comparative Score
    comparativeScore.textContent = comparative.toFixed(4);

    // Update Word Counts
    positiveCount.textContent = posWords.length;
    negativeCount.textContent = negWords.length;
    totalWords.textContent = posWords.length + negWords.length;

    // Display Words
    displayWords(positiveWords, posWords, 'positive');
    displayWords(negativeWords, negWords, 'negative');
}

// Display Word Lists
function displayWords(container, words, type) {
    container.innerHTML = '';

    if (words.length === 0) {
        const noWordsSpan = document.createElement('span');
        noWordsSpan.className = 'no-words';
        noWordsSpan.textContent = `No ${type} words found`;
        container.appendChild(noWordsSpan);
        return;
    }

    words.forEach((word) => {
        const tag = document.createElement('span');
        tag.className = 'word-tag';
        tag.textContent = word;
        container.appendChild(tag);
    });
}

// UI Helper Functions
function showError(message) {
    errorMsg.textContent = message;
    errorMsg.classList.remove('hidden');
    results.classList.add('hidden');
}

function hideError() {
    errorMsg.classList.add('hidden');
}

function setLoading(isLoading) {
    analyzeBtn.disabled = isLoading;
    if (isLoading) {
        spinner.classList.remove('hidden');
        btnText.textContent = 'Analyzing...';
    } else {
        spinner.classList.add('hidden');
        btnText.textContent = 'Analyze Sentiment';
    }
}

// Auto-focus on page load
window.addEventListener('load', () => {
    textInput.focus();
});
