import { useEffect, useState } from "react"
import "./App.css"

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function App() {
  const [data, setData] = useState(null)
  const [machineData, setMachineData] = useState(null)
  const [error, setError] = useState("")
  const [activePage, setActivePage] = useState("dashboard")

  const [selectedMachine, setSelectedMachine] = useState("M2")
  const [scenarioType, setScenarioType] = useState("capacity")
  const [scenarioValue, setScenarioValue] = useState(250)

  const [whatIfResult, setWhatIfResult] = useState(null)
  const [loadingScenario, setLoadingScenario] = useState(false)
  const [scenarioError, setScenarioError] = useState("")

  // =====================================================
  // LOAD SIMULATION DATA
  // =====================================================

  useEffect(() => {
    fetch(`${API}/api/simulation/test`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load simulation data")
        }
        return response.json()
      })
      .then((result) => {
        setData(result)
      })
      .catch((err) => {
        setError(err.message)
      })
  }, [])

  // =====================================================
  // LOAD MACHINE DATA
  // =====================================================

  useEffect(() => {
    fetch(`${API}/api/machines`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load machine data")
        }
        return response.json()
      })
      .then((result) => {
        setMachineData(result)
      })
      .catch((err) => {
        setError(err.message)
      })
  }, [])

  // =====================================================
  // WHAT-IF SIMULATION
  // =====================================================

  const runWhatIfSimulation = async () => {
    setLoadingScenario(true)
    setScenarioError("")
    setWhatIfResult(null)

    try {
      const params = new URLSearchParams()

      params.append("machine", selectedMachine)

      if (scenarioType === "capacity") {
        params.append("capacity", scenarioValue)
      }

      if (scenarioType === "processing") {
        params.append("processing_time", scenarioValue)
      }

      if (scenarioType === "downtime") {
        params.append("status", "DOWN")
      }

      const response = await fetch(
        `${API}/api/simulation/what-if?${params.toString()}`
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.detail || "Scenario simulation failed"
        )
      }

      const result = await response.json()
      setWhatIfResult(result)
    } catch (err) {
      setScenarioError(err.message)
    } finally {
      setLoadingScenario(false)
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (!data || !machineData) {
    return (
      <div className="loading-screen">
        <div className="loading-box">
          <div className="loading-spinner"></div>
          <h3>Loading SmartFactory Twin</h3>
          <p>Connecting to simulation engine...</p>

          {error && (
            <div className="loading-error">
              {error}
            </div>
          )}
        </div>
      </div>
    )
  }

  // =====================================================
  // SIDEBAR
  // =====================================================

  const navigation = [
    {
      id: "dashboard",
      icon: "▦",
      label: "Dashboard",
    },
    {
      id: "digital-twin",
      icon: "◈",
      label: "Digital Twin",
    },
    {
      id: "what-if",
      icon: "◇",
      label: "What-If Simulator",
    },
    {
      id: "analytics",
      icon: "⌁",
      label: "Analytics",
    },
    {
      id: "machines",
      icon: "⚙",
      label: "Machines",
    },
  ]

  return (
    <div className="app">

      {/* =================================================
          SIDEBAR
          ================================================= */}

      <aside className="sidebar">

        <div className="logo">
          <div className="logo-icon">
            SF
          </div>

          <div className="logo-text">
            <h2>
              Smart<span>Factory</span>
            </h2>
            <p>Digital Twin</p>
          </div>
        </div>

        <div className="nav-section">
          <p className="nav-title">
            CONTROL CENTER
          </p>

          {navigation.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${
                activePage === item.id ? "active" : ""
              }`}
              onClick={() => setActivePage(item.id)}
            >
              <span className="nav-icon">
                {item.icon}
              </span>

              <span className="nav-label">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        <div className="sidebar-bottom">

          <div className="system-status">
            <span className="status-dot"></span>

            <div>
              <strong>System Online</strong>
              <p>Simulation engine active</p>
            </div>
          </div>

          <div className="version">
            SmartFactory Twin v1.0
          </div>

        </div>

      </aside>

      {/* =================================================
          MAIN
          ================================================= */}

      <main className="main">

        {/* TOPBAR */}

        <header className="topbar">

          <div>
            <p className="topbar-label">
              PRODUCTION INTELLIGENCE PLATFORM
            </p>

            <h1>
              {getPageTitle(activePage)}
            </h1>
          </div>

          <div className="header-right">

            <div className="live">
              <span className="live-dot"></span>
              LIVE SIMULATION
            </div>

            <div className="time">
              {new Date().toLocaleTimeString()}
            </div>

          </div>

        </header>

        {/* =================================================
            PAGE CONTENT
            ================================================= */}

        <div className="content">

          {activePage === "dashboard" && (
            <Dashboard
              data={data}
            />
          )}

          {activePage === "digital-twin" && (
            <DigitalTwinPage
              data={data}
            />
          )}

          {activePage === "what-if" && (
            <WhatIfPage
              machineData={machineData}
              data={data}
              selectedMachine={selectedMachine}
              setSelectedMachine={setSelectedMachine}
              scenarioType={scenarioType}
              setScenarioType={setScenarioType}
              scenarioValue={scenarioValue}
              setScenarioValue={setScenarioValue}
              whatIfResult={whatIfResult}
              loadingScenario={loadingScenario}
              scenarioError={scenarioError}
              runWhatIfSimulation={runWhatIfSimulation}
            />
          )}

          {activePage === "analytics" && (
            <AnalyticsPage
              data={data}
            />
          )}

          {activePage === "machines" && (
            <MachinesPage
              machineData={machineData}
              data={data}
            />
          )}

        </div>

      </main>
    </div>
  )
}


// =======================================================
// PAGE TITLE
// =======================================================

function getPageTitle(page) {
  const titles = {
    dashboard: "Production Dashboard",
    "digital-twin": "Digital Twin",
    "what-if": "What-If Simulation",
    analytics: "Production Analytics",
    machines: "Machine Intelligence",
  }

  return titles[page] || "SmartFactory Twin"
}


// =======================================================
// DASHBOARD
// =======================================================

function Dashboard({ data }) {
  const runningMachines = data.machines.filter(
    (machine) => machine.status === "RUNNING"
  ).length

  const averageUtilization =
    data.machines.reduce(
      (sum, machine) => sum + machine.utilization,
      0
    ) / data.machines.length

  return (
    <div className="page">

      {/* PAGE INTRO */}

      <div className="page-header">
        <div>
          <h2>Production Overview</h2>

          <p>
            Real-time digital representation of the production line
          </p>
        </div>

        <div className="header-badge">
          ● SIMULATION ACTIVE
        </div>
      </div>

      {/* KPI CARDS */}

      <div className="kpi-grid">

        <KpiCard
          title="Throughput"
          value={data.throughput}
          suffix="units"
          description={`${data.throughput_per_hour} units/hour`}
          icon="↗"
          type="blue"
        />

        <KpiCard
          title="Bottleneck"
          value={data.bottleneck}
          suffix=""
          description="Current constraint"
          icon="⚠"
          type="orange"
        />

        <KpiCard
          title="Running Machines"
          value={`${runningMachines}/${data.machines.length}`}
          suffix=""
          description="Machines operational"
          icon="⚙"
          type="green"
        />

        <KpiCard
          title="Avg Utilization"
          value={averageUtilization.toFixed(1)}
          suffix="%"
          description="Production line"
          icon="◌"
          type="purple"
        />

      </div>

      {/* PRODUCTION LINE */}

      <div className="panel">

        <div className="panel-header">

          <div>
            <h3>Production Line</h3>

            <p>
              Machine-to-machine production flow
            </p>
          </div>

          <span className="badge">
            {data.machines.length} STAGES
          </span>

        </div>

        <div className="production-line">

          {data.machines.map((machine, index) => (
            <div
              className="line-stage"
              key={machine.name}
            >

              <MachineFlowCard
                machine={machine}
                isBottleneck={
                  data.bottleneck === machine.name
                }
              />

              {index < data.machines.length - 1 && (
                <div className="flow-arrow">
                  →
                </div>
              )}

            </div>
          ))}

        </div>

      </div>

      {/* LOWER SECTION */}

      <div className="bottom-grid">

        <QueuePanel
          machines={data.machines}
        />

        <BottleneckPanel
          data={data}
        />

      </div>

    </div>
  )
}


// =======================================================
// KPI CARD
// =======================================================

function KpiCard({
  title,
  value,
  suffix,
  description,
  icon,
  type,
}) {
  return (
    <div className={`kpi-card ${type}`}>

      <div className="kpi-top">

        <span className="kpi-title">
          {title}
        </span>

        <span className="kpi-icon">
          {icon}
        </span>

      </div>

      <div className="kpi-value">
        {value}
        <small>{suffix}</small>
      </div>

      <p className="kpi-description">
        {description}
      </p>

    </div>
  )
}


// =======================================================
// MACHINE FLOW CARD
// =======================================================

function MachineFlowCard({
  machine,
  isBottleneck,
}) {
  return (
    <div
      className={`machine-flow-card ${
        isBottleneck ? "bottleneck" : ""
      }`}
    >

      <div className="machine-flow-top">

        <div className="machine-icon">
          ⚙
        </div>

        <div className="machine-status-dot"></div>

      </div>

      <h4>{machine.name}</h4>

      <p className="machine-flow-status">
        {machine.status}
      </p>

      <div className="machine-flow-data">

        <div>
          <span>Rate</span>
          <strong>
            {machine.effective_rate}
          </strong>
        </div>

        <div>
          <span>Util.</span>
          <strong>
            {machine.utilization}%
          </strong>
        </div>

      </div>

      {isBottleneck && (
        <div className="bottleneck-tag">
          ⚠ BOTTLENECK
        </div>
      )}

    </div>
  )
}


// =======================================================
// QUEUE PANEL
// =======================================================

function QueuePanel({ machines }) {
  const maxQueue = Math.max(
    ...machines.map((machine) => machine.queue),
    1
  )

  return (
    <div className="panel">

      <div className="panel-header">

        <div>
          <h3>Queue Monitoring</h3>
          <p>Work-in-progress between stages</p>
        </div>

      </div>

      <div className="queue-list">

        {machines.map((machine) => (
          <div
            className="queue-row"
            key={machine.name}
          >

            <div className="queue-name">
              {machine.name}
            </div>

            <div className="queue-bar-container">

              <div className="queue-bar">
                <div
                  style={{
                    width: `${Math.min(
                      (machine.queue / maxQueue) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>

            </div>

            <div className="queue-value">
              {machine.queue}
            </div>

          </div>
        ))}

      </div>

    </div>
  )
}


