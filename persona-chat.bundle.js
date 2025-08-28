// persona-chat.bundle.js
;(function(window) {
  /**
   * Initialize the Persona Chat widget
   * @param {Object} config
   * @param {string} config.containerId  – ID of the div to mount into
   * @param {string[]} [config.personas] – optional list of persona names
   * @param {string} [config.endpoint]  – POST endpoint accepting { prompt, personas }
   * @param {boolean} [config.debug]    – whether to log debug info
   */
  function initPersonaChat(config = {}) {
    const {
      containerId,
      personas = [],
      endpoint = 'http://localhost:3000/chat',
      debug = false
    } = config;

    const root = document.getElementById(containerId);
    if (!root) {
      console.error('initPersonaChat: container not found:', containerId);
      return;
    }
    if (debug) console.log('initPersonaChat config:', config);

    // clear prior content
    root.innerHTML = '';

    // header
    const header = document.createElement('div');
    header.className = 'persona-chat-header';
    header.textContent = 'Persona Chat';
    root.appendChild(header);

    // messages container
    const messages = document.createElement('div');
    messages.className = 'persona-chat-messages';
    root.appendChild(messages);

    // input area
    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'persona-chat-input';
    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Type a message…';
    inputWrapper.appendChild(textarea);

    const sendButton = document.createElement('button');
    sendButton.textContent = 'Send';
    inputWrapper.appendChild(sendButton);
    root.appendChild(inputWrapper);

    // helper: append a message
    function appendMessage(text, role) {
      const msg = document.createElement('div');
      msg.className = `persona-chat-message ${role}`;
      msg.textContent = (role === 'user' ? 'You: ' : 'Persona: ') + text;
      messages.appendChild(msg);
      messages.scrollTop = messages.scrollHeight;
    }

    // send logic
    async function sendMessage() {
      const prompt = textarea.value.trim();
      if (!prompt) return;
      textarea.value = '';
      sendButton.disabled = true;
      appendMessage(prompt, 'user');

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, personas })
        });
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        const reply =
          data.reply ||
          (data.choices && data.choices[0] && data.choices[0].message?.content) ||
          'No reply';
        appendMessage(reply, 'bot');
      } catch (err) {
        console.error('Persona Chat error:', err);
        appendMessage(`Error: ${err.message}`, 'bot');
      } finally {
        sendButton.disabled = false;
      }
    }

    // wire events
    sendButton.addEventListener('click', sendMessage);
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    if (debug) console.log('Persona Chat initialized in', containerId);
  }

  // expose globally
  window.initPersonaChat = initPersonaChat;
})(window);
