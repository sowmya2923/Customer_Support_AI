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
function simulateFullAnalysis(title, description, kbArticles = [], clientTier = 'free', variationSeed = Date.now()) {
  const text = `${title} ${description}`.toLowerCase();
  const contains = (...terms) => terms.some((term) => text.includes(term));
  let sentiment = contains('happy', 'great', 'thanks', 'perfect', 'love') ? 'positive' : 'neutral';
  if (contains('angry', 'worst', 'rubbish', 'useless', 'charged twice', 'scam', 'terrible', '!!')) sentiment = 'angry';
  else if (contains('delay', 'slow', 'waiting', 'crashed', 'broken', 'fail', 'stuck', 'error')) sentiment = 'frustrated';

  let category = 'general';
  let department = 'support';
  if (contains('pay', 'bill', 'invoice', 'charge', 'refund', 'price', 'subscription')) { category = 'billing'; department = 'finance'; }
  else if (contains('bug', 'crash', 'freeze', 'broken', 'loop', 'error')) { category = 'bug'; department = 'qa'; }
  else if (contains('setup', 'api', 'integration', 'code', 'server', 'port', 'econnrefused')) { category = 'technical'; department = 'engineering'; }
  else if (contains('feature', 'suggest', 'improve', 'request', 'idea')) { category = 'feature_request'; department = 'product'; }
  else if (contains('account', 'password', 'login', 'profile', 'register')) { category = 'account'; department = 'support'; }

  const urgent = contains('urgent', 'immediate', 'critical', 'down', 'emergency', 'deadline');
  const priority = clientTier === 'premium'
    ? ((sentiment === 'angry' || sentiment === 'frustrated' || urgent) ? 'critical' : 'high')
    : clientTier === 'membership'
      ? ((sentiment === 'angry' || sentiment === 'frustrated' || urgent) ? 'high' : 'medium')
      : ((sentiment === 'angry' || urgent) ? 'high' : 'medium');

  const seed = Math.abs([...`${title}|${description}|${variationSeed}`].reduce((sum, char) => ((sum * 31) + char.charCodeAt(0)) | 0, 7));
  const pick = (items) => items[seed % items.length];
  const tierLine = clientTier === 'free' ? '' : `Your ${clientTier} membership has been noted for this review. `;
  const kbLine = kbArticles[0] ? `I also checked our guidance, "${kbArticles[0].title}", while preparing the next step. ` : '';
  const plans = {
    billing: [['verify the payment record and subscription status', 'Please share the invoice reference or the last four digits of the payment method if we need to match the charge.'], ['review the charge timeline and entitlement update', 'Keep the receipt handy; it lets finance reconcile the payment without asking you to repeat the details.'], ['confirm whether the charge is pending, duplicated, or completed', 'We will update you after the billing status and account access are aligned.']],
    technical: [['reproduce the reported setup or integration behavior', 'Please include the exact error message and the step where the issue occurs in your reply.'], ['check the affected endpoint, configuration, and service status', 'A screenshot or a short request log will help engineering narrow this down quickly.'], ['compare the reported behavior with the expected product flow', 'We will share the next diagnostic step once the initial review is complete.']],
    bug: [['document the reproduction path for QA review', 'If possible, let us know your browser, device, and the time the issue last occurred.'], ['triage the report against known product defects', 'We will keep this ticket linked to the investigation and send you the outcome.'], ['validate the failure against the latest release', 'Any screen recording or error reference will help us verify the fix faster.']],
    account: [['review the account access and verification state', 'For security, please do not send passwords or one-time codes in this conversation.'], ['check the sign-in and profile status attached to this request', 'We will let you know the safest next action after the account review.']],
    feature_request: [['capture the use case for product review', 'The most useful detail is the outcome you are trying to achieve and how often this workflow occurs.'], ['assess the request against current product capabilities', 'We will share whether there is an existing workaround or a product review path.']],
    general: [['review the request with the appropriate support specialist', 'We will follow up here with a clear next step rather than asking you to start over.'], ['identify the right owner and resolution path for this request', 'Please add any detail that would make the desired outcome clearer.']],
  };
  const [action, customerAsk] = pick(plans[category] || plans.general);
  const opening = pick(['Thanks for flagging this.', 'I have reviewed your request.', 'Thanks for sharing the details.', 'We have received your report.']);
  const empathy = sentiment === 'angry' || sentiment === 'frustrated' ? 'I understand this has been disruptive, and I am sorry for the friction.' : 'I appreciate the context you provided.';

  return { category, priority, sentiment, department, drafts: {
    direct: `${opening}\n\nFor "${title}", our ${department} team will ${action}. ${tierLine}${kbLine}We will update this ticket as soon as the review is complete.\n\nSupportDesk Support`,
    empathetic: `Hello,\n\n${empathy} ${tierLine}I have marked "${title}" for ${priority} attention and asked our ${department} team to ${action}. ${kbLine}${customerAsk}\n\nThank you for your patience,\nSupportDesk Support`,
    technical: `Hello,\n\nWe are investigating "${title}" with the following plan:\n1. ${action.charAt(0).toUpperCase() + action.slice(1)}.\n2. Review the ticket details and related account or product records.\n3. ${customerAsk}\n\n${kbLine}The ${department} team will reply here with findings and the next action.\n\nSupportDesk ${department} team`,
  }};
}

const suggestReply = async (ticket, kbArticles = [], clientTier = 'free') => {
  const analysis = await analyzeTicket(ticket.title, ticket.description, kbArticles, clientTier, Date.now());
  return analysis.drafts;
};
module.exports = { analyzeTicket, suggestReply };