// =======================================================
// BOTTLENECK PANEL
// =======================================================

function BottleneckPanel({ data }) {
  const machine = data.machines.find(
    (item) => item.name === data.bottleneck
  )

  return (
    <div className="panel bottleneck-panel">

      <div className="panel-header">

        <div>
          <h3>Bottleneck Intelligence</h3>
          <p>Current production constraint</p>
        </div>

        <span className="severity-badge">
          HIGH IMPACT
        </span>

      </div>

      <div className="bottleneck-main">

        <div className="bottleneck-icon">
          ⚠
        </div>

        <div>
          <span>Detected Bottleneck</span>
          <strong>{data.bottleneck}</strong>
        </div>

      </div>

      <div className="bottleneck-stats">

        <div>
          <span>Utilization</span>
          <strong>
            {machine?.utilization ?? 0}%
          </strong>
        </div>

        <div>
          <span>Queue</span>
          <strong>
            {machine?.queue ?? 0}
          </strong>
        </div>

        <div>
          <span>Effective Rate</span>
          <strong>
            {machine?.effective_rate ?? 0}
          </strong>
        </div>

      </div>

      <div className="recommendation">

        <span>RECOMMENDATION</span>

        <p>
          Consider increasing the capacity of{" "}
          <strong>{data.bottleneck}</strong>{" "}
          or reducing its processing time to
          improve production throughput.
        </p>

      </div>

    </div>
  )
}


