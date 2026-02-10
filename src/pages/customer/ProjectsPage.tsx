import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore, ProjectMaterial, MaterialItem } from '@/stores/projectStore'

const materialTypes = [
  { id: 'cement', name: '水泥/砂漿', unit: '包 (25kg)', pricePerUnit: 35 },
  { id: 'brick', name: '磚塊', unit: '塊', pricePerUnit: 2.5 },
  { id: 'tile', name: '瓷磚', unit: '片 (60x60cm)', pricePerUnit: 45 },
  { id: 'wood', name: '木材', unit: '尺', pricePerUnit: 28 },
  { id: 'paint', name: '油漆', unit: '罐 (5L)', pricePerUnit: 180 },
  { id: 'steel', name: '鋼筋', unit: '條 (6m)', pricePerUnit: 85 },
  { id: 'pipe', name: 'PVC水管', unit: '條 (3m)', pricePerUnit: 45 },
  { id: 'wire', name: '電線', unit: '卷 (100m)', pricePerUnit: 120 },
  { id: 'other', name: '其他', unit: '件', pricePerUnit: 0 }
]

export function ProjectsPage() {
  const navigate = useNavigate()
  const { 
    projects, 
    loading, 
    currentProject,
    loadProjects, 
    createProject,
    setCurrentProject,
    addMaterial,
    removeMaterial,
    calculateMaterial,
    deleteProject
  } = useProjectStore()
  
  const [showCreate, setShowCreate] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')
  
  // Material form
  const [selectedMaterial, setSelectedMaterial] = useState('')
  const [materialLength, setMaterialLength] = useState(100)
  const [materialWidth, setMaterialWidth] = useState(100)
  const [materialHeight, setMaterialHeight] = useState(10)
  const [materialQty, setMaterialQty] = useState(1)
  const [customPrice, setCustomPrice] = useState(0)

  useEffect(() => {
    loadProjects()
  }, [])

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      alert('請輸入項目名稱')
      return
    }
    await createProject(newProjectName, newProjectDesc)
    setShowCreate(false)
    setNewProjectName('')
    setNewProjectDesc('')
  }

  const handleAddMaterial = async () => {
    if (!currentProject) return
    
    const type = materialTypes.find(m => m.id === selectedMaterial)
    if (!type) {
      alert('請選擇物料類型')
      return
    }
    
    const pricePerUnit = type.id === 'other' ? customPrice : type.pricePerUnit
    
    await addMaterial(currentProject.id, {
      name: type.name,
      length: materialLength,
      width: materialWidth,
      height: materialHeight,
      quantity: materialQty,
      pricePerUnit,
      unit: type.unit
    })
    
    setSelectedMaterial('')
    setMaterialQty(1)
  }

  const handleDeleteProject = async (id: string) => {
    if (confirm('確定要刪除此項目嗎？')) {
      await deleteProject(id)
      if (currentProject?.id === id) {
        setCurrentProject(null)
      }
    }
  }

  // Calculate totals
  const calculateProjectTotal = (project: ProjectMaterial) => {
    return project.materials.reduce((sum, mat) => {
      const { totalPrice } = calculateMaterial(mat)
      return sum + totalPrice
    }, 0)
  }

  // Quick add material panel
  const QuickAddMaterial = () => (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>
        ➕ 快速新增物料
      </h3>
      
      <select
        value={selectedMaterial}
        onChange={(e) => {
          setSelectedMaterial(e.target.value)
          const type = materialTypes.find(m => m.id === e.target.value)
          if (type) setCustomPrice(type.pricePerUnit)
        }}
        style={{
          width: '100%',
          padding: '10px',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          marginBottom: '8px',
          boxSizing: 'border-box'
        }}
      >
        <option value="">選擇物料類型...</option>
        {materialTypes.map(t => (
          <option key={t.id} value={t.id}>{t.name} - ${t.pricePerUnit}/{t.unit}</option>
        ))}
      </select>
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <input
          type="number"
          placeholder="長(cm)"
          value={materialLength}
          onChange={(e) => setMaterialLength(Number(e.target.value))}
          style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', boxSizing: 'border-box' }}
        />
        <input
          type="number"
          placeholder="寬(cm)"
          value={materialWidth}
          onChange={(e) => setMaterialWidth(Number(e.target.value))}
          style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', boxSizing: 'border-box' }}
        />
        <input
          type="number"
          placeholder="高(cm)"
          value={materialHeight}
          onChange={(e) => setMaterialHeight(Number(e.target.value))}
          style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', boxSizing: 'border-box' }}
        />
      </div>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="number"
          placeholder="數量"
          value={materialQty}
          onChange={(e) => setMaterialQty(Number(e.target.value))}
          style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', boxSizing: 'border-box' }}
        />
        {selectedMaterial === 'other' && (
          <input
            type="number"
            placeholder="單價"
            value={customPrice}
            onChange={(e) => setCustomPrice(Number(e.target.value))}
            style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', boxSizing: 'border-box' }}
          />
        )}
        <button
          onClick={handleAddMaterial}
          style={{
            padding: '10px 20px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          新增
        </button>
      </div>
    </div>
  )

  // Project List
  if (!currentProject) {
    return (
      <div style={{ padding: '16px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px' 
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>📋 專案</h1>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              padding: '10px 16px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            + 新建專案
          </button>
        </div>

        {/* Create Modal */}
        {showCreate && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '400px'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
                新建專案
              </h2>
              <input
                type="text"
                placeholder="專案名稱"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  boxSizing: 'border-box'
                }}
              />
              <textarea
                placeholder="描述 (可選)"
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  minHeight: '80px',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowCreate(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#e2e8f0',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  取消
                </button>
                <button
                  onClick={handleCreateProject}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  建立
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Project List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>載入中...</div>
        ) : projects.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: '#64748b',
            background: 'white',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
            <p>未有專案</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>建立專案開始計算物料！</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {projects.map(project => (
              <div
                key={project.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '8px' 
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>{project.name}</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setCurrentProject(project)}
                      style={{
                        padding: '4px 12px',
                        background: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      打開
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      style={{
                        padding: '4px 12px',
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      刪除
                    </button>
                  </div>
                </div>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                  {project.description || '無描述'}
                </p>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontSize: '14px' 
                }}>
                  <span>📦 {project.materials.length} 種物料</span>
                  <span style={{ fontWeight: 'bold', color: '#2563eb' }}>
                    ${calculateProjectTotal(project)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Project Detail View
  return (
    <div style={{ padding: '16px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px' 
      }}>
        <button
          onClick={() => setCurrentProject(null)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#64748b'
          }}
        >
          ← 返回
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>{currentProject.name}</h1>
        <div style={{ width: '60px' }}></div>
      </div>

      <QuickAddMaterial />

      {/* Materials List */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          padding: '12px 16px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 40px',
          fontSize: '12px',
          color: '#64748b',
          fontWeight: 'bold'
        }}>
          <span>物料</span>
          <span style={{ textAlign: 'right' }}>數量</span>
          <span style={{ textAlign: 'right' }}>單價</span>
          <span style={{ textAlign: 'right' }}>小計</span>
          <span></span>
        </div>

        {currentProject.materials.map(material => {
          const { volume, area, totalPrice } = calculateMaterial(material)
          return (
            <div
              key={material.id}
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #f1f5f9',
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 40px',
                alignItems: 'center',
                fontSize: '14px'
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold' }}>{material.name}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  {material.length}x{material.width}x{material.height}cm | {material.unit}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>{material.quantity}</div>
              <div style={{ textAlign: 'right' }}>${material.pricePerUnit}</div>
              <div style={{ textAlign: 'right', fontWeight: 'bold', color: '#2563eb' }}>
                ${totalPrice}
              </div>
              <button
                onClick={() => removeMaterial(currentProject.id, material.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ✕
              </button>
            </div>
          )
        })}

        {currentProject.materials.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            未有物料，新增啲嘢啦！
          </div>
        )}

        {/* Total */}
        <div style={{
          padding: '16px',
          background: '#f8fafc',
          borderTop: '2px solid #2563eb'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            fontSize: '18px',
            fontWeight: 'bold' 
          }}>
            <span>總額</span>
            <span style={{ color: '#2563eb' }}>
              ${currentProject.materials.reduce((sum, m) => sum + calculateMaterial(m).totalPrice, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
        <button
          onClick={() => {
            const total = currentProject.materials.reduce((sum, m) => sum + calculateMaterial(m).totalPrice, 0)
            alert(`專案: ${currentProject.name}\n總額: $${total}\n\n呢度可以一鍵轉成訂單！`)
          }}
          style={{
            flex: 1,
            padding: '14px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          📦 一鍵落訂單
        </button>
        <button
          style={{
            flex: 1,
            padding: '14px',
            background: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          📤 分享報價
        </button>
      </div>
    </div>
  )
}
