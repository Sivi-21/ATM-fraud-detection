import React, { useState, useMemo } from 'react';
import { X, FileText, Download, Search, Calendar, User, Shield } from 'lucide-react';
import { useAuth, AuditLogEntry } from '../contexts/AuthContext';

interface AuditLogsProps {
  onClose: () => void;
}

export const AuditLogs: React.FC<AuditLogsProps> = ({ onClose }) => {
  const { auditLogs, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        log.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase());

      // Action filter
      const matchesAction = actionFilter === 'all' || log.action === actionFilter;

      // Date range filter
      let matchesDate = true;
      const logDate = new Date(log.timestamp);
      const now = new Date();
      if (dateRange === 'today') {
        matchesDate = logDate.toDateString() === now.toDateString();
      } else if (dateRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = logDate >= weekAgo;
      } else if (dateRange === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = logDate >= monthAgo;
      }

      return matchesSearch && matchesAction && matchesDate;
    });
  }, [auditLogs, searchQuery, actionFilter, dateRange]);

  const uniqueActions = useMemo(() => {
    const actions = new Set(auditLogs.map(log => log.action));
    return Array.from(actions).sort();
  }, [auditLogs]);

  const handleExport = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Details', 'IP Address'].join(','),
      ...filteredLogs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.username,
        log.action,
        `"${log.details.replace(/"/g, '""')}"`,
        log.ipAddress
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return 'bg-[#00FF9D]/10 text-[#00FF9D]';
      case 'LOGOUT':
        return 'bg-[var(--text-secondary)]/10 text-[var(--text-secondary)]';
      case 'ATM_LOCK':
      case 'ATM_UNLOCK':
        return 'bg-[#FF4444]/10 text-[#FF4444]';
      case 'EXPORT_REPORT':
        return 'bg-[#00A3FF]/10 text-[#00A3FF]';
      default:
        return 'bg-black/5 dark:bg-white/5 text-[var(--text-primary)]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-5xl max-h-[90vh] bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00A3FF]/10 rounded-lg">
              <FileText className="w-5 h-5 text-[#00A3FF]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Audit Logs</h2>
              <p className="text-xs text-[var(--text-secondary)]">{filteredLogs.length} entries</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={filteredLogs.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00FF9D]/10 text-[#00FF9D] hover:bg-[#00FF9D]/20 transition-all disabled:opacity-50"
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-black/5 dark:bg-white/5 border border-[var(--border-color)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[#00A3FF]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Action Filter */}
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 bg-black/5 dark:bg-white/5 border border-[var(--border-color)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#00A3FF]"
            >
              <option value="all">All Actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>

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

        {/* Logs Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="bg-black/5 dark:bg-white/5 sticky top-0">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase text-[var(--text-secondary)]">Time</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase text-[var(--text-secondary)]">User</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase text-[var(--text-secondary)]">Action</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase text-[var(--text-secondary)]">Details</th>
                <th className="text-left px-4 py-3 text-xs font-mono uppercase text-[var(--text-secondary)] hidden sm:table-cell">IP</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-[var(--text-secondary)]">
                    <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No audit logs found</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-[var(--border-color)] hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[var(--text-secondary)]" />
                        <span className="text-sm text-[var(--text-primary)]">{log.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-mono uppercase ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-primary)] max-w-xs truncate">
                      {log.details}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)] hidden sm:table-cell font-mono">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
