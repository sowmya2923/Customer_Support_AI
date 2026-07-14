/**
 * Upgraded AI Helper utilising Gemini 1.5 Flash
 * Extracts Category, Priority, Sentiment, Department, and generates three unique draft replies (Direct, Empathetic, Technical).
 * Falls back to a robust keyword-sensitive simulation when no API key is set.
 */

const isAICanRun = !!process.env.GEMINI_API_KEY;

/**
/**
 * Classifies a support ticket and generates multiple drafts in a single API call
 * @param {string} title - Ticket title
 * @param {string} description - Ticket description
 * @param {Array} kbArticles - Optional Knowledge Base articles for context (RAG)
 * @param {string} clientTier - The membership tier of the customer ('free', 'membership', 'premium')
 * @returns {Promise<object>} - AI analysis payload
 */
const analyzeTicket = async (title, description, kbArticles = [], clientTier = 'free') => {
  if (!isAICanRun) {
    return simulateFullAnalysis(title, description, kbArticles, clientTier);
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    const kbContext = kbArticles.length > 0
      ? kbArticles.map(a => `Article: ${a.title}\nContent: ${a.content}`).join('\n---\n')
      : 'No relevant articles found.';

    const systemPrompt = `You are a helpful customer support AI analyzer and response writer.
    Analyze this ticket and return a JSON object (no markdown, no code blocks, raw JSON only) satisfying this schema:
    {
      "category": "technical" | "billing" | "account" | "product_inquiry" | "feature_request" | "bug" | "complaint" | "general",
      "priority": "low" | "medium" | "high" | "critical",
      "sentiment": "positive" | "neutral" | "frustrated" | "angry",
      "department": "finance" | "engineering" | "qa" | "product" | "support",
      "drafts": {
        "direct": "Concise, fast, and straight-to-the-point response.",
        "empathetic": "A very warm, apologetic, and highly customer-centric response.",
        "technical": "A detailed, step-by-step troubleshooting response."
      }
    }

    Priority Escalation Rules based on User Membership Tier ("${clientTier}"):
    - If customer tier is "premium", priority should be "critical" if sentiment is "angry" or "frustrated" or if the ticket is urgent. Otherwise, default premium priority is "high".
    - If customer tier is "membership", priority should be "high" if sentiment is "angry" or "frustrated" or if the ticket is urgent. Otherwise, default priority is "medium".
    - If customer tier is "free", assign "high" for urgent/angry, otherwise "medium" or "low".

    Department mapping rules:
    - billing -> "finance"
    - bug -> "qa"
    - technical -> "engineering"
    - feature_request -> "product"
    - others -> "support"

    Reference help documentation context:
    ${kbContext}

    Ticket Title: "${title}"
    Ticket Description: "${description}"`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
        }
      }),
    });

    const data = await response.json();
    const textResult = data.candidates[0].content.parts[0].text;
    const result = JSON.parse(textResult.trim());
    
    return {
      category: result.category || 'general',
      priority: result.priority || 'medium',
      sentiment: result.sentiment || 'neutral',
      department: result.department || 'support',
      drafts: {
        direct: result.drafts?.direct || 'Hello, we are looking into your request.',
        empathetic: result.drafts?.empathetic || 'Hello, we apologize for the issue and are resolving it.',
        technical: result.drafts?.technical || 'Hello, please try clearing cache and logging back in.'
      }
    };
  } catch (error) {
    console.error('Gemini Full Analysis API Error, falling back to simulation:', error.message);
    return simulateFullAnalysis(title, description, kbArticles, clientTier);
  }
};

/**
 * Highly dynamic local simulator that checks text context for sentiment and keywords
 */
