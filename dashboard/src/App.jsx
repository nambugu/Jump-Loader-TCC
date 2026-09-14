import { useState, useEffect, useMemo } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from './firebase'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// Limite superior usado só para escalar a cor do medidor de simetria (em "x peso corporal")
const MAX_FORCE_BW = 3

function formatTime(ts) {
  if (!ts) return '--:--:--'
  return new Date(ts).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// Interpola entre a cor "madeira" (baixo impacto) e "vermelho de impacto" (alto impacto)
function forceColor(bw) {
  const t = Math.min(bw / MAX_FORCE_BW, 1)
  const r = Math.round(201 + (225 - 201) * t)
  const g = Math.round(138 + (68 - 138) * t)
  const b = Math.round(75 + (59 - 75) * t)
  return `rgb(${r}, ${g}, ${b})`
}

export default function App() {
  const [connected, setConnected] = useState(false)
  const [athletes, setAthletes] = useState({})
  const [selectedAthlete, setSelectedAthlete] = useState('')

  // Indicador de conexão com o Firebase
  useEffect(() => {
    const connectedRef = ref(db, '.info/connected')
    const unsub = onValue(connectedRef, (snap) => setConnected(snap.val() === true))
    return () => unsub()
  }, [])

  // Escuta o nó /saltos inteiro — estrutura esperada:
  // saltos/{idJogador}/{idSalto} = { altura_cm, tempo_contato_ms, forca_impacto_bw,
  //                                  forca_pe_esquerdo, forca_pe_direito, timestamp }
  useEffect(() => {
    const saltosRef = ref(db, 'saltos')
    const unsub = onValue(saltosRef, (snap) => {
      const data = snap.val() || {}
      setAthletes(data)
      setSelectedAthlete((current) => current || Object.keys(data)[0] || '')
    })
    return () => unsub()
  }, [])

  const jumps = useMemo(() => {
    const raw = athletes[selectedAthlete] || {}
    return Object.entries(raw)
      .map(([id, jump]) => ({ id, ...jump }))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
  }, [athletes, selectedAthlete])

  const latest = jumps[0]

  const chartData = useMemo(
    () =>
      [...jumps]
        .slice(0, 20)
        .reverse()
        .map((j) => ({ hora: formatTime(j.timestamp), altura: j.altura_cm })),
    [jumps]
  )

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">⛹</span>
          <div>
            <h1>Sistema de Análise de Aterrissagem</h1>
            <p className="subtitle">TCC — Biomecânica do salto no basquete</p>
          </div>
        </div>
        <div className="status">
          <span className={`dot ${connected ? 'dot-live' : 'dot-off'}`} />
          {connected ? 'Conectado ao Firebase' : 'Sem conexão'}
        </div>
      </header>

      <div className="athlete-select">
        <label htmlFor="athlete">Jogador</label>
        <select
          id="athlete"
          value={selectedAthlete}
          onChange={(e) => setSelectedAthlete(e.target.value)}
        >
          {Object.keys(athletes).length === 0 && <option value="">Nenhum dado ainda</option>}
          {Object.keys(athletes).map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </div>

      <section className="hero">
        <h2 className="hero-label">Último salto</h2>
        {!latest ? (
          <p className="empty">Aguardando dados do equipamento…</p>
        ) : (
          <div className="hero-grid">
            <div className="stat">
              <span className="stat-value">{latest.altura_cm?.toFixed(1)}</span>
              <span className="stat-unit">cm</span>
              <span className="stat-label">Altura do salto</span>
            </div>
            <div className="stat">
              <span className="stat-value">{latest.tempo_contato_ms}</span>
              <span className="stat-unit">ms</span>
              <span className="stat-label">Tempo de contato</span>
            </div>
            <div className="stat">
              <span className="stat-value">{latest.forca_impacto_bw?.toFixed(1)}</span>
              <span className="stat-unit">x peso</span>
              <span className="stat-label">Força de impacto</span>
            </div>
            <div className="symmetry">
              <div className="symmetry-bars">
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      height: `${Math.min((latest.forca_pe_esquerdo || 0) / MAX_FORCE_BW, 1) * 100}%`,
                      background: forceColor(latest.forca_pe_esquerdo || 0),
                    }}
                  />
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      height: `${Math.min((latest.forca_pe_direito || 0) / MAX_FORCE_BW, 1) * 100}%`,
                      background: forceColor(latest.forca_pe_direito || 0),
                    }}
                  />
                </div>
              </div>
              <div className="symmetry-labels">
                <span>Pé E</span>
                <span>Pé D</span>
              </div>
              <span className="stat-label">Simetria de impacto</span>
            </div>
          </div>
        )}
      </section>

      <section className="grid-two">
        <div className="panel">
          <h3>Tendência — altura do salto</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="var(--line)" strokeDasharray="3 3" />
              <XAxis dataKey="hora" stroke="var(--chalk-dim)" fontSize={12} />
              <YAxis stroke="var(--chalk-dim)" fontSize={12} unit="cm" />
              <Tooltip
                contentStyle={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 8 }}
                labelStyle={{ color: 'var(--chalk)' }}
              />
              <Line type="monotone" dataKey="altura" stroke="var(--whistle)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <h3>Histórico de saltos</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Altura</th>
                  <th>Contato</th>
                  <th>Impacto</th>
                </tr>
              </thead>
              <tbody>
                {jumps.slice(0, 12).map((j) => (
                  <tr key={j.id}>
                    <td>{formatTime(j.timestamp)}</td>
                    <td>{j.altura_cm?.toFixed(1)} cm</td>
                    <td>{j.tempo_contato_ms} ms</td>
                    <td>{j.forca_impacto_bw?.toFixed(1)}x</td>
                  </tr>
                ))}
                {jumps.length === 0 && (
                  <tr>
                    <td colSpan={4} className="empty">
                      Sem registros ainda
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
