const axios = require('axios');
require('dotenv').config();

// Base AI Provider Class/Interface Contract
class AIProvider {
  /**
   * Generates a chat response using available product context.
   * @param {string} query - The user's chat input message.
   * @param {Array} contextProducts - Array of product objects retrieved from the DB.
   * @param {Array} chatHistory - Previous chat messages [{ sender: 'user'|'ai', message: string }].
   * @returns {Promise<string>} - The AI-generated response.
   */
  async generateChatResponse(query, contextProducts, chatHistory) {
    throw new Error('generateChatResponse method must be implemented by the provider.');
  }

  // Common system prompt formatter
  buildSystemPrompt(contextProducts) {
    const productsContextString = contextProducts && contextProducts.length > 0
      ? contextProducts.map(p => {
          return `- ID: ${p.id}\n  Name: ${p.name}\n  Category: ${p.category_name || 'Electronics'}\n  Price: ₹${p.price}\n  Discount Price: ${p.discount_price ? '₹' + p.discount_price : 'N/A'}\n  Stock: ${p.stock_quantity} left\n  Description: ${p.description}`;
        }).join('\n\n')
      : 'No matching products are currently available in the database.';

    return `You are "CircuitOps AI Assistant", the highly intelligent, professional, and knowledgeable digital sales assistant of "CircuitOps" - a premium, state-of-the-art cloud-native AI electronics marketplace.

Your goal is to help customers find, compare, summarize, and troubleshoot electronics. Speak with a helpful, friendly, and highly professional cloud-native technology consultant style (using sleek phrases like "Welcome to CircuitOps! 🚀", "Let's optimize your electronics setup", "How can I help you find the best cloud-ready tech today?").

CRITICAL INSTRUCTIONS:
1. DO NOT HALLUCINATE OR INVENT PRODUCTS. You must ONLY talk about and recommend products that are explicitly listed in the "Available Store Catalog" section below.
2. If a customer asks about a product that is not in the context list, politely inform them that we do not have that specific item in stock at CircuitOps, and recommend the closest match from the active catalog list instead.
3. DO NOT use any copyrighted TV show character names, actor names, or copyrighted dialogues. Speak as a premium, original store brand assistant.
4. Keep comparisons, troubleshooting advice, and product recommendations direct, accurate, and structured.

Available Store Catalog:
${productsContextString}`;
  }
}

// 1. Mock AI Provider (Deterministic, Offline-Friendly, Free)
class MockAIProvider extends AIProvider {
  async generateChatResponse(query, contextProducts, chatHistory) {
    const lowerQuery = query.toLowerCase();
    
    // Help helper: Welcome message
    if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('namaste')) {
      return `Welcome to CircuitOps! 🚀 I am your CircuitOps AI Assistant, here to show you the best cloud-ready deals on smartphones, TVs, laptops, and home appliances. How can I help you today?`;
    }

    if (!contextProducts || contextProducts.length === 0) {
      return `Hello! I searched our warehouse inventory, but we do not have products matching that category in stock right now. Can I interest you in checking our other products, or checking back soon?`;
    }

    // Recommendation logic
    if (lowerQuery.includes('recommend') || lowerQuery.includes('suggest') || lowerQuery.includes('best')) {
      const topProd = contextProducts[0];
      const dealText = topProd.discount_price ? `It is on a special discount at just ₹${topProd.discount_price} (MRP: ₹${topProd.price})!` : `Available for ₹${topProd.price}.`;
      let resp = `Excellent selection! Based on your interest, I highly recommend our **${topProd.name}**. ${dealText}\n\n`;
      resp += `**Key Highlights:** ${topProd.description}\n\n`;
      if (contextProducts.length > 1) {
        resp += `We also have other matching choices in stock: ${contextProducts.slice(1, 3).map(p => p.name).join(', ')}. Which one would you like to explore?`;
      }
      return resp;
    }

    // Comparison logic
    if (lowerQuery.includes('compare') || lowerQuery.includes('difference') || lowerQuery.includes('vs')) {
      if (contextProducts.length < 2) {
        return `Hello! I would love to compare, but I only found one matching item in stock right now: **${contextProducts[0].name}**. Let me know if you would like me to summarize its key features!`;
      }
      const p1 = contextProducts[0];
      const p2 = contextProducts[1];
      let resp = `Certainly! Let me compare the top options for you:\n\n`;
      resp += `1. **${p1.name}**\n   - Price: ₹${p1.discount_price || p1.price}\n   - Feature: ${p1.description.substring(0, 100)}...\n\n`;
      resp += `2. **${p2.name}**\n   - Price: ₹${p2.discount_price || p2.price}\n   - Feature: ${p2.description.substring(0, 100)}...\n\n`;
      resp += `**Verdict:** If you want top-tier performance, go for **${p1.name}**. If you want a different configuration, **${p2.name}** is a fantastic choice. Which one shall I add to your cart?`;
      return resp;
    }

