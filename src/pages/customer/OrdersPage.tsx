import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrderStore, Order, OrderStatus } from '@/stores/orderStore'

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: '待處理', color: '#f59e0b' },
  confirmed: { label: '已確認', color: '#3b82f6' },
  preparing: { label: '準備中', color: '#8b5cf6' },
  ready: { label: '待送貨', color: '#10b981' },
  delivering: { label: '送貨中', color: '#06b6d4' },
  delivered: { label: '已完成', color: '#22c55e' },
  cancelled: { label: '已取消', color: '#ef4444' }
}

export function OrdersPage() {
  const navigate = useNavigate()
  const { orders, loading, loadCustomerOrders, cancelOrder } = useOrderStore()

  useEffect(() => {
    loadCustomerOrders()
  }, [])

  const handleCancel = async (order: Order) => {
    if (order.status !== 'pending') {
      alert('只有待處理既訂單可以取消')
      return
    }
    if (confirm('確定要取消呢個訂單嗎？')) {
      await cancelOrder(order.id)
    }
  }

  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
        📦 我的訂單
      </h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          載入中...
        </div>
      ) : orders.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          background: 'white',
          borderRadius: '12px',
          color: '#64748b'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
          <p>未有訂單</p>
          <button
            onClick={() => navigate('/shop')}
            style={{
              marginTop: '16px',
              padding: '12px 24px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            去商店
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {orders.map(order => (
            <div
              key={order.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              {/* Header */}
              <div style={{
                padding: '12px 16px',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <span style={{ fontWeight: 'bold' }}>訂單 #{order.id.slice(-8)}</span>
                <span style={{
                  padding: '4px 10px',
                  background: statusConfig[order.status].color,
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {statusConfig[order.status].label}
                </span>
              </div>

              {/* Items */}
              <div style={{ padding: '12px 16px' }}>
                {order.items.map((item, idx) => (
                  <div 
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      fontSize: '14px'
                    }}
                  >
                    <span>{item.name} x{item.quantity}</span>
                    <span>${item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{
                padding: '12px 16px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  <div>{order.deliveryAddress}</div>
                  <div>{order.deliveryPhone}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>總額</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb' }}>
                    ${order.totalAmount}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {order.status === 'pending' && (
                <div style={{
                  padding: '12px 16px',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  gap: '8px'
                }}>
                  <button
                    onClick={() => handleCancel(order)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    取消訂單
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
