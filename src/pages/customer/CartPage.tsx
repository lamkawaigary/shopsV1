import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore, CartItem } from '@/stores/cartStore'
import { useOrderStore } from '@/stores/orderStore'

export function CartPage() {
  const navigate = useNavigate()
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore()
  const { createOrder, loading } = useOrderStore()
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [showCheckout, setShowCheckout] = useState(false)

  const handleCheckout = async () => {
    if (!address || !phone) {
      alert('請輸入送貨地址和電話')
      return
    }
    
    try {
      await createOrder(address, phone, notes)
      alert('訂單已提交！')
      navigate('/orders')
    } catch (error: any) {
      alert(error.message || '提交訂單失敗')
    }
  }

  const groupedItems = items.reduce((acc, item) => {
    const key = item.merchantId
    if (!acc[key]) {
      acc[key] = { merchantName: item.merchantName, items: [] }
    }
    acc[key].items.push(item)
    return acc
  }, {} as Record<string, { merchantName: string; items: CartItem[] }>)

  if (items.length === 0) {
    return (
      <div style={{ 
        padding: '60px 20px', 
        textAlign: 'center',
        color: '#64748b'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛒</div>
        <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>購物車係咁嘅</h2>
        <p>去商店揀啱嘢啦！</p>
        <button
          onClick={() => navigate('/shop')}
          style={{
            marginTop: '20px',
            padding: '14px 28px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          去商店
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
        🛒 購物車
      </h1>

      {/* Items */}
      {Object.entries(groupedItems).map(([merchantId, { merchantName, items }]) => (
        <div 
          key={merchantId}
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: 'bold',
            color: '#64748b',
            marginBottom: '12px',
            paddingBottom: '8px',
            borderBottom: '1px solid #e2e8f0'
          }}>
            🏪 {merchantName}
          </h3>

          {items.map(item => (
            <div 
              key={item.id}
              style={{
                display: 'flex',
                gap: '12px',
                padding: '12px 0',
                borderBottom: '1px solid #f1f5f9'
              }}
            >
              <div style={{
                width: '70px',
                height: '70px',
                background: '#f1f5f9',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px'
              }}>
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                  />
                ) : (
                  '📦'
                )}
              </div>
              
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '14px', marginBottom: '4px' }}>{item.name}</h4>
                <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#2563eb' }}>
                  ${item.price}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <button
                  onClick={() => removeItem(item.productId)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '18px'
                  }}
                >
                  ✕
                </button>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: '8px',
                  background: '#f1f5f9',
                  borderRadius: '8px',
                  padding: '4px'
                }}>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    style={{
                      width: '24px',
                      height: '24px',
                      border: 'none',
                      background: 'white',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    -
                  </button>
                  <span style={{ minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    style={{
                      width: '24px',
                      height: '24px',
                      border: 'none',
                      background: 'white',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Checkout Section */}
      <div style={{
        position: 'fixed',
        bottom: '80px',
        left: '16px',
        right: '16px',
        background: 'white',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: '12px' 
        }}>
          <span style={{ fontSize: '16px' }}>總額</span>
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>
            ${getTotal()}
          </span>
        </div>
        
        {!showCheckout ? (
          <button
            onClick={() => setShowCheckout(true)}
            style={{
              width: '100%',
              padding: '14px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            去結帳
          </button>
        ) : (
          <div>
            <input
              type="text"
              placeholder="送貨地址"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                marginBottom: '8px',
                boxSizing: 'border-box'
              }}
            />
            <input
              type="tel"
              placeholder="聯絡電話"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                marginBottom: '8px',
                boxSizing: 'border-box'
              }}
            />
            <textarea
              placeholder="備註 (可選)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                marginBottom: '12px',
                boxSizing: 'border-box',
                minHeight: '60px'
              }}
            />
            <button
              onClick={handleCheckout}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: loading ? '#94a3b8' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? '提交中...' : '提交訂單'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
