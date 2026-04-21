import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);
ChartJS.defaults.color = '#9BA1A6';
ChartJS.defaults.font.family = "'Inter', sans-serif";

export default function Dashboard({ history, setHistory, onAutoFill }) {
  const fakeCount = history.filter(h => h.verdict === 'FAKE').length;
  const realCount = history.filter(h => h.verdict === 'REAL').length;

  const deleteItem = (id) => {
    setHistory(history.filter(h => h.id !== id));
  };

  const doughnutData = {
    labels: ['Fake News', 'Real News'],
    datasets: [{
      data: [fakeCount || 0.01, realCount || 0.01],
      backgroundColor: ['#EF4444', '#10B981'],
      borderWidth: 0
    }]
  };

  const recentHistory = [...history].slice(0, 10).reverse();
  const lineData = {
    labels: recentHistory.map((_, i) => `#${i + 1}`),
    datasets: [{
      label: 'Confidence Trend (%)',
      data: recentHistory.map(h => h.confidence),
      borderColor: '#6366F1',
      tension: 0.4,
      fill: true,
      backgroundColor: 'rgba(99, 102, 241, 0.1)'
    }]
  };

  return (
    <section className="view active">
      <header className="view-header">
          <h1>Results Dashboard</h1>
          <p>Track history of analyzed articles and overall fake news trends.</p>
      </header>

      <div className="dashboard-stats glass-panel">
          <div className="stat-box">
              <h4>Total Analyzed</h4>
              <span>{history.length}</span>
          </div>
          <div className="stat-box">
              <h4>Fake News Detected</h4>
              <span className="text-danger">{fakeCount}</span>
          </div>
          <div className="stat-box">
              <h4>Real News Verified</h4>
              <span className="text-success">{realCount}</span>
          </div>
      </div>

      <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>Verdict Ratio</h3>
              <div style={{ height: '250px' }}>
                <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
              </div>
          </div>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>Confidence Trends</h3>
              <div style={{ height: '250px' }}>
                <Line data={lineData} options={{ maintainAspectRatio: false, scales: { y: { min: 0, max: 100 } }, plugins: { legend: { display: false } } }} />
              </div>
          </div>
      </div>

      <div className="table-container glass-panel">
          <table>
              <thead>
                  <tr>
                      <th>Date</th>
                      <th>Article Context</th>
                      <th>Source</th>
                      <th>Verdict</th>
                      <th>Confidence</th>
                      <th>Action</th>
                  </tr>
              </thead>
              <tbody>
                {history.map(item => (
                  <tr key={item.id}>
                    <td>{item.date}</td>
                    <td>{item.context}</td>
                    <td>{item.source}</td>
                    <td><span className={`badge ${item.verdict.toLowerCase()}`}>{item.verdict}</span></td>
                    <td>{item.confidence}%</td>
                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="pill unknown" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }} onClick={() => onAutoFill(item.context, item.source)}>ENGAGE</button>
                      <button className="delete-btn" onClick={() => deleteItem(item.id)}><i className="ri-delete-bin-line"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
          </table>
      </div>
    </section>
  );
}
