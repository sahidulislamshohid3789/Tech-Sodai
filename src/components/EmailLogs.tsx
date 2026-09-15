import React, { useState } from 'react';
import { EmailLog } from '../types';
import { Mail, CheckCircle, XCircle, Search, RefreshCw, Send } from 'lucide-react';

interface EmailLogsProps {
  emailLogs: EmailLog[];
  onRefresh: () => void;
  onTestEmail: () => void;
  testingEmail: boolean;
}

export const EmailLogs: React.FC<EmailLogsProps> = ({ emailLogs, onRefresh, onTestEmail, testingEmail }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);

  const filteredLogs = emailLogs.filter(
    (log) =>
      log.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Email Notification Audit Logs</h2>
          <p className="text-sm text-slate-600">
            Monitor instant email alerts dispatched to <strong className="text-slate-900">sahidulislamshohid3789@gmail.com</strong> for every new order.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onTestEmail}
            disabled={testingEmail}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl transition shadow-sm disabled:opacity-50 cursor-pointer text-xs"
          >
            {testingEmail ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Send Test Alert Now</span>
          </button>
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3.5 py-2.5 rounded-xl transition text-xs cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search email subject, recipient, details..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500">Total Logs: {emailLogs.length}</span>
      </div>

      {/* Logs Table */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">No email logs recorded yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            When new orders are placed or test alerts are triggered, email logs will appear here instantly for verification.
          </p>
          <button
            onClick={onTestEmail}
            disabled={testingEmail}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition shadow-sm cursor-pointer text-sm"
          >
            <Send className="w-4 h-4" />
            <span>Trigger Test Email Alert</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Recipient</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-4">
                      {log.success ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
                          <CheckCircle className="w-3.5 h-3.5" /> Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 text-xs font-semibold bg-rose-50 px-2.5 py-1 rounded-full">
                          <XCircle className="w-3.5 h-3.5" /> Failed
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-900">{log.recipient}</td>
                    <td className="py-4 px-4 font-semibold text-slate-800">{log.subject}</td>
                    <td className="py-4 px-4 text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        View Content
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Email Alert Log Details</h3>
                <p className="text-xs text-slate-500">{new Date(selectedLog.timestamp).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 block">Recipient</span>
                  <span className="text-sm font-bold text-slate-900">{selectedLog.recipient}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-xs font-semibold text-slate-500 block">Delivery Details</span>
                  <span className="text-xs font-mono font-medium text-emerald-700">{selectedLog.details}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">Subject</span>
                <p className="text-sm font-semibold text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-200">{selectedLog.subject}</p>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1">Email HTML Content Preview</span>
                <div
                  className="bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-96 overflow-y-auto text-xs"
                  dangerouslySetInnerHTML={{ __html: selectedLog.body }}
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