// =======================================================
// DIGITAL TWIN PAGE
// =======================================================

function DigitalTwinPage({ data }) {
  return (
    <div className="page">

      <div className="page-header">
        <div>
          <h2>Digital Twin</h2>
          <p>
            Virtual representation of the production line
          </p>
        </div>

        <div className="header-badge">
          ● LIVE MODEL
        </div>
      </div>

      <div className="twin-overview">

        <div className="twin-status-card">

          <div className="twin-icon">
            ◈
          </div>

          <div>
            <span>Model Status</span>
            <strong>ACTIVE</strong>
          </div>

        </div>

        <div className="twin-status-card">

          <div className="twin-icon">
            ⚙
          </div>

          <div>
            <span>Production Stages</span>
            <strong>{data.machines.length}</strong>
          </div>

        </div>

        <div className="twin-status-card">

          <div className="twin-icon">
            ↗
          </div>

          <div>
            <span>Current Throughput</span>
            <strong>
              {data.throughput_per_hour} u/hr
            </strong>
          </div>

        </div>

      </div>

      <div className="panel twin-panel">

        <div className="panel-header">

          <div>
            <h3>Virtual Production Line</h3>
            <p>
              Simulated flow of material through each stage
            </p>
          </div>

        </div>

        <div className="twin-line">

          {data.machines.map((machine, index) => (
            <div
              className="twin-stage-wrapper"
              key={machine.name}
            >

              <div
                className={`twin-stage ${
                  data.bottleneck === machine.name
                    ? "twin-bottleneck"
                    : ""
                }`}
              >

                <div className="twin-machine-icon">
                  ⚙
                </div>

                <strong>{machine.name}</strong>

                <span>
                  {machine.effective_rate} u/hr
                </span>

                <small>
                  Utilization {machine.utilization}%
                </small>

              </div>

              {index < data.machines.length - 1 && (
                <div className="twin-arrow">
                  →
                </div>
              )}

            </div>
          ))}

        </div>

      </div>

    </div>
  )
}