    // Summarization logic
    if (lowerQuery.includes('summarize') || lowerQuery.includes('summary') || lowerQuery.includes('tell me about')) {
      const p = contextProducts[0];
      return `Absolutely! Here is a summary of specifications for **${p.name}**:\n\n` +
             `- **Price:** ₹${p.discount_price || p.price}\n` +
             `- **Inventory Status:** ${p.stock_quantity > 0 ? `${p.stock_quantity} units available` : 'Out of stock'}\n` +
             `- **Overview:** ${p.description}\n\n` +
             `Would you like to purchase this, or check customer reviews?`;
    }

    // Troubleshooting logic
    if (lowerQuery.includes('troubleshoot') || lowerQuery.includes('issue') || lowerQuery.includes('repair') || lowerQuery.includes('help') || lowerQuery.includes('not working')) {
      return `Hello! For troubleshooting the appliances bought from CircuitOps, please ensure:\n` +
             `1. All power cables are connected securely to a standard outlet.\n` +
             `2. Try running a soft reset or power-cycling the device.\n` +
             `3. If the appliance is overloaded, let it rest for 10 minutes before turning it on.\n\n` +
             `If the problem persists, please contact our CircuitOps digital support desk or bring the item to our logistics hub. We will get it fixed for you immediately!`;
    }

    // Default response using context
    const listStr = contextProducts.map(p => `• **${p.name}** (₹${p.discount_price || p.price}) - ${p.description.substring(0, 80)}...`).join('\n');
    return `Hello! Here are the available products matching your query at CircuitOps:\n\n${listStr}\n\nHow can I help you with these? I can recommend, compare, or summarize them for you!`;
  }
}

// 2. OpenAI GPT Provider
class OpenAIProvider extends AIProvider {
  async generateChatResponse(query, contextProducts, chatHistory) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables.');
    }

    const systemPrompt = this.buildSystemPrompt(contextProducts);
    
    // Map history to standard chat message formats
    const messages = [
      { role: 'system', content: systemPrompt }
    ];
    
    // Add history limit to last 6 messages to save context
    const limitHistory = chatHistory.slice(-6);
    limitHistory.forEach(h => {
      messages.push({
        role: h.sender === 'user' ? 'user' : 'assistant',
        content: h.message
      });
    });

    // Add current query
    messages.push({ role: 'user', content: query });

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI Request Failure:', error.response ? error.response.data : error.message);
      throw new Error('OpenAI Provider failed to respond: ' + error.message);
    }
  }
}

// 3. Claude Provider (Anthropic)
class ClaudeProvider extends AIProvider {
  async generateChatResponse(query, contextProducts, chatHistory) {
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      throw new Error('CLAUDE_API_KEY is not set in environment variables.');
    }

    const systemPrompt = this.buildSystemPrompt(contextProducts);
    
    // Format history
    const messages = [];
    const limitHistory = chatHistory.slice(-6);
    limitHistory.forEach(h => {
      messages.push({
        role: h.sender === 'user' ? 'user' : 'assistant',
        content: h.message
      });
    });

    messages.push({ role: 'user', content: query });

    try {
      const response = await axios.post('https://api.anthropic.com/v1/messages', {
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages,
        temperature: 0.7
      }, {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      });

      return response.data.content[0].text;
    } catch (error) {
      console.error('Claude Request Failure:', error.response ? error.response.data : error.message);
      throw new Error('Claude Provider failed to respond: ' + error.message);
    }
  }
}

// 4. Ollama Provider (Local LLMs)
class OllamaProvider extends AIProvider {
  async generateChatResponse(query, contextProducts, chatHistory) {
    const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const systemPrompt = this.buildSystemPrompt(contextProducts);
    
    // Format messages for chat API
    const messages = [
      { role: 'system', content: systemPrompt }
    ];
    
    const limitHistory = chatHistory.slice(-6);
    limitHistory.forEach(h => {
      messages.push({
        role: h.sender === 'user' ? 'user' : 'assistant',
        content: h.message
      });
    });

    messages.push({ role: 'user', content: query });

    try {
      const response = await axios.post(`${baseUrl}/api/chat`, {
        model: 'llama3', // Default local model, can be configured
        messages: messages,
        stream: false,
        options: {
          temperature: 0.7
        }
      });

      return response.data.message.content;
    } catch (error) {
      console.error('Ollama Request Failure:', error.message);
      throw new Error('Ollama Provider failed to respond. Verify Ollama is running at ' + baseUrl);
    }
  }
}

// Factory instantiation based on Env variable
let providerInstance;
const selectedProviderName = (process.env.AI_PROVIDER || 'mock').toLowerCase();

switch (selectedProviderName) {
  case 'openai':
    providerInstance = new OpenAIProvider();
    console.log('🤖 AI Provider configured to use: OpenAI');
    break;
  case 'claude':
    providerInstance = new ClaudeProvider();
    console.log('🤖 AI Provider configured to use: Claude');
    break;
  case 'ollama':
    providerInstance = new OllamaProvider();
    console.log('🤖 AI Provider configured to use: Ollama (Local)');
    break;
  case 'mock':
  default:
    providerInstance = new MockAIProvider();
    console.log('🤖 AI Provider configured to use: Offline Mock System');
    break;
}

module.exports = providerInstance;
