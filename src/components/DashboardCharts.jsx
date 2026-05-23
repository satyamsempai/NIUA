import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

/**
 * Custom tooltip for the Collection Bar Chart.
 */
function CollectionTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <div className="recharts-custom-tooltip">
        <p className="label">{label}</p>
        <div className="value-row">
          <span className="value-label">Tax Collection:</span>
          <span className="value-num" style={{ color: 'var(--accent-amber)' }}>
            ₹ {Math.round(value).toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    );
  }
  return null;
}

/**
 * Custom tooltip for the Status Distribution Grouped Chart.
 */
function StatusTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="recharts-custom-tooltip">
        <p className="label">{label}</p>
        {payload.map((entry, index) => (
          <div className="value-row" key={index}>
            <span className="value-label" style={{ textTransform: 'capitalize' }}>
              {entry.name}:
            </span>
            <span className="value-num" style={{ color: entry.fill }}>
              {entry.value.toLocaleString('en-IN')}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

/**
 * Renders the two pre-aggregated comparative charts.
 * @param {Object} props
 * @param {Array} props.chartsData - Aggregated data for all cities.
 */
export default function DashboardCharts({ chartsData }) {
  // Format Y-axis values for collection chart
  const formatYAxisINR = (tick) => {
    if (tick >= 10000000) {
      return `₹${(tick / 10000000).toFixed(1)}Cr`;
    }
    if (tick >= 100000) {
      return `₹${(tick / 100000).toFixed(1)}L`;
    }
    if (tick >= 1000) {
      return `₹${(tick / 1000).toFixed(0)}k`;
    }
    return `₹${tick}`;
  };

  return (
    <div className="charts-grid">
      {/* Chart 1: Total collection per city */}
      <div className="chart-card">
        <h2>Total Tax Collection per City</h2>
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartsData}
              margin={{ top: 10, right: 10, left: 15, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis
                dataKey="city"
                stroke="var(--text-secondary)"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: 'var(--border-color)' }}
                dy={10}
              />
              <YAxis
                stroke="var(--text-secondary)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatYAxisINR}
              />
              <Tooltip content={<CollectionTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
              <Bar dataKey="collection" fill="var(--accent-amber)" radius={[4, 4, 0, 0]} maxBarSize={45} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Grouped bar chart Approved/Rejected/Pending */}
      <div className="chart-card">
        <h2>Property Registration Status per City</h2>
        <div style={{ width: '100%', height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartsData}
              margin={{ top: 10, right: 10, left: 5, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis
                dataKey="city"
                stroke="var(--text-secondary)"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: 'var(--border-color)' }}
                dy={10}
              />
              <YAxis
                stroke="var(--text-secondary)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(tick) => tick.toLocaleString('en-IN')}
              />
              <Tooltip content={<StatusTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{
                  fontSize: '12px',
                  fontFamily: 'var(--font-body)',
                  color: 'var(--text-secondary)',
                }}
              />
              <Bar name="Approved" dataKey="approved" fill="var(--accent-emerald)" radius={[3, 3, 0, 0]} maxBarSize={15} />
              <Bar name="Rejected" dataKey="rejected" fill="var(--accent-rose)" radius={[3, 3, 0, 0]} maxBarSize={15} />
              <Bar name="Pending" dataKey="pending" fill="var(--accent-cyan)" radius={[3, 3, 0, 0]} maxBarSize={15} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
