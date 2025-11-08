import { useEffect, useState } from 'react';

export default function Chat() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const bc = new BroadcastChannel('/demo');
    const onMsg = (evt) => { if (evt.data?.type === 'ping') setCount((c) => c + 1); };
    bc.addEventListener('message', onMsg);
    return () => { bc.removeEventListener('message', onMsg); bc.close(); };
  }, []);
  return (
    <div style={{ border: '1px dashed #999', padding: 16, borderRadius: 8 }}>
      <h2>Chat Fragment</h2>
      <p>Broadcast pings: {count}</p>
    </div>
  );
}

function pascal(s) { return String(s).replace(/(^|[-_\s]+)([a-z])/g, (_, __, c) => c.toUpperCase()); }
