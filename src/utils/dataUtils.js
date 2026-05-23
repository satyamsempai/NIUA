/**
 * Filter properties by tenant (city name).
 * @param {Array} data - Array of property records.
 * @param {string} city - Selected city name.
 * @returns {Array} Filtered property records.
 */
export function filterByTenant(data, city) {
  if (!data) return [];
  if (!city || city.toLowerCase() === 'all') {
    return data;
  }
  return data.filter(record => record.tenant.toLowerCase() === city.toLowerCase());
}

/**
 * Aggregate KPIs from a list of records.
 * Note: Collection INR is only summed for Approved records.
 * @param {Array} records - Array of property records.
 * @returns {Object} Key Performance Indicators.
 */
export function aggregateKPIs(records) {
  const result = {
    totalRegistered: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    collection: 0,
  };

  if (!records || records.length === 0) return result;

  result.totalRegistered = records.length;

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const status = record.status || 'Pending';

    if (status === 'Approved') {
      result.approved += 1;
      result.collection += Number(record.collection_inr) || 0;
    } else if (status === 'Rejected') {
      result.rejected += 1;
    } else if (status === 'Pending') {
      result.pending += 1;
    }
  }

  return result;
}

/**
 * Aggregate chart data for all cities (10 cities comparison).
 * Returns static pre-aggregated array regardless of filter.
 * @param {Array} allRecords - Entire dataset of properties.
 * @returns {Array} Structured array for Recharts.
 */
export function aggregateChartsData(allRecords) {
  if (!allRecords || allRecords.length === 0) return [];

  // Group by city name
  const groups = {};
  for (let i = 0; i < allRecords.length; i++) {
    const record = allRecords[i];
    const city = record.tenant;
    if (!groups[city]) {
      groups[city] = {
        city: city,
        collection: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
        total: 0,
      };
    }

    groups[city].total += 1;
    const status = record.status || 'Pending';
    if (status === 'Approved') {
      groups[city].approved += 1;
      groups[city].collection += Number(record.collection_inr) || 0;
    } else if (status === 'Rejected') {
      groups[city].rejected += 1;
    } else if (status === 'Pending') {
      groups[city].pending += 1;
    }
  }

  // Convert to array and round collection values to 2 decimal places
  return Object.values(groups).map(g => ({
    ...g,
    collection: Math.round(g.collection * 100) / 100,
  }));
}

/**
 * Generate a compact, rich text summary of the dataset to be used as system context for the AI.
 * @param {Array} allRecords - Entire dataset.
 * @returns {string} Compact text summary.
 */
export function generateAISummary(allRecords) {
  if (!allRecords || allRecords.length === 0) {
    return "No properties data available.";
  }

  const kpis = aggregateKPIs(allRecords);
  const cityData = aggregateChartsData(allRecords);

  // Find top and bottom collector cities
  let topCity = { city: 'None', collection: 0 };
  let bottomCity = { city: 'None', collection: Infinity };
  
  cityData.forEach(c => {
    if (c.collection > topCity.collection) {
      topCity = c;
    }
    if (c.collection < bottomCity.collection) {
      bottomCity = c;
    }
  });

  const citySummaryLines = cityData.map(c => {
    const appRate = c.total > 0 ? ((c.approved / c.total) * 100).toFixed(1) : '0';
    return `- ${c.city}: Registered=${c.total}, Approved=${c.approved} (${appRate}%), Rejected=${c.rejected}, Pending=${c.pending}, Collection=₹${c.collection.toLocaleString('en-IN')}`;
  }).join('\n');

  return `System Context (Facts & Statistics):
The following data is extracted from the official Property Tax Register:
- Overall Total Registered Properties: ${kpis.totalRegistered}
- Overall Approved Properties: ${kpis.approved}
- Overall Rejected Properties: ${kpis.rejected}
- Overall Pending Properties: ${kpis.pending}
- Overall Total Tax Collection: ₹${kpis.collection.toLocaleString('en-IN')} (Summed only from Approved properties)
- Top Collector City: ${topCity.city} with a collection of ₹${topCity.collection.toLocaleString('en-IN')}
- Bottom Collector City: ${bottomCity.city} with a collection of ₹${bottomCity.collection.toLocaleString('en-IN')}

City-by-City breakdown:
${citySummaryLines}

Instructions for the assistant:
1. Answer the user's questions based ONLY on the provided system context facts and figures above.
2. If the user asks about a specific city, property type, or overall trend, check these facts first.
3. Keep your answers concise, precise, professional, and friendly. Reference the numbers directly to support your answers.
4. If a fact cannot be determined from the statistics above (e.g. detailed owner names or specific wards), politely inform the user that it is not available in the summary dataset.
`;
}
