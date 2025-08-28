// persona-chat.bundle.js
;(function(window) {
  function initPersonaChat(config = {}) {
    const {
      containerId,
      endpoint,
      apiKey,
      debug = false
    } = config;

    if (debug) console.log('[Persona Chat] init config →', config);

    const root = document.getElementById(containerId);
    if (!root) {
      console.error('[Persona Chat] container not found:', containerId);
      return;
    }
    root.innerHTML = '';

    // header
    const header = document.createElement('div');
    header.className = 'persona-chat-header';
    header.textContent = 'Persona Chat';
    root.appendChild(header);

    // messages
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

    function appendMessage(text, role) {
      const msg = document.createElement('div');
      msg.className = `persona-chat-message ${role}`;
      msg.textContent = (role === 'user' ? 'You: ' : 'Persona: ') + text;
      messages.appendChild(msg);
      messages.scrollTop = messages.scrollHeight;
    }

    function sendMessage() {
      const prompt = textarea.value.trim();
      if (!prompt) return;
      textarea.value = '';
      sendButton.disabled = true;
      appendMessage(prompt, 'user');

      console.log('[Persona Chat] ➤ POST to', endpoint, { prompt });
      GM_xmlhttpRequest({
        method: 'POST',
        url: endpoint,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        data: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user',   content: prompt }
          ]
        }),
        responseType: 'json',
        onload(res) {
          console.log('[Persona Chat] ⬅ status', res.status, res.statusText, res.response);
          if (res.status !== 200) {
            // try to show OpenAI error message
            const err = res.response?.error?.message || `${res.status} ${res.statusText}`;
            appendMessage(`Error: ${err}`, 'bot');
          } else {
            // valid 200 → parse the reply
            const choices = res.response?.choices;
            const reply =
              Array.isArray(choices) && choices[0]?.message?.content
                ? choices[0].message.content.trim()
                : 'No reply';
            appendMessage(reply, 'bot');
          }
          sendButton.disabled = false;
        },
        onerror(err) {
          console.error('[Persona Chat] XHR error →', err);
          appendMessage(`Error: ${err.status || ''} ${err.statusText || err.message}`, 'bot');
          sendButton.disabled = false;
        }
      });
    }

    sendButton.addEventListener('click', sendMessage);
    textarea.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    if (debug) console.log('[Persona Chat] initialized in', containerId);
  }

  window.initPersonaChat = initPersonaChat;
})(window);
