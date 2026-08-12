import React, { useState, useEffect } from 'react'

const API_BASE = 'http://127.0.0.1:8000/api'

export default function App() {
  const [activeTab, setActiveTab] = useState('vehiculos')
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [user, setUser] = useState(localStorage.getItem('user') || '')

  // Data states
  const [vehiculos, setVehiculos] = useState([])
  const [marcas, setMarcas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [marcaFilter, setMarcaFilter] = useState('')
  const [anioMin, setAnioMin] = useState('')
  const [anioMax, setAnioMax] = useState('')

  // Form states - Vehiculo
  const [vehMarca, setVehMarca] = useState('')
  const [vehModelo, setVehModelo] = useState('')
  const [vehAnio, setVehAnio] = useState(new Date().getFullYear())
  const [vehPlaca, setVehPlaca] = useState('')
  const [vehColor, setVehColor] = useState('')

  // Form states - Marca
  const [nuevaMarca, setNuevaMarca] = useState('')

  // Form states - Auth
  const [loginUser, setLoginUser] = useState('admin')
  const [loginPass, setLoginPass] = useState('admin')
  const [regUser, setRegUser] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPass, setRegPass] = useState('')

  useEffect(() => {
    fetchMarcas()
    fetchVehiculos()
  }, [])

  const fetchMarcas = async () => {
    try {
      const res = await fetch(`${API_BASE}/marcas/`)
      if (!res.ok) throw new Error('Error al cargar marcas')
      const data = await res.json()
      setMarcas(data.results || data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchVehiculos = async () => {
    setLoading(true)
    setError('')
    try {
      let url = `${API_BASE}/vehiculos/?search=${encodeURIComponent(searchQuery)}`
      if (marcaFilter) url += `&marca=${marcaFilter}`
      if (anioMin) url += `&anio_min=${anioMin}`
      if (anioMax) url += `&anio_max=${anioMax}`

      const res = await fetch(url)
      if (!res.ok) throw new Error('Error al consultar vehículos')
      const data = await res.json()
      setVehiculos(data.results || data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchVehiculos()
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`${API_BASE}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUser, password: loginPass })
      })
      if (!res.ok) throw new Error('Credenciales inválidas')
      const data = await res.json()
      setToken(data.access)
      setUser(loginUser)
      localStorage.setItem('token', data.access)
      localStorage.setItem('user', loginUser)
      setSuccess(`Sesión iniciada con exito como ${loginUser}`)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`${API_BASE}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: regUser, email: regEmail, password: regPass })
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(JSON.stringify(errData))
      }
      setSuccess(`Usuario ${regUser} registrado correctamente. Ahora puedes iniciar sesión.`)
      setRegUser('')
      setRegEmail('')
      setRegPass('')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleLogout = () => {
    setToken('')
    setUser('')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setSuccess('Sesión cerrada correctamente')
  }

  const handleCreateVehiculo = async (e) => {
    e.preventDefault()
    if (!token) {
      setError('Debes iniciar sesión con un usuario Administrador para registrar vehículos')
      return
    }
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`${API_BASE}/vehiculos/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          marca: parseInt(vehMarca),
          modelo: vehModelo,
          anio: parseInt(vehAnio),
          placa: vehPlaca,
          color: vehColor
        })
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(JSON.stringify(errData))
      }
      setSuccess('Vehículo registrado correctamente')
      setVehModelo('')
      setVehPlaca('')
      setVehColor('')
      fetchVehiculos()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCreateMarca = async (e) => {
    e.preventDefault()
    if (!token) {
      setError('Debes iniciar sesión con un usuario Administrador para crear marcas')
      return
    }
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`${API_BASE}/marcas/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nombre: nuevaMarca })
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(JSON.stringify(errData))
      }
      setSuccess(`Marca "${nuevaMarca}" creada exitosamente`)
      setNuevaMarca('')
      fetchMarcas()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="header">
        <div className="logo-group">
          <div className="logo-badge">UTE</div>
          <span className="logo-title">Gestión de Alquiler de Vehículos</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {token ? (
            <>
              <span className="badge badge-green">Sesión: {user}</span>
              <button className="btn btn-secondary" onClick={handleLogout}>Cerrar Sesión</button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => setActiveTab('auth')}>Iniciar Sesión JWT</button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="main-content">
        {/* Navigation Tabs */}
        <nav className="tabs-nav">
          <button 
            className={`tab-btn ${activeTab === 'vehiculos' ? 'active' : ''}`}
            onClick={() => setActiveTab('vehiculos')}
          >
            🚗 Catálogo de Vehículos (SQL)
          </button>
          <button 
            className={`tab-btn ${activeTab === 'marcas' ? 'active' : ''}`}
            onClick={() => setActiveTab('marcas')}
          >
            🏷️ Marcas de Vehículos
          </button>
          <button 
            className={`tab-btn ${activeTab === 'auth' ? 'active' : ''}`}
            onClick={() => setActiveTab('auth')}
          >
            🔐 Autenticación & Usuarios (JWT)
          </button>
        </nav>

        {/* Global Notifications */}
        {error && <div className="alert alert-error">⚠️ {error}</div>}
        {success && <div className="alert alert-success">✅ {success}</div>}

        {/* TAB 1: VEHICULOS */}
        {activeTab === 'vehiculos' && (
          <div className="grid-2">
            {/* Form Column */}
            <div className="card">
              <h3 className="card-title">➕ Registrar Nuevo Vehículo</h3>
              <form onSubmit={handleCreateVehiculo}>
                <div className="form-group">
                  <label className="form-label">Marca</label>
                  <select 
                    className="form-select" 
                    value={vehMarca} 
                    onChange={e => setVehMarca(e.target.value)}
                    required
                  >
                    <option value="">Seleccione Marca...</option>
                    {marcas.map(m => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Modelo</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Ej. Corolla, Tracker" 
                    value={vehModelo}
                    onChange={e => setVehModelo(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Año</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    value={vehAnio}
                    onChange={e => setVehAnio(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Placa</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Ej. ABC-1234" 
                    value={vehPlaca}
                    onChange={e => setVehPlaca(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Ej. Rojo, Blanco" 
                    value={vehColor}
                    onChange={e => setVehColor(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Guardar Vehículo
                </button>
              </form>
            </div>

            {/* List Column */}
            <div className="card">
              <h3 className="card-title">
                <span>📋 Flota de Vehículos Registrados</span>
                {loading && <span className="loading-spinner"></span>}
              </h3>

              {/* Filters */}
              <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '1rem' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Buscar modelo/placa..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Año Mín"
                  value={anioMin}
                  onChange={e => setAnioMin(e.target.value)}
                />
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Año Máx"
                  value={anioMax}
                  onChange={e => setAnioMax(e.target.value)}
                />
                <button type="submit" className="btn btn-secondary">Filtrar</button>
              </form>

              {/* Table */}
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Marca</th>
                      <th>Modelo</th>
                      <th>Año</th>
                      <th>Placa</th>
                      <th>Color</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehiculos.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                          No se encontraron vehículos registrados.
                        </td>
                      </tr>
                    ) : (
                      vehiculos.map(v => (
                        <tr key={v.id}>
                          <td><strong>#{v.id}</strong></td>
                          <td><span className="badge badge-blue">{v.marca_nombre}</span></td>
                          <td>{v.modelo}</td>
                          <td>{v.anio}</td>
                          <td><code>{v.placa}</code></td>
                          <td>{v.color || 'N/A'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MARCAS */}
        {activeTab === 'marcas' && (
          <div className="grid-2">
            <div className="card">
              <h3 className="card-title">➕ Agregar Marca</h3>
              <form onSubmit={handleCreateMarca}>
                <div className="form-group">
                  <label className="form-label">Nombre de Marca</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Ej. Nissan, Mazda, Honda"
                    value={nuevaMarca}
                    onChange={e => setNuevaMarca(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-accent" style={{ width: '100%' }}>
                  Crear Marca
                </button>
              </form>
            </div>

            <div className="card">
              <h3 className="card-title">🏷️ Lista de Marcas</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre de Marca</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marcas.map(m => (
                      <tr key={m.id}>
                        <td><strong>#{m.id}</strong></td>
                        <td>{m.nombre}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AUTH */}
        {activeTab === 'auth' && (
          <div className="grid-2">
            {/* Login */}
            <div className="card">
              <h3 className="card-title">🔑 Iniciar Sesión (JWT Login)</h3>
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">Usuario</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={loginUser}
                    onChange={e => setLoginUser(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contraseña</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    value={loginPass}
                    onChange={e => setLoginPass(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Obtener JWT Token
                </button>
              </form>
            </div>

            {/* Register */}
            <div className="card">
              <h3 className="card-title">📝 Registrar Nuevo Usuario</h3>
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label className="form-label">Nombre de Usuario</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="nuevo_usuario"
                    value={regUser}
                    onChange={e => setRegUser(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Correo Electrónico</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="correo@ejemplo.com"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contraseña (Mínimo 6 caracteres)</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    value={regPass}
                    onChange={e => setRegPass(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-secondary" style={{ width: '100%' }}>
                  Registrar Cuenta
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