// =======================================================
// WHAT-IF PAGE
// =======================================================

function WhatIfPage({
  machineData,
  data,
  selectedMachine,
  setSelectedMachine,
  scenarioType,
  setScenarioType,
  scenarioValue,
  setScenarioValue,
  whatIfResult,
  loadingScenario,
  scenarioError,
  runWhatIfSimulation,
}) {
  return (
    <div className="page">

      <div className="page-header">

        <div>
          <h2>What-If Simulator</h2>

          <p>
            Change an operational condition and observe
            production impact
          </p>
        </div>

        <div className="header-badge">
          SIMULATION MODE
        </div>

      </div>

      {/* SCENARIO FORM */}

      <div className="panel scenario-panel">

        <div className="panel-header">

          <div>
            <h3>Create Scenario</h3>
            <p>
              Modify one production condition
            </p>
          </div>

        </div>

        <div className="scenario-form">

          <div className="form-group">

            <label>
              Machine
            </label>

            <select
              value={selectedMachine}
              onChange={(event) =>
                setSelectedMachine(event.target.value)
              }
            >

              {machineData.machines.map((machine) => (
                <option
                  key={machine.name}
                  value={machine.name}
                >
                  {machine.name}
                </option>
              ))}

            </select>

          </div>

          <div className="form-group">

            <label>
              Condition
            </label>

            <select
              value={scenarioType}
              onChange={(event) => {
                setScenarioType(event.target.value)

                if (event.target.value === "capacity") {
                  setScenarioValue(250)
                }

                if (event.target.value === "processing") {
                  setScenarioValue(15)
                }

                if (event.target.value === "downtime") {
                  setScenarioValue(1)
                }
              }}
            >

              <option value="capacity">
                Reduce Capacity
              </option>

              <option value="processing">
                Increase Processing Time
              </option>

              <option value="downtime">
                Machine Downtime
              </option>

            </select>

          </div>

          {scenarioType !== "downtime" && (
            <div className="form-group">

              <label>
                {scenarioType === "capacity"
                  ? "New Capacity (u/hr)"
                  : "New Processing Time (sec)"}
              </label>

              <input
                type="number"
                min="1"
                value={scenarioValue}
                onChange={(event) =>
                  setScenarioValue(event.target.value)
                }
              />

            </div>
          )}

          {scenarioType === "downtime" && (
            <div className="form-group">

              <label>
                Condition
              </label>

              <div className="downtime-display">
                MACHINE DOWN
              </div>

            </div>
          )}

          <button
            className="run-button"
            onClick={runWhatIfSimulation}
            disabled={loadingScenario}
          >
            {loadingScenario
              ? "Running..."
              : "▶ Run Simulation"}
          </button>

        </div>

        {scenarioError && (
          <div className="scenario-error">
            ⚠ {scenarioError}
          </div>
        )}

      </div>

      {/* RESULT */}

      {whatIfResult && (
        <WhatIfResults
          result={whatIfResult}
        />
      )}

      {!whatIfResult && !loadingScenario && (
        <div className="empty-state">

          <div className="empty-icon">
            ◇
          </div>

          <h3>
            No Scenario Run Yet
          </h3>

          <p>
            Select a machine and change an operating
            condition to see how the production line responds.
          </p>

        </div>
      )}

    </div>
  )
}


// =======================================================
// WHAT-IF RESULTS
// =======================================================