function simulateFullAnalysis(title, description, kbArticles = [], clientTier = 'free') {
  const text = `${title} ${description}`.toLowerCase();
  
  // 1. Predict Sentiment (Emotions)
  let sentiment = 'neutral';
  if (text.includes('happy') || text.includes('great') || text.includes('thanks') || text.includes('perfect') || text.includes('love')) {
    sentiment = 'positive';
  } else if (text.includes('angry') || text.includes('worst') || text.includes('rubbish') || text.includes('useless') || text.includes('charged twice') || text.includes('scam') || text.includes('!!') || text.includes('terrible')) {
    sentiment = 'angry';
  } else if (text.includes('delay') || text.includes('slow') || text.includes('waiting') || text.includes('crashed') || text.includes('broken') || text.includes('fail') || text.includes('stuck') || text.includes('error')) {
    sentiment = 'frustrated';
  }

  // 2. Predict Category & Department
  let category = 'general';
  let department = 'support';
  
  if (text.includes('pay') || text.includes('bill') || text.includes('invoice') || text.includes('charge') || text.includes('refund') || text.includes('price') || text.includes('subscription')) {
    category = 'billing';
    department = 'finance';
  } else if (text.includes('bug') || text.includes('crash') || text.includes('freeze') || text.includes('broken') || text.includes('loop') || text.includes('error')) {
    category = 'bug';
    department = 'qa';
  } else if (text.includes('setup') || text.includes('api') || text.includes('integration') || text.includes('code') || text.includes('server') || text.includes('port') || text.includes('econnrefused')) {
    category = 'technical';
    department = 'engineering';
  } else if (text.includes('feature') || text.includes('suggest') || text.includes('improve') || text.includes('request') || text.includes('idea')) {
    category = 'feature_request';
    department = 'product';
  } else if (text.includes('account') || text.includes('password') || text.includes('login') || text.includes('profile') || text.includes('register')) {
    category = 'account';
    department = 'support';
  }

  // 3. Auto-Escalation based on Client Tier and Sentiment
  const isUrgent = text.includes('urgent') || text.includes('immediate') || text.includes('critical') || text.includes('down') || text.includes('emergency') || text.includes('deadline');
  let priority = 'medium';

  if (clientTier === 'premium') {
    priority = (sentiment === 'angry' || sentiment === 'frustrated' || isUrgent) ? 'critical' : 'high';
  } else if (clientTier === 'membership') {
    priority = (sentiment === 'angry' || sentiment === 'frustrated' || isUrgent) ? 'high' : 'medium';
  } else {
    priority = (sentiment === 'angry' || isUrgent) ? 'high' : 'medium';
  }

  // 4. Retrieve KB context for dynamic responses
  let kbInfo = '';
  if (kbArticles && kbArticles.length > 0) {
    kbInfo = `Based on help article "${kbArticles[0].title}":\n${kbArticles[0].content.substring(0, 150)}...\n\n`;
  }

  // 5. Generate 3 unique responses dynamically based on user context
  const tierGreeting = clientTier !== 'free' 
    ? `Thank you for being a valued ${clientTier.toUpperCase()} member. ` 
    : '';

  const directText = `Hello,

${tierGreeting}We have received your ticket regarding "${title}". 

${kbInfo}We have routed this issue to our ${department.toUpperCase()} department. Our team will review the logs and reply shortly.

Best regards,
Support Team`;

  const empatheticText = `Hello,

Thank you for reaching out, and we are truly sorry for the frustration this is causing you. ${tierGreeting}We completely understand how critical this issue is. 

${kbInfo}I have escalated this ticket immediately to our ${department.toUpperCase()} team as a ${priority.toUpperCase()} priority. They are reviewing it right now and we will update you the moment we have a solution. Thank you for your patience!

Best regards,
Support Team`;

  const technicalText = `Hello,

Thank you for contacting support. ${tierGreeting}To troubleshoot this issue:

1. ${kbInfo ? kbInfo.trim() : `We have assigned this ticket to our technical systems department (${department.toUpperCase()}).`}
2. Please verify your internet connection, clear your browser cookies/cache, and sign out.
3. Try performing the action again in an Incognito window.

If the problem persists, please reply to this message with any screenshot or error log.

Best regards,
${department.toUpperCase()} Support Engineer`;

  return {
    category,
    priority,
    sentiment,
    department,
    drafts: {
      direct: directText,
      empathetic: empatheticText,
      technical: technicalText
    }
  };
}


const suggestReply = async (ticket, kbArticles = []) => {
  const analysis = await analyzeTicket(ticket.title, ticket.description, kbArticles);
  return analysis.drafts;
};
module.exports = { analyzeTicket, suggestReply };

