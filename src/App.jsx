import React, { useState, useMemo, useEffect } from 'react';
import propertiesData from './properties.json';
import { filterByTenant, aggregateKPIs, aggregateChartsData, generateAISummary } from './utils/dataUtils';
import KPICards from './components/KPICards';
import DashboardCharts from './components/DashboardCharts';
import AIChat from './components/AIChat';

export default function App() {
  const [selectedTenant, setSelectedTenant] = useState('All');

  // Verify shape on startup by logging a few records to the console (Phase 1)
  useEffect(() => {
    console.log("--- NIUA Properties Data Wiring Verification ---");
    console.log("Total records loaded:", propertiesData.length);
    console.log("First 3 records shape:", propertiesData.slice(0, 3));
    console.log("-------------------------------------------------");
  }, []);

  // Get dynamic unique list of cities/tenants for the dropdown
  const cities = useMemo(() => {
    if (!propertiesData) return [];
    return [...new Set(propertiesData.map(record => record.tenant))].sort();
  }, []);

  // Filter records based on selected city (memoized)
  const filteredRecords = useMemo(() => {
    return filterByTenant(propertiesData, selectedTenant);
  }, [selectedTenant]);

  // Aggregate KPIs for the selected city (memoized)
  const kpis = useMemo(() => {
    return aggregateKPIs(filteredRecords);
  }, [filteredRecords]);

  // Pre-aggregate comparison chart data across ALL 10 cities (always static, regardless of filter)
  const chartsData = useMemo(() => {
    return aggregateChartsData(propertiesData);
  }, []);

  // Pre-aggregate compact system context statistics for the LLM
  const aiContextString = useMemo(() => {
    return generateAISummary(propertiesData);
  }, []);

  return (
    <div className="app-container">
      {/* Main Dashboard Panel */}
      <main className="main-content">
        <header className="dashboard-header">
          <div className="dashboard-title-area">
            <h1>Property Tax Analytics</h1>
            <p>National Institute of Urban Affairs (NIUA) • Property Register Portal</p>
          </div>

          {/* Controlled Dropdown Select for City Filtering */}
          <div className="filter-container">
            <label htmlFor="city-select" className="filter-label">City Filter</label>
            <select
              id="city-select"
              className="custom-select"
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
            >
              <option value="All">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* 4 Metric KPI Cards Section */}
        <section aria-label="KPI Cards Section">
          <KPICards kpis={kpis} />
        </section>

        {/* 10-City Comparative Visualization Charts Section */}
        <section aria-label="Analytical Visualizations Section">
          <DashboardCharts chartsData={chartsData} />
        </section>
      </main>

      {/* Persistent conversational AI helper sidebar */}
      <AIChat contextString={aiContextString} />
    </div>
  );
}
