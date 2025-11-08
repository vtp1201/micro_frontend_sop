import { useEffect, useState } from 'react'

export default function Profile() {
  const [count, setCount] = useState(0)

  // Demo giao tiếp giữa fragment qua BroadcastChannel
  useEffect(() => {
    const bc = new BroadcastChannel('/demo')
    bc.addEventListener('message', (evt) => {
      if (evt.data?.type === 'ping') setCount((c) => c + 1)
    })
    return () => bc.close()
  }, [])

  return (
    <div style={{ border: '1px dashed #999', padding: 16, borderRadius: 8 }}>
      <h2>Profile Fragment</h2>
      <p>Count from BroadcastChannel: {count}</p>
    </div>
  )
}
