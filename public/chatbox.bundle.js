// chatbox.bundle.js
(function() {
    function loadScript(src, callback) {
      const s = document.createElement('script');
      s.src = src;
      s.onload = callback;
      document.head.appendChild(s);
    }
  
    function initChatbox(options) {
      const { elementId, backendUrl, clientKey, clientId } = options;
      if (!elementId || !backendUrl || !clientId) {
        console.error('Chatbox: elementId, backendUrl, and clientId are required');
        return;
      }
  
      function renderChatbox() {
        const e = React.createElement;
        const { useState } = React;
  
        function ChatboxComponent() {
          const [messages, setMessages] = useState([]);
          const [input, setInput] = useState('');
          const [loading, setLoading] = useState(false);
  
          async function sendMessage() {
            if (!input.trim()) return;
            const userMessage = { sender: 'user', text: input };
            setMessages(prev => [...prev, userMessage]);
            setLoading(true);
            const currentInput = input;
            setInput('');
  
            try {
              const res = await fetch(backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  message: currentInput,
                  clientKey: clientKey || null,
                  clientId
                })
              });
  
              const data = await res.json();
              const botMessage = { sender: 'bot', text: data.reply };
              setMessages(prev => [...prev, botMessage]);
            } catch (err) {
              console.error('Chatbox error:', err);
              setMessages(prev => [...prev, { sender: 'bot', text: 'Error contacting API' }]);
            }
  
            setLoading(false);
          }
  
          return e('div', { style: chatboxStyle.container },
            e('div', { style: chatboxStyle.messages },
              messages.map((m, i) => e('div', { key: i, style: m.sender === 'user' ? chatboxStyle.userMessage : chatboxStyle.botMessage }, m.text))
            ),
            e('div', { style: chatboxStyle.inputArea },
              e('input', {
                type: 'text',
                value: input,
                placeholder: 'Type a message...',
                style: chatboxStyle.input,
                onChange: e => setInput(e.target.value),
                onKeyDown: e => { if (e.key === 'Enter') sendMessage(); }
              }),
              e('button', { onClick: sendMessage, style: chatboxStyle.button, disabled: loading }, loading ? '...' : 'Send')
            )
          );
        }
  
        ReactDOM.render(e(ChatboxComponent), document.getElementById(elementId));
      }
  
      if (!window.React || !window.ReactDOM) {
        loadScript('https://unpkg.com/react@18/umd/react.production.min.js', () => {
          loadScript('https://unpkg.com/react-dom@18/umd/react-dom.production.min.js', renderChatbox);
        });
      } else {
        renderChatbox();
      }
    }
  
    window.Chatbox = { init: initChatbox };
  
    const chatboxStyle = {
      container: { border: '1px solid #ccc', width: '300px', height: '400px', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif' },
      messages: { flex: 1, padding: '10px', overflowY: 'auto', backgroundColor: '#f9f9f9' },
      userMessage: { textAlign: 'right', margin: '5px 0', backgroundColor: '#d1e7ff', padding: '5px 10px', borderRadius: '12px', display: 'inline-block' },
      botMessage: { textAlign: 'left', margin: '5px 0', backgroundColor: '#eee', padding: '5px 10px', borderRadius: '12px', display: 'inline-block' },
      inputArea: { display: 'flex', borderTop: '1px solid #ccc' },
      input: { flex: 1, padding: '10px', border: 'none', outline: 'none' },
      button: { padding: '10px', border: 'none', backgroundColor: '#007bff', color: '#fff', cursor: 'pointer' }
    };
  })();
  