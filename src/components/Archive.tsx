import React, { useState, useMemo } from 'react';
import { X, Search, Calendar, Filter, Download, ShieldAlert, ShieldCheck, AlertTriangle, Clock } from 'lucide-react';
import { FraudAlert } from '../types';
import { exportToCSV } from '../utils/exportReports';

interface ArchiveProps {
  alerts: FraudAlert[];
  onClose: () => void;
}

export const Archive: React.FC<ArchiveProps> = ({ alerts, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'skimming' | 'trapping' | 'forced_transaction' | 'tampering'>('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        alert.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.atmId.toLowerCase().includes(searchQuery.toLowerCase());

      // Severity filter
      const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;

      // Type filter
      const matchesType = typeFilter === 'all' || alert.type === typeFilter;

      // Date range filter
      let matchesDate = true;
      const alertDate = new Date(alert.timestamp);
      const now = new Date();
      if (dateRange === 'today') {
        matchesDate = alertDate.toDateString() === now.toDateString();
      } else if (dateRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = alertDate >= weekAgo;
      } else if (dateRange === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = alertDate >= monthAgo;
      }

      return matchesSearch && matchesSeverity && matchesType && matchesDate;
    });
  }, [alerts, searchQuery, severityFilter, typeFilter, dateRange]);

  const handleExport = () => {
    exportToCSV(filteredAlerts, `archive-export-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <ShieldAlert className="w-5 h-5 text-[#FF4444]" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-[#F27D26]" />;
      case 'low':
        return <ShieldCheck className="w-5 h-5 text-[#00A3FF]" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-[#00FF9D]" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-[#FF4444]/10 border-[#FF4444]/30 text-[#FF4444]';
      case 'medium':
        return 'bg-[#F27D26]/10 border-[#F27D26]/30 text-[#F27D26]';
      case 'low':
        return 'bg-[#00A3FF]/10 border-[#00A3FF]/30 text-[#00A3FF]';
      default:
        return 'bg-[#00FF9D]/10 border-[#00FF9D]/30 text-[#00FF9D]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-6xl max-h-[90vh] bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00A3FF]/10 rounded-lg">
              <Clock className="w-5 h-5 text-[#00A3FF]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Alert Archive</h2>
              <p className="text-xs text-[var(--text-secondary)]">{filteredAlerts.length} alerts found</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={filteredAlerts.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00FF9D]/10 text-[#00FF9D] hover:bg-[#00FF9D]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-mono uppercase">Export</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-[var(--border-color)] space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search alerts by type, description, or ATM ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-black/5 dark:bg-white/5 border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[#00A3FF]"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {/* Severity Filter */}
            <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-lg p-1">
              <Filter className="w-3 h-3 text-[var(--text-secondary)] ml-2" />
              {(['all', 'high', 'medium', 'low'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase transition-all ${
                    severityFilter === sev
                      ? 'bg-[#00A3FF] text-white'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-lg p-1">
              <Calendar className="w-3 h-3 text-[var(--text-secondary)] ml-2" />
              {(['all', 'skimming', 'trapping', 'forced_transaction', 'tampering'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase transition-all ${
                    typeFilter === type
                      ? 'bg-[#00A3FF] text-white'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {type === 'all' ? 'All Types' : type.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-1 bg-black/5 dark:bg-white/5 rounded-lg p-1">
              {(['all', 'today', 'week', 'month'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase transition-all ${
                    dateRange === range
                      ? 'bg-[#00A3FF] text-white'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {range === 'all' ? 'All Time' : range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Alert List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShieldCheck className="w-12 h-12 text-[var(--text-secondary)] mb-4" />
              <p className="text-[var(--text-primary)] font-medium">No alerts found</p>
              <p className="text-sm text-[var(--text-secondary)]">Try adjusting your filters</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border ${getSeverityColor(alert.severity)} transition-all hover:opacity-80`}
              >
                <div className="flex items-start gap-3">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                      <h3 className="font-bold text-sm uppercase">
                        {alert.type.replace('_', ' ')}
                      </h3>
                      <span className="text-xs opacity-70">
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm opacity-90 mb-2">{alert.description}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2 py-1 bg-black/20 rounded font-mono">
                        {alert.atmId}
                      </span>
                      <span className="px-2 py-1 bg-black/20 rounded font-mono">
                        {(alert.confidence * 100).toFixed(1)}% confidence
                      </span>
                      {alert.sensorEvidence.map((sensor) => (
                        <span
                          key={sensor}
                          className="px-2 py-1 bg-black/20 rounded font-mono uppercase"
                        >
                          {sensor}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
