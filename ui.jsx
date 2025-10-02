import React, { useState, useEffect } from 'react';
import { Activity, Wifi, WifiOff, AlertTriangle, CheckCircle, Navigation, Zap, Thermometer, Wind, Radio } from 'lucide-react';

const LunarHabitatUI = () => {
 const [robots, setRobots] = useState([]);
const [envData, setEnvData] = useState([]);
const [alerts, setAlerts] = useState([]);

useEffect(() => {
  const ws = new WebSocket("ws://localhost:8765");
  ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    setRobots(data.robots);
    setAlerts(data.alerts);

    setEnvData([
      { label: 'O₂ Level', value: data.environment.O2 + '%', status: 'optimal', icon: Wind },
      { label: 'Pressure', value: data.environment.Pressure + ' kPa', status: 'optimal', icon: Activity },
      { label: 'Temperature', value: data.environment.Temperature + '°C', status: 'optimal', icon: Thermometer },
      { label: 'Radiation', value: data.environment.Radiation + ' mSv/h', status: 'warning', icon: Radio }
    ]);
  };
  return () => ws.close();
}, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-gray-100 p-6 font-sans">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            LUNAR HABITAT CONTROL
          </h1>
          <p className="text-gray-400 mt-1">Autonomous Monitoring System v3.2</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-mono text-cyan-400">{formatTime(time)}</div>
          <div className="text-sm text-gray-400">Mission Day 47</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Panel - Environmental & Status */}
        <div className="col-span-3 space-y-6">
          {/* Environment Monitoring */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-4 shadow-lg shadow-cyan-500/10">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Environment
            </h3>
            <div className="space-y-3">
              {envData.map((item, idx) => (
                <div key={idx} className="bg-slate-800/50 rounded p-3 border border-slate-700">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-400 flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.status === 'optimal' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="text-xl font-bold text-cyan-300">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-4 shadow-lg shadow-cyan-500/10">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              System Status
            </h3>
            <div className="space-y-3">
              <StatusItem label="Navigation Grid" status="online" />
              <StatusItem label="Comm Array" status="online" />
              <StatusItem label="Power Systems" status="online" />
              <StatusItem label="Life Support" status="online" />
            </div>
          </div>
        </div>

        {/* Center - Habitat Map */}
        <div className="col-span-6">
          <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6 shadow-lg shadow-cyan-500/10 h-full">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-cyan-400" />
              Habitat Layout & Robot Positions
            </h3>
            <div className="relative bg-slate-950 rounded-lg h-[500px] border border-cyan-500/20">
              {/* Grid pattern */}
              <svg className="absolute inset-0 w-full h-full opacity-20">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="cyan" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              {/* Habitat structure */}
              <div className="absolute inset-0 p-8">
                <div className="relative w-full h-full">
                  {/* Main habitat modules */}
                  <div className="absolute top-1/4 left-1/4 w-48 h-32 border-2 border-blue-400/50 bg-blue-500/10 rounded">
                    <span className="absolute top-2 left-2 text-xs text-blue-300">Living Quarters</span>
                  </div>
                  <div className="absolute top-1/4 right-1/4 w-40 h-32 border-2 border-green-400/50 bg-green-500/10 rounded">
                    <span className="absolute top-2 left-2 text-xs text-green-300">Lab Module</span>
                  </div>
                  <div className="absolute bottom-1/4 left-1/3 w-40 h-24 border-2 border-purple-400/50 bg-purple-500/10 rounded">
                    <span className="absolute top-2 left-2 text-xs text-purple-300">Airlock</span>
                  </div>

                  {/* Robots */}
                  {robots.map((robot) => (
                    <div
                      key={robot.id}
                      className={`absolute w-8 h-8 -ml-4 -mt-4 cursor-pointer transition-all ${
                        selectedRobot?.id === robot.id ? 'scale-125' : ''
                      }`}
                      style={{ left: `${robot.position.x}px`, top: `${robot.position.y}px` }}
                      onClick={() => setSelectedRobot(robot)}
                    >
                      <div className={`w-full h-full rounded-full ${
                        robot.status === 'active' ? 'bg-cyan-400 animate-pulse' : 'bg-gray-500'
                      } shadow-lg flex items-center justify-center`}>
                        <Navigation className="w-4 h-4 text-slate-900" />
                      </div>
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap bg-slate-900 px-2 py-1 rounded border border-cyan-500/30">
                        {robot.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Robot Fleet & Alerts */}
        <div className="col-span-3 space-y-6">
          {/* Robot Fleet */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-4 shadow-lg shadow-cyan-500/10">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Robot Fleet
            </h3>
            <div className="space-y-3">
              {robots.map((robot) => (
                <div
                  key={robot.id}
                  onClick={() => setSelectedRobot(robot)}
                  className={`bg-slate-800/50 rounded p-3 border cursor-pointer transition-all ${
                    selectedRobot?.id === robot.id
                      ? 'border-cyan-400 shadow-lg shadow-cyan-500/20'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-cyan-300">{robot.name}</div>
                    <div className={`w-2 h-2 rounded-full ${
                      robot.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
                    }`} />
                  </div>
                  <div className="text-xs text-gray-400 mb-2">{robot.task}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all"
                        style={{ width: `${robot.battery}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{robot.battery}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-4 shadow-lg shadow-cyan-500/10">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Alerts
            </h3>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded border ${
                    alert.level === 'warning'
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : 'bg-blue-500/10 border-blue-500/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-semibold">{alert.time}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      alert.level === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {alert.level}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{alert.msg}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <StatCard label="Active Robots" value="3/4" status="good" />
        <StatCard label="Coverage" value="94.2%" status="good" />
        <StatCard label="System Health" value="98.7%" status="good" />
        <StatCard label="Next Maintenance" value="12h 34m" status="normal" />
      </div>
    </div>
  );
};

const StatusItem = ({ label, status }) => (
  <div className="flex justify-between items-center bg-slate-800/30 rounded p-2">
    <span className="text-sm text-gray-400">{label}</span>
    <div className="flex items-center gap-2">
      {status === 'online' ? (
        <>
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-xs text-green-400">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-red-400" />
          <span className="text-xs text-red-400">Offline</span>
        </>
      )}
    </div>
  </div>
);

const StatCard = ({ label, value, status }) => (
  <div className="bg-slate-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-4 shadow-lg shadow-cyan-500/10">
    <div className="text-sm text-gray-400 mb-1">{label}</div>
    <div className="text-2xl font-bold text-cyan-300">{value}</div>
  </div>
);

export default LunarHabitatUI;
