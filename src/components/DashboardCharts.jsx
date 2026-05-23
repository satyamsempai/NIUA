import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

/**
 * Custom tooltip for the Stacked Collection Bar Chart.
 */
function CollectionTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);
    return (
      <div className="recharts-custom-tooltip">
        <p className="label">{label}</p>
        <div className="value-row" style={{ borderBottom: '1px dashed rgba(255, 255, 255, 0.1)', paddingBottom: '4px', marginBottom: '6px' }}>
          <span className="value-label" style={{ fontWeight: 600 }}>Total Collection:</span>
          <span className="value-num" style={{ color: 'var(--color-primary)' }}>
            ₹ {Math.round(total).toLocaleString('en-IN')}
          </span>
        </div>
        {payload.map((entry, index) => (
          <div className="value-row" key={index} style={{ fontSize: '11px' }}>
            <span className="value-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: entry.color }}></span>
              {entry.name}:
            </span>
            <span className="value-num" style={{ color: '#EAEAEA' }}>
              ₹ {Math.round(entry.value).toLocaleString('en-IN')}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

/**
 * Renders the City Ledger row.
 */
function CityLedgerRow({ city, collection, yoyDelta }) {
  const isPositive = yoyDelta >= 0;
  
  return (
    <div className="city-ledger-row">
      <div className="city-ledger-row-left">
        <span className="city-ledger-name">{city}</span>
        <span className="city-ledger-sub">Municipal Corporation</span>
      </div>
      <div className="city-ledger-row-right">
        <span className="city-ledger-value">
          ₹ {Math.round(collection).toLocaleString('en-IN')}
        </span>
        <span className={`city-ledger-delta ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '▲' : '▼'} {isPositive ? '+' : ''}{yoyDelta}% YoY
        </span>
      </div>
    </div>
  );
}

/**
 * Renders the City Analytics section.
 * Splits into Left: Stacked Bar Chart, Right: City Ledger list.
 */
export default function DashboardCharts({ chartsData }) {
  // Sort chartsData by collection descending for the ledger list, to show highest first
  const sortedLedgerData = React.useMemo(() => {
    return [...chartsData].sort((a, b) => b.collection - a.collection);
  }, [chartsData]);

  // Format Y-axis tick values
  const formatYAxisINR = (tick) => {
    if (tick >= 10000000) {
      return `₹ ${(tick / 10000000).toFixed(1)} Cr`;
    }
    if (tick >= 100000) {
      return `₹ ${(tick / 100000).toFixed(1)} L`;
    }
    if (tick >= 1000) {
      return `₹ ${(tick / 1000).toFixed(0)} k`;
    }
    return `₹ ${tick}`;
  };

  return (
    <div className="city-analytics-container">
      {/* Left: Stacked Bar Chart */}
      <div className="glass-panel chart-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <h2>City Analytics</h2>
          
          {/* Custom inline legend */}
          <div className="chart-legend-inline">
            <div className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: 'var(--accent-sapphire)' }}></span>
              <span className="label-sub" style={{ textTransform: 'none', letterSpacing: 'normal' }}>Residential</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: 'var(--accent-amethyst)' }}></span>
              <span className="label-sub" style={{ textTransform: 'none', letterSpacing: 'normal' }}>Commercial</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: 'var(--accent-emerald)' }}></span>
              <span className="label-sub" style={{ textTransform: 'none', letterSpacing: 'normal' }}>Industrial / Other</span>
            </div>
          </div>
        </div>

        <div style={{ width: '100%', height: 350, marginTop: '16px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartsData}
              margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
            >
              {/* No vertical grid lines, horizontal are soft transparency */}
              <XAxis
                dataKey="city"
                stroke="rgba(255, 255, 255, 0.1)"
                tickLine={false}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                dy={8}
              />
              <YAxis
                stroke="rgba(255, 255, 255, 0.1)"
                tickLine={false}
                axisLine={false}
                tickFormatter={formatYAxisINR}
              />
              <Tooltip content={<CollectionTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }} />
              
              {/* Stacked Bars with theme accent colors */}
              <Bar name="Residential" dataKey="residential" stackId="a" fill="var(--accent-sapphire)" radius={[0, 0, 0, 0]} maxBarSize={40} />
              <Bar name="Commercial" dataKey="commercial" stackId="a" fill="var(--accent-amethyst)" radius={[0, 0, 0, 0]} maxBarSize={40} />
              <Bar name="Industrial / Other" dataKey="industrialOthers" stackId="a" fill="var(--accent-emerald)" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Right: City Ledger */}
      <div className="glass-panel city-ledger-card">
        <h2>City Ledger</h2>
        <div className="city-ledger-list">
          {sortedLedgerData.map((item) => (
            <CityLedgerRow
              key={item.city}
              city={item.city}
              collection={item.collection}
              yoyDelta={item.yoyDelta}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
