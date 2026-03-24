import { FraudAlert, ATMState } from '../types';

export interface ReportData {
  alerts: FraudAlert[];
  atmInfo: ATMState;
  generatedAt: string;
  dateRange: {
    from: string;
    to: string;
  };
}

// Export alerts to CSV format
export function exportToCSV(alerts: FraudAlert[], filename?: string): void {
  if (alerts.length === 0) {
    alert('No alerts to export');
    return;
  }

  // CSV Headers
  const headers = ['ID', 'Timestamp', 'ATM ID', 'Type', 'Severity', 'Confidence', 'Description', 'Sensor Evidence'];
  
  // CSV Rows
  const rows = alerts.map(alert => [
    alert.id,
    new Date(alert.timestamp).toISOString(),
    alert.atmId,
    alert.type,
    alert.severity,
    `${(alert.confidence * 100).toFixed(1)}%`,
    `"${alert.description.replace(/"/g, '""')}"`, // Escape quotes
    alert.sensorEvidence.join(', ')
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename || `atm-alerts-${formatDate(new Date())}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export to PDF using simple HTML-to-PDF approach
export function exportToPDF(data: ReportData, filename?: string): void {
  const { alerts, atmInfo, generatedAt, dateRange } = data;
  
  if (alerts.length === 0) {
    alert('No alerts to export');
    return;
  }

  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export PDF');
    return;
  }

  // Generate HTML content
  const htmlContent = generatePDFHTML(alerts, atmInfo, generatedAt, dateRange);
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Auto-trigger print dialog
  setTimeout(() => {
    printWindow.print();
  }, 500);
}

// Generate styled HTML for PDF export
function generatePDFHTML(
  alerts: FraudAlert[], 
  atmInfo: ATMState, 
  generatedAt: string,
  dateRange: { from: string; to: string }
): string {
  const severityColors: Record<string, string> = {
    high: '#FF4444',
    medium: '#F27D26',
    low: '#00A3FF',
    none: '#00FF9D'
  };

  const alertRows = alerts.map(alert => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px; font-size: 12px;">${new Date(alert.timestamp).toLocaleString()}</td>
      <td style="padding: 12px; font-size: 12px; text-transform: uppercase; font-weight: bold; color: ${severityColors[alert.severity] || '#333'};">
        ${alert.type.replace('_', ' ')}
      </td>
      <td style="padding: 12px; font-size: 12px; text-transform: uppercase;">${alert.severity}</td>
      <td style="padding: 12px; font-size: 12px;">${(alert.confidence * 100).toFixed(1)}%</td>
      <td style="padding: 12px; font-size: 12px;">${alert.sensorEvidence.join(', ') || '-'}</td>
    </tr>
  `).join('');

  const highSeverityCount = alerts.filter(a => a.severity === 'high').length;
  const mediumSeverityCount = alerts.filter(a => a.severity === 'medium').length;
  const lowSeverityCount = alerts.filter(a => a.severity === 'low').length;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>ATM Guard Security Report</title>
      <style>
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333;
          background: #fff;
          padding: 40px;
        }
        .header { 
          text-align: center; 
          border-bottom: 3px solid #00A3FF; 
          padding-bottom: 20px; 
          margin-bottom: 30px;
        }
        .header h1 { 
          color: #00A3FF; 
          font-size: 28px; 
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .header p { color: #666; font-size: 14px; }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
        }
        .info-item { display: flex; flex-direction: column; }
        .info-item label { font-size: 12px; color: #666; text-transform: uppercase; }
        .info-item value { font-size: 14px; font-weight: bold; color: #333; }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 30px;
        }
        .stat-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }
        .stat-card.danger { background: linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%); }
        .stat-card.warning { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        .stat-card.success { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
        .stat-card h3 { font-size: 32px; margin-bottom: 5px; }
        .stat-card p { font-size: 12px; text-transform: uppercase; opacity: 0.9; }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 20px;
          font-size: 13px;
        }
        th { 
          background: #00A3FF; 
          color: white; 
          padding: 12px; 
          text-align: left; 
          font-weight: 600;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.5px;
        }
        td { padding: 12px; }
        tr:nth-child(even) { background: #f8f9fa; }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>ATM Guard Security Report</h1>
        <p>Generated on ${new Date(generatedAt).toLocaleString()}</p>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <label>ATM Unit</label>
          <value>${atmInfo.name} (${atmInfo.id})</value>
        </div>
        <div class="info-item">
          <label>Location</label>
          <value>${atmInfo.location}</value>
        </div>
        <div class="info-item">
          <label>Report Period</label>
          <value>${new Date(dateRange.from).toLocaleDateString()} - ${new Date(dateRange.to).toLocaleDateString()}</value>
        </div>
        <div class="info-item">
          <label>Status</label>
          <value style="text-transform: uppercase; color: ${atmInfo.status === 'online' ? '#00FF9D' : atmInfo.status === 'alert' ? '#FF4444' : '#F27D26'};">${atmInfo.status}</value>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <h3>${alerts.length}</h3>
          <p>Total Alerts</p>
        </div>
        <div class="stat-card danger">
          <h3>${highSeverityCount}</h3>
          <p>High Severity</p>
        </div>
        <div class="stat-card warning">
          <h3>${mediumSeverityCount}</h3>
          <p>Medium Severity</p>
        </div>
        <div class="stat-card success">
          <h3>${lowSeverityCount}</h3>
          <p>Low Severity</p>
        </div>
      </div>

      <h2 style="margin-bottom: 15px; color: #333; font-size: 18px;">Alert History</h2>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Alert Type</th>
            <th>Severity</th>
            <th>Confidence</th>
            <th>Evidence</th>
          </tr>
        </thead>
        <tbody>
          ${alertRows}
        </tbody>
      </table>

      <div class="footer">
        <p>© 2026 ATM Guard Security Systems | Confidential Report</p>
        <p>This report contains sensitive security information.</p>
      </div>
    </body>
    </html>
  `;
}

// Helper function to format date for filename
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Get filtered alerts based on date range
export function filterAlertsByDateRange(
  alerts: FraudAlert[], 
  days: number = 7
): FraudAlert[] {
  const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);
  return alerts.filter(alert => alert.timestamp >= cutoffDate);
}

// Generate summary statistics
export function generateAlertStats(alerts: FraudAlert[]) {
  const total = alerts.length;
  const high = alerts.filter(a => a.severity === 'high').length;
  const medium = alerts.filter(a => a.severity === 'medium').length;
  const low = alerts.filter(a => a.severity === 'low').length;
  
  const avgConfidence = alerts.length > 0 
    ? alerts.reduce((sum, a) => sum + a.confidence, 0) / alerts.length 
    : 0;

  return {
    total,
    high,
    medium,
    low,
    avgConfidence: avgConfidence * 100
  };
}
