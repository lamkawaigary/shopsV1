import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, UserRole } from '@/stores/authStore'
import { useProductStore, Product } from '@/stores/productStore'
import { useCartStore } from '@/stores/cartStore'

const categories = [
  { id: 'all', name: '全部', icon: '📦' },
  { id: 'building', name: '建材', icon: '🏗️' },
  { id: 'decoration', name: '裝修', icon: '🎨' },
  { id: 'tools', name: '工具', icon: '🔧' },
  { id: 'electrical', name: '電工', icon: '⚡' },
  { id: 'plumbing', name: '水電', icon: '🔩' }
]

export function ShopPage() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const { products, loading, loadAllProducts } = useProductStore()
  const { addItem } = useCartStore()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  useEffect(() => {
    loadAllProducts()
  }, [])

  const filteredProducts = products.filter(p => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false
    if (searchKeyword && !p.name.toLowerCase().includes(searchKeyword.toLowerCase())) return false
    return true
  })

  const handleAddToCart = (product: Product) => {
    const qty = quantities[product.id] || 1
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: qty,
      merchantId: product.merchantId,
      merchantName: product.merchantName,
      image: product.imageUrl
    })
    setQuantities({ ...quantities, [product.id]: 1 })
    alert('已加入購物車！')
  }

  return (
    <div style={{ padding: '16px' }}>
      {/* Search */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="搜尋商品..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{
            width: '100%',
            padding: '14px 16px',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '16px',
            boxSizing: 'border-box',
            outline: 'none'
          }}
        />
      </div>

      {/* Categories */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        overflowX: 'auto',
        paddingBottom: '8px',
        marginBottom: '16px'
      }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              flex: '0 0 auto',
              padding: '10px 16px',
              background: selectedCategory === cat.id ? '#2563eb' : 'white',
              color: selectedCategory === cat.id ? 'white' : '#1e293b',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px'
            }}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          載入中...
        </div>
      )}

      {/* Products Grid */}
      {!loading && (
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '12px'
        }}>
          {filteredProducts.map(product => (
            <div
              key={product.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              {/* Product Image */}
              <div style={{
                height: '140px',
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px'
              }}>
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  '📦'
                )}
              </div>

              {/* Product Info */}
              <div style={{ padding: '12px' }}>
                <h3 style={{ 
                  fontSize: '14px', 
                  fontWeight: 'bold',
                  marginBottom: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {product.name}
                </h3>
                <p style={{ 
                  fontSize: '12px', 
                  color: '#64748b',
                  marginBottom: '8px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {product.merchantName}
                </p>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between' 
                }}>
                  <span style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold',
                    color: '#2563eb'
                  }}>
                    ${product.price}
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    存: {product.stock}
                  </span>
                </div>

                {/* Quantity & Add */}
                <div style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  marginTop: '10px' 
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '8px',
                    background: '#f1f5f9',
                    borderRadius: '8px',
                    padding: '4px'
                  }}>
                    <button
                      onClick={() => setQuantities({
                        ...quantities,
                        [product.id]: Math.max(1, (quantities[product.id] || 1) - 1)
                      })}
                      style={{
                        width: '28px',
                        height: '28px',
                        border: 'none',
                        background: 'white',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      -
                    </button>
                    <span style={{ minWidth: '24px', textAlign: 'center' }}>
                      {quantities[product.id] || 1}
                    </span>
                    <button
                      onClick={() => setQuantities({
                        ...quantities,
                        [product.id]: Math.min(product.stock, (quantities[product.id] || 1) + 1)
                      })}
                      style={{
                        width: '28px',
                        height: '28px',
                        border: 'none',
                        background: 'white',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    style={{
                      flex: 1,
                      background: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}
                  >
                    加入購物車
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredProducts.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: '#64748b' 
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <p>未有相關商品</p>
        </div>
      )}
    </div>
  )
}
