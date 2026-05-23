# Property Tax Analytics Dashboard | NIUA

A modern, high-fidelity Property Tax Collection Dashboard built with **React and Vite**. This dashboard aggregates register data from 10 major Indian cities, presents visual KPI cards formatted in Indian Rupees (INR), visualizes pre-aggregated data metrics via Recharts, and features a persistent context-aware AI tax assistant powered by the Gemini 3.5 Flash API.

## Features

1. **Phase 1: Project Setup & Data Wiring**
   - Built using React & Vite for lightning-fast performance and HMR.
   - Wired to a local `properties.json` register file containing detailed tax and property records.
   - Pure, optimized calculation utilities driven by `useMemo` hooks to avoid redundant computations on state changes.
   - Startup console log statement validating the format of properties.

2. **Phase 2: KPI Metrics & City-Level Filter**
   - Dynamic city-level filtering using a controlled dropdown component.
   - Calculates **Total Registered**, **Approved**, **Rejected**, and **Total Collection (₹)**.
   - Strictly sums the collection values ONLY from approved property records.
   - Formatted in Indian numbering system (e.g. lakhs/crores) using `toLocaleString('en-IN')`.
   - Distinct, custom-themed card styles using Montserrat and Outfit typography.

3. **Phase 3: Pre-aggregated Visualizations (Recharts)**
   - Pre-aggregated comparative data showing all 10 cities regardless of the active tenant filter.
   - **Chart 1 (Bar)**: Total Tax Collection per City.
   - **Chart 2 (Grouped Bar)**: Property Registration Status (Approved vs. Rejected vs. Pending) distribution.
   - Interactive custom tooltips formatted with Indian Rupee (₹) and integer count labels.
   - Entirely wrapped in `<ResponsiveContainer>` blocks for clean, fluid responsiveness.

4. **Phase 4: Context-Aware AI Assistant**
   - Integrated floating chat panel connected to Gemini 3.5 Flash.
   - Pre-compiles a statistical summary of the entire dataset (overall aggregates, city collections, rates, top/bottom performers) and pre-injects it as system context.
   - Prevents AI hallucinations by forcing the model to answer user questions using only the provided facts.
   - Validates the environment variable and warns developers dynamically in-app if it is not configured.

---

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18+) installed.

### Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root folder of the project to configure your Gemini API Key:
   ```env
   VITE_GEMINI_KEY=your_actual_gemini_api_key
   ```
   *Note: Obtain a free API key from [Google AI Studio](https://aistudio.google.com/).*

### Running Locally

To run the development server:
```bash
npm run dev
```

### Production Build

To verify and compile the production bundle:
```bash
npm run build
npm run preview
```

---

## Project Structure

```
├── .env                  # Local API keys (ignored by Git)
├── .gitignore            # Git exclusion patterns
├── index.html            # Entry HTML and Google Fonts loader
├── package.json          # Dependency configurations
├── src/
│   ├── App.jsx           # Main App orchestrator and dashboard layout
│   ├── index.css         # Custom dark soothing palette style sheets
│   ├── main.jsx          # DOM entry point
│   ├── properties.json   # Local register dataset
│   ├── components/
│   │   ├── KPICards.jsx        # Stat rendering components
│   │   ├── DashboardCharts.jsx # Recharts charts
│   │   └── AIChat.jsx          # Conversational side pane
│   └── utils/
│       └── dataUtils.js  # Pure aggregation and AI prompt generation logic
```

## Styling System

The application uses a **custom-designed dark soothing color palette** rather than generic background gradients:
- **Background Main**: `#090d16` (Deep charcoal navy)
- **Cards & Sidebar**: `#161e30` & `#111726` (Clean blue-slate panels)
- **Borders**: `#24304f` (Soft slate borders with `#33446c` interactive hover highlights)
- **Typography**: 
  - **Headings**: `Montserrat` (Bold, clean, professional)
  - **Body text & Metrics**: `Outfit` (Modern, readable geometric sans-serif)
