// Get chatbot elements
const chatbotToggleBtn = document.getElementById('chatbotToggleBtn');
const chatbotPanel = document.getElementById('chatbotPanel');

if (chatbotToggleBtn && chatbotPanel) {
  // Toggle chat open/closed when clicking the button
  chatbotToggleBtn.addEventListener('click', () => {
    chatbotPanel.classList.toggle('open');
  });

  // Close chat when clicking anywhere except the chat panel or button
  document.addEventListener('click', (e) => {
    // If chat is open AND user clicked outside chat area, close it
    if (chatbotPanel.classList.contains('open') && 
        !chatbotPanel.contains(e.target) && 
        !chatbotToggleBtn.contains(e.target)) {
      chatbotPanel.classList.remove('open');
    }
  });
}

// Get the send button and input box elements
const chatbotSendBtn = document.getElementById('chatbotSendBtn');
const chatbotInput = document.getElementById('chatbotInput');
const chatbotMessages = document.getElementById('chatbotMessages');
const chatbotBtn = document.getElementById('chatbotToggleBtn');

if (chatbotSendBtn && chatbotInput) {
  // Listen for clicks on the send button
  chatbotSendBtn.addEventListener('click', async () => {
    await handleSendMessage();
  });
}

if (chatbotBtn && chatbotInput) {
  // Listen for Enter key in the input box
  chatbotInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      await handleSendMessage();
    }
  });
  // Listen for clicks on the chatbot icon button to send message
  chatbotBtn.addEventListener('click', async () => {
    await handleSendMessage();
  });
}

// Store the conversation history
const conversationMessages = [
  { role: 'system', content: 'You are WayChat, Waymark’s friendly creative assistant. Waymark is a video ad creation platform that helps people turn ideas, products, or messages into high-quality, ready-to-run videos. The platform is used by small businesses, agencies, and marketers to create broadcast-   ads with minimal friction. Your job is to help users shape raw input — whether it’s a business name, a tagline, a product, a vibe, or a rough idea — into a short-form video concept.Your responses may include suggested video structures, voiceover lines, tone and visual direction, music suggestions, and clarifying follow-up questions. If the user\'s input is unclear, ask 1–2 short questions to help sharpen the direction before offering creative suggestions. Only respond to questions related to Waymark, its tools, its platform, or the creative process of making short-form video ads. If a question is unrelated, politely explain that you\'re focused on helping users create video ads with Waymark. Keep your replies concise, collaborative, and focused on helping users express their message clearly. Always align with modern marketing best practices — and stay supportive and friendly.'}
];

// Function to send a message to OpenAI and get a response
async function fetchChatbotReply() {
  // The endpoint for OpenAI's chat API
  const url = 'https://api.openai.com/v1/chat/completions';

  // The data to send to the API
  const data = {
    model: 'gpt-4o', // Use the gpt-4o model
    messages: conversationMessages // Pass the whole conversation
  };

  try {
    // Use fetch with async/await to call the API
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(data)
    });

    // Parse the JSON response
    const result = await response.json();

    // Check if the response has choices and a message
    if (result.choices && result.choices[0] && result.choices[0].message && result.choices[0].message.content) {
      // Return the assistant's reply
      return result.choices[0].message.content;
    } else if (result.error && result.error.message) {
      // If OpenAI returned an error, show it
      return `Error: ${result.error.message}`;
    } else {
      // If something else went wrong
      return 'Sorry, I could not get a valid response from the chatbot.';
    }
  } catch (error) {
    // If there is an error, log it and return a friendly message
    console.error('Error fetching from OpenAI:', error);
    return 'Sorry, I could not get a response from the chatbot.';
  }
}

// Function to handle sending the message
async function handleSendMessage() {
  const userMessage = chatbotInput.value.trim();
  if (!userMessage) return;

  // Add the user's message to the conversation history
  conversationMessages.push({ role: 'user', content: userMessage });

  // Show the user's message in the chat
  if (chatbotMessages) {
    const userDiv = document.createElement('div');
    userDiv.textContent = `You: ${userMessage}`;
    chatbotMessages.appendChild(userDiv);
  }

  chatbotInput.value = '';

  // Get the chatbot's reply from OpenAI
  const reply = await fetchChatbotReply();

  // Add the assistant's reply to the conversation history
  conversationMessages.push({ role: 'assistant', content: reply });

  // Show the chatbot's reply in the chat
  if (chatbotMessages) {
    const botDiv = document.createElement('div');
    botDiv.textContent = `Bot: ${reply}`;
    chatbotMessages.appendChild(botDiv);
  }
}
