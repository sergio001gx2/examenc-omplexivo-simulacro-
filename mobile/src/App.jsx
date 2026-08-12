import React, { useState, useEffect } from 'react'

const API_BASE = 'http://127.0.0.1:8000/api'

export default function App() {
  const [activeTab, setActiveTab] = useState('services') // 'services', 'events', 'add', 'auth'
  const [token, setToken] = useState(localStorage.getItem('mobile_token') || '')

  // NoSQL Collections Data
  const [serviceTypes, setServiceTypes] = useState([])
  const [vehicleServices, setVehicleServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // New Service Type Form
  const [stName, setStName] = useState('')
  const [stDesc, setStDesc] = useState('')
  const [stPrice, setStPrice] = useState('')

  // New Event Form
  const [evVehiculoId, setEvVehiculoId] = useState('1')
  const [evServiceTypeId, setEvServiceTypeId] = useState('')
  const [evKm, setEvKm] = useState('')
  const [evCost, setEvCost] = useState('')
  const [evNotes, setEvNotes] = useState('')

  // Auth Form
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin')

  useEffect(() => {
    fetchServiceTypes()
    fetchVehicleServices()
  }, [])

  const fetchServiceTypes = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/service-types/`)
      if (!res.ok) throw new Error('Error al conectar con MongoDB service_types')
      const data = await res.json()
      setServiceTypes(data)
      if (data.length > 0 && !evServiceTypeId) {
        setEvServiceTypeId(data[0].id)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchVehicleServices = async () => {
    try {
      const res = await fetch(`${API_BASE}/vehicle-services/`)
      if (!res.ok) throw new Error('Error al conectar con MongoDB vehicle_services')
      const data = await res.json()
      setVehicleServices(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`${API_BASE}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      if (!res.ok) throw new Error('Credenciales incorrectas')
      const data = await res.json()
      setToken(data.access)
      localStorage.setItem('mobile_token', data.access)
      setSuccess('Sesión iniciada en app Móvil')
      setActiveTab('services')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCreateServiceType = async (e) => {
    e.preventDefault()
    if (!token) {
      setError('Inicia sesión en la app móvil para guardar en MongoDB')
      setActiveTab('auth')
      return
    }
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`${API_BASE}/service-types/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: stName,
          description: stDesc,
          base_price: parseFloat(stPrice) || 0,
          is_active: true
        })
      })
      if (!res.ok) throw new Error('Error al guardar tipo de servicio en MongoDB')
      setSuccess('Tipo de servicio creado en MongoDB')
      setStName('')
      setStDesc('')
      setStPrice('')
      fetchServiceTypes()
      setActiveTab('services')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCreateVehicleService = async (e) => {
    e.preventDefault()
    if (!token) {
      setError('Inicia sesión en la app móvil para guardar eventos NoSQL')
      setActiveTab('auth')
      return
    }
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`${API_BASE}/vehicle-services/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vehiculo_id: parseInt(evVehiculoId),
          service_type_id: evServiceTypeId,
          kilometers: parseInt(evKm) || 0,
          cost: parseFloat(evCost) || 0,
          notes: evNotes
        })
      })
      if (!res.ok) throw new Error('Error al registrar evento NoSQL')
      setSuccess('Evento registrado en colección vehicle_services (Mongo)')
      setEvKm('')
      setEvCost('')
      setEvNotes('')
      fetchVehicleServices()
      setActiveTab('events')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="mobile-wrapper">
      {/* Device Status Bar */}
      <div className="status-bar">
        <span>9:41</span>
        <span>📶 🔋 100%</span>
      </div>

      {/* App Header */}
      <header className="app-header">
        <div className="header-title-group">
          <div className="header-icon">V</div>
          <div>
            <div className="header-title">Operaciones Móvil</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Agencia Vehículos</div>
          </div>
        </div>
        <span className="nosql-badge">MongoDB NoSQL</span>
      </header>

      {/* Scrollable Content View */}
      <main className="content-scroll">
        {error && <div className="alert-box alert-error">⚠️ {error}</div>}
        {success && <div className="alert-box alert-success">✅ {success}</div>}

        {/* TAB 1: SERVICE TYPES (Mongo Collection) */}
        {activeTab === 'services' && (
          <div>
            <div className="section-title">
              <span>Catálogo de Servicios (Mongo)</span>
              <span>{serviceTypes.length} ítems</span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                Cargando colecciones desde MongoDB...
              </div>
            ) : serviceTypes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No hay servicios registrados en Mongo.
              </div>
            ) : (
              serviceTypes.map(st => (
                <div key={st.id} className="item-card">
                  <div className="card-header">
                    <span className="card-title">{st.name}</span>
                    <span className="price-tag">${st.base_price}</span>
                  </div>
                  <p className="card-desc">{st.description || 'Sin descripción'}</p>
                  <div className="card-meta">
                    <span className="meta-pill">ID Mongo: {st.id.substring(0, 10)}...</span>
                    <span className="meta-pill" style={{ color: st.is_active ? '#34d399' : '#f87171' }}>
                      {st.is_active ? '● Activo' : '○ Inactivo'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: VEHICLE SERVICES EVENTS (Mongo Collection) */}
        {activeTab === 'events' && (
          <div>
            <div className="section-title">
              <span>Historial Operativo (Mongo)</span>
              <span>{vehicleServices.length} eventos</span>
            </div>

            {vehicleServices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                Sin registro de eventos operativos.
              </div>
            ) : (
              vehicleServices.map(vs => (
                <div key={vs.id} className="item-card">
                  <div className="card-header">
                    <span className="card-title">Vehículo SQL ID #{vs.vehiculo_id}</span>
                    <span className="price-tag">${vs.cost}</span>
                  </div>
                  <p className="card-desc"><strong>Notas:</strong> {vs.notes || 'Ninguna'}</p>
                  <div className="card-meta">
                    <span className="meta-pill">📅 {vs.date}</span>
                    <span className="meta-pill">🛣️ {vs.kilometers} KM</span>
                    <span className="meta-pill">Type: {vs.service_type_id.substring(0, 8)}...</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: ADD NEW RECORD FORM */}
        {activeTab === 'add' && (
          <div>
            <div className="section-title">➕ Registrar en MongoDB</div>
            
            <div style={{ marginBottom: '1.5rem', background: 'var(--mobile-card)', padding: '1rem', borderRadius: '16px' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--primary)' }}>NUEVO TIPO DE SERVICIO</h4>
              <form onSubmit={handleCreateServiceType}>
                <input 
                  type="text" 
                  className="mobile-input" 
                  placeholder="Nombre de servicio" 
                  value={stName}
                  onChange={e => setStName(e.target.value)}
                  required
                />
                <input 
                  type="text" 
                  className="mobile-input" 
                  placeholder="Descripción" 
                  value={stDesc}
                  onChange={e => setStDesc(e.target.value)}
                />
                <input 
                  type="number" 
                  className="mobile-input" 
                  placeholder="Precio base ($)" 
                  value={stPrice}
                  onChange={e => setStPrice(e.target.value)}
                />
                <button type="submit" className="mobile-btn">Guardar Tipo en Mongo</button>
              </form>
            </div>

            <div style={{ background: 'var(--mobile-card)', padding: '1rem', borderRadius: '16px' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: '#10b981' }}>REGISTRAR EVENTO OPERATIVO</h4>
              <form onSubmit={handleCreateVehicleService}>
                <input 
                  type="number" 
                  className="mobile-input" 
                  placeholder="ID Vehículo SQL (Ej: 1, 2)" 
                  value={evVehiculoId}
                  onChange={e => setEvVehiculoId(e.target.value)}
                  required
                />
                <select 
                  className="mobile-input" 
                  value={evServiceTypeId} 
                  onChange={e => setEvServiceTypeId(e.target.value)}
                  required
                >
                  <option value="">Seleccionar Servicio Mongo...</option>
                  {serviceTypes.map(st => (
                    <option key={st.id} value={st.id}>{st.name} (${st.base_price})</option>
                  ))}
                </select>
                <input 
                  type="number" 
                  className="mobile-input" 
                  placeholder="Kilometraje" 
                  value={evKm}
                  onChange={e => setEvKm(e.target.value)}
                />
                <input 
                  type="number" 
                  className="mobile-input" 
                  placeholder="Costo Final ($)" 
                  value={evCost}
                  onChange={e => setEvCost(e.target.value)}
                />
                <input 
                  type="text" 
                  className="mobile-input" 
                  placeholder="Observaciones / Notas" 
                  value={evNotes}
                  onChange={e => setEvNotes(e.target.value)}
                />
                <button type="submit" className="mobile-btn" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  Registrar Evento en Mongo
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: AUTH */}
        {activeTab === 'auth' && (
          <div>
            <div className="section-title">🔐 Autenticación Móvil JWT</div>
            <div style={{ background: 'var(--mobile-card)', padding: '1.25rem', borderRadius: '16px' }}>
              {token ? (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ marginBottom: '1rem', color: '#34d399' }}>Token JWT Activo</p>
                  <button className="mobile-btn" style={{ background: '#ef4444' }} onClick={() => { setToken(''); localStorage.removeItem('mobile_token'); }}>
                    Cerrar Sesión Móvil
                  </button>
                </div>
              ) : (
                <form onSubmit={handleLogin}>
                  <input 
                    type="text" 
                    className="mobile-input" 
                    placeholder="Usuario" 
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                  />
                  <input 
                    type="password" 
                    className="mobile-input" 
                    placeholder="Contraseña" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button type="submit" className="mobile-btn">Iniciar Sesión API</button>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation Tab Bar */}
      <nav className="tab-bar">
        <button 
          className={`tab-item ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          <span className="tab-icon">🛠️</span>
          <span>Servicios</span>
        </button>
        <button 
          className={`tab-item ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <span className="tab-icon">📋</span>
          <span>Eventos</span>
        </button>
        <button 
          className={`tab-item ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          <span className="tab-icon">➕</span>
          <span>Agregar</span>
        </button>
        <button 
          className={`tab-item ${activeTab === 'auth' ? 'active' : ''}`}
          onClick={() => setActiveTab('auth')}
        >
          <span className="tab-icon">🔑</span>
          <span>Perfil</span>
        </button>
      </nav>
    </div>
  )
}
