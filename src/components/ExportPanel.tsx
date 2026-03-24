import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, X, Calendar, Filter } from 'lucide-react';
import { FraudAlert, ATMState } from '../types';
import { exportToCSV, exportToPDF, filterAlertsByDateRange, generateAlertStats, ReportData } from '../utils/exportReports';

interface ExportPanelProps {
  alerts: FraudAlert[];
  atmInfo: ATMState;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ alerts, atmInfo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState(7); // Default 7 days
  const [isExporting, setIsExporting] = useState(false);

  const filteredAlerts = filterAlertsByDateRange(alerts, dateRange);
  const stats = generateAlertStats(filteredAlerts);

  const handleExportCSV = () => {
    setIsExporting(true);
    setTimeout(() => {
      exportToCSV(filteredAlerts, `atm-alerts-${atmInfo.id}-${dateRange}days.csv`);
      setIsExporting(false);
    }, 300);
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      const reportData: ReportData = {
        alerts: filteredAlerts,
        atmInfo,
        generatedAt: new Date().toISOString(),
        dateRange: {
          from: new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000).toISOString(),
          to: new Date().toISOString()
        }
      };
      exportToPDF(reportData, `atm-report-${atmInfo.id}-${dateRange}days.pdf`);
      setIsExporting(false);
    }, 300);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00A3FF]/10 border border-[#00A3FF]/30 text-[#00A3FF] hover:bg-[#00A3FF]/20 transition-all"
      >
        <Download className="w-4 h-4" />
        <span className="text-xs font-mono uppercase">Export Report</span>
      </button>
    );
  }

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-[#00A3FF]" />
          <h3 className="text-sm font-bold uppercase tracking-tight text-[var(--text-primary)]">Export Report</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4 text-[var(--text-secondary)]" />
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-[var(--text-secondary)]" />
          <span className="text-xs font-mono uppercase text-[var(--text-secondary)]">Date Range</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[1, 7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setDateRange(days)}
              className={`px-3 py-2 rounded-lg text-xs font-mono transition-all ${
                dateRange === days
                  ? 'bg-[#00A3FF] text-white'
                  : 'bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] hover:bg-black/10 dark:hover:bg-white/10'
              }`}
            >
              {days === 1 ? '24H' : `${days}D`}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Preview */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-[var(--text-secondary)]" />
          <span className="text-xs font-mono uppercase text-[var(--text-secondary)]">Preview ({filteredAlerts.length} alerts)</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-black/5 dark:bg-white/5 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-[var(--text-primary)]">{stats.total}</div>
            <div className="text-[10px] text-[var(--text-secondary)] uppercase">Total</div>
          </div>
          <div className="bg-[#FF4444]/10 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-[#FF4444]">{stats.high}</div>
            <div className="text-[10px] text-[#FF4444]/70 uppercase">High</div>
          </div>
          <div className="bg-[#F27D26]/10 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-[#F27D26]">{stats.medium}</div>
            <div className="text-[10px] text-[#F27D26]/70 uppercase">Medium</div>
          </div>
          <div className="bg-[#00A3FF]/10 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-[#00A3FF]">{stats.low}</div>
            <div className="text-[10px] text-[#00A3FF]/70 uppercase">Low</div>
          </div>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleExportCSV}
          disabled={isExporting || filteredAlerts.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border-color)] hover:bg-black/10 dark:hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileSpreadsheet className="w-4 h-4 text-[#00FF9D]" />
          <span className="text-xs font-mono uppercase text-[var(--text-primary)]">
            {isExporting ? 'Exporting...' : 'CSV'}
          </span>
        </button>
        <button
          onClick={handleExportPDF}
          disabled={isExporting || filteredAlerts.length === 0}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border-color)] hover:bg-black/10 dark:hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="w-4 h-4 text-[#FF4444]" />
          <span className="text-xs font-mono uppercase text-[var(--text-primary)]">
            {isExporting ? 'Exporting...' : 'PDF'}
          </span>
        </button>
      </div>

      {filteredAlerts.length === 0 && (
        <p className="mt-3 text-xs text-center text-[var(--text-secondary)]">
          No alerts found for the selected date range
        </p>
      )}
    </div>
  );
};