function WhatIfResults({ result }) {
  return (
    <div>

      {/* RESULT SUMMARY */}

      <div className="result-grid">

        <div className="result-card baseline">

          <span>BASELINE THROUGHPUT</span>

          <strong>
            {result.baseline.throughput}
          </strong>

          <small>
            {result.baseline.throughput_per_hour} units/hour
          </small>

        </div>

        <div className="result-arrow">
          →
        </div>

        <div className="result-card scenario">

          <span>SCENARIO THROUGHPUT</span>

          <strong>
            {result.scenario_result.throughput}
          </strong>

          <small>
            {result.scenario_result.throughput_per_hour}
            {" "}units/hour
          </small>

        </div>

      </div>

      {/* IMPACT */}

      <div className="impact-card">

        <div className="impact-icon">
          ⚠
        </div>

        <div className="impact-content">

          <span>
            PRODUCTION IMPACT
          </span>

          <strong>
            {result.impact.production_loss} units lost
          </strong>

          <p>
            {result.impact.summary}
          </p>

        </div>

        <div className="impact-percent">
          {result.impact.throughput_change_percent}%
        </div>

      </div>

      {/* BOTTLENECK CHANGE */}

      <div className="panel">

        <div className="panel-header">

          <div>
            <h3>Bottleneck Analysis</h3>
            <p>
              Production constraint before and after the scenario
            </p>
          </div>

        </div>

        <div className="bottleneck-comparison">

          <div>
            <span>Baseline</span>
            <strong>
              {result.baseline.bottleneck}
            </strong>
          </div>

          <div className="comparison-arrow">
            →
          </div>

          <div>
            <span>Scenario</span>
            <strong>
              {result.scenario_result.bottleneck}
            </strong>
          </div>

        </div>

      </div>

      {/* MACHINE COMPARISON */}

      <div className="panel comparison-panel">

        <div className="panel-header">

          <div>
            <h3>Machine-Level Impact</h3>
            <p>
              Operational changes across production stages
            </p>
          </div>

        </div>

        <div className="machine-table">

          <div className="table-header">
            <span>Machine</span>
            <span>Output</span>
            <span>Output Change</span>
            <span>Queue</span>
            <span>Queue Change</span>
            <span>Utilization</span>
          </div>

          {result.machine_comparison.map((machine) => (
            <div
              className="table-row"
              key={machine.name}
            >

              <strong>
                {machine.name}
              </strong>

              <span>
                {machine.scenario_output}
              </span>

              <span
                className={
                  machine.output_change < 0
                    ? "negative"
                    : machine.output_change > 0
                    ? "positive"
                    : ""
                }
              >
                {machine.output_change > 0
                  ? `+${machine.output_change}`
                  : machine.output_change}
              </span>

              <span>
                {machine.scenario_queue}
              </span>

              <span
                className={
                  machine.queue_change > 0
                    ? "negative"
                    : machine.queue_change < 0
                    ? "positive"
                    : ""
                }
              >
                {machine.queue_change > 0
                  ? `+${machine.queue_change}`
                  : machine.queue_change}
              </span>

              <span>
                {machine.scenario_utilization}%
              </span>

            </div>
          ))}

        </div>

      </div>

    </div>
  )
}


// =======================================================
// ANALYTICS PAGE
// =======================================================

function AnalyticsPage({ data }) {
  const averageUtilization =
    data.machines.reduce(
      (sum, machine) => sum + machine.utilization,
      0
    ) / data.machines.length

  const totalQueue =
    data.machines.reduce(
      (sum, machine) => sum + machine.queue,
      0
    )

  const totalDowntime =
    data.machines.reduce(
      (sum, machine) => sum + machine.downtime,
      0
    )

  return (
    <div className="page">

      <div className="page-header">

        <div>
          <h2>Production Analytics</h2>
          <p>
            Operational intelligence from the simulation model
          </p>
        </div>

      </div>

      <div className="analytics-grid">

        <AnalyticsCard
          title="Throughput"
          value={`${data.throughput_per_hour} u/hr`}
          description="Current production rate"
          icon="↗"
        />

        <AnalyticsCard
          title="Average Utilization"
          value={`${averageUtilization.toFixed(1)}%`}
          description="Across all machines"
          icon="◌"
        />

        <AnalyticsCard
          title="Total Queue"
          value={`${totalQueue}`}
          description="Units currently waiting"
          icon="≡"
        />

        <AnalyticsCard
          title="Total Downtime"
          value={`${totalDowntime}s`}
          description="Across production stages"
          icon="◷"
        />

      </div>

      <div className="panel">

        <div className="panel-header">

          <div>
            <h3>Machine Performance</h3>
            <p>
              Current operational metrics
            </p>
          </div>

        </div>

        <div className="analytics-list">

          {data.machines.map((machine) => (
            <div
              className="analytics-machine"
              key={machine.name}
            >

              <div className="analytics-machine-name">
                <strong>{machine.name}</strong>

                {machine.name === data.bottleneck && (
                  <span>
                    BOTTLENECK
                  </span>
                )}
              </div>

              <div className="analytics-metric">
                <small>Output</small>
                <strong>
                  {machine.output}
                </strong>
              </div>

              <div className="analytics-metric">
                <small>Utilization</small>
                <strong>
                  {machine.utilization}%
                </strong>
              </div>

              <div className="analytics-metric">
                <small>Availability</small>
                <strong>
                  {machine.availability}%
                </strong>
              </div>

              <div className="analytics-metric">
                <small>Queue</small>
                <strong>
                  {machine.queue}
                </strong>
              </div>

            </div>
          ))}

        </div>

      </div>

    </div>
  )
}


// =======================================================
// ANALYTICS CARD
// =======================================================

function AnalyticsCard({
  title,
  value,
  description,
  icon,
}) {
  return (
    <div className="analytics-card">

      <div className="analytics-icon">
        {icon}
      </div>

      <span>
        {title}
      </span>

      <strong>
        {value}
      </strong>

      <p>
        {description}
      </p>

    </div>
  )
}


// =======================================================
// MACHINES PAGE
// =======================================================

function MachinesPage({
  machineData,
  data,
}) {
  return (
    <div className="page">

      <div className="page-header">

        <div>
          <h2>⚙ Machines</h2>

          <p>
            Machine configuration and operational status
          </p>
        </div>

        <span className="header-badge">
          {machineData.count} MACHINES
        </span>

      </div>

      <div className="machine-grid">

        {machineData.machines.map((machine) => {

          const simulationMachine =
            data.machines?.find(
              (item) => item.name === machine.name
            )

          const isBottleneck =
            data.bottleneck === machine.name

          const utilization =
            simulationMachine?.utilization ?? 0

          const availability =
            simulationMachine?.availability ?? 0

          const queue =
            simulationMachine?.queue ?? 0

          return (
            <div
              key={machine.name}
              className={`machine-detail-card ${
                isBottleneck
                  ? "bottleneck-machine"
                  : ""
              }`}
            >

              {/* HEADER */}

              <div className="machine-detail-header">

                <div className="machine-title">

                  <div className="machine-big-icon">
                    ⚙
                  </div>

                  <div>
                    <h3>
                      {machine.name}
                    </h3>

                    <p>
                      Production Machine
                    </p>
                  </div>

                </div>

                <span
                  className={`machine-status ${
                    machine.status === "RUNNING"
                      ? "running-status"
                      : "down-status"
                  }`}
                >
                  {machine.status}
                </span>

              </div>

              {/* BOTTLENECK */}

              {isBottleneck && (
                <div className="bottleneck-label">
                  ⚠ CURRENT BOTTLENECK
                </div>
              )}

              {/* SPECS */}

              <div className="machine-specs">

                <div className="spec">
                  <span>
                    Processing Time
                  </span>

                  <strong>
                    {machine.processing_time} sec
                  </strong>
                </div>

                <div className="spec">
                  <span>
                    Capacity
                  </span>

                  <strong>
                    {machine.capacity} u/hr
                  </strong>
                </div>

                <div className="spec">
                  <span>
                    Effective Rate
                  </span>

                  <strong>
                    {machine.effective_rate} u/hr
                  </strong>
                </div>

                <div className="spec">
                  <span>
                    Queue
                  </span>

                  <strong>
                    {queue} units
                  </strong>
                </div>

              </div>

              {/* UTILIZATION */}

              <div className="utilization-section">

                <div className="utilization-header">

                  <span>
                    Machine Utilization
                  </span>

                  <strong>
                    {utilization}%
                  </strong>

                </div>

                <div className="utilization-bar">

                  <div
                    style={{
                      width: `${Math.min(
                        utilization,
                        100
                      )}%`,
                    }}
                  ></div>

                </div>

              </div>

              {/* EXTRA DATA */}

              <div className="machine-extra">

                <div>
                  <span>
                    Availability
                  </span>

                  <strong>
                    {availability}%
                  </strong>
                </div>

                <div>
                  <span>
                    Status
                  </span>

                  <strong>
                    {machine.status}
                  </strong>
                </div>

              </div>

            </div>
          )
        })}

      </div>

    </div>
  )
}


export default App