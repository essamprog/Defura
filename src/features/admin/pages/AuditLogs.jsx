import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { Spinner, Modal, Button } from '@/components/ui';

// Utility to parse polymorphic Target Entity (entity_type & entity_id)
const renderTargetEntity = (log) => {
    if (!log) return <span className="text-gray-400 text-xs">—</span>;
    const type = log.entity_type ? log.entity_type.charAt(0).toUpperCase() + log.entity_type.slice(1) : 'Entity';
    const id = log.entity_id || 'Unknown';
    return (
        <span className="font-semibold text-gray-800 text-sm">
            {type} #{id}
        </span>
    );
};

// Utility to format raw snake_case actions to user-friendly titles
const formatAction = (action) => {
    if (!action) return '—';
    const actionMap = {
        'APPROVE_COURSE':      'Course Approved',
        'REJECT_COURSE':       'Course Rejected',
        'CREATE_COURSE':       'Course Created',
        'UPDATE_COURSE':       'Course Updated',
        'DELETE_COURSE':       'Course Deleted',
        'REFUND_ORDER':        'Order Refunded',
        'CANCEL_REFUND':       'Refund Cancelled',
        'USER_LOGIN':          'User Logged In',
        'USER_LOGOUT':         'User Logged Out',
        'CREATE_USER':         'User Created',
        'UPDATE_USER':         'User Updated',
        'DELETE_USER':         'User Deleted',
        'WITHDRAWAL_REQUEST':  'Withdrawal Requested',
        'WITHDRAWAL_APPROVED': 'Withdrawal Approved',
        'WITHDRAWAL_REJECTED': 'Withdrawal Rejected',
        'WITHDRAWAL_PAID':     'Withdrawal Paid',
    };
    
    if (actionMap[action]) return actionMap[action];
    
    // Fallback: convert SNAKE_CASE to Title Case
    return action
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

// Utility to get beautiful badge colors based on action type
const getActionBadgeColor = (action) => {
    if (!action) return 'bg-gray-50 text-gray-700 border-gray-100';
    if (action.includes('APPROVE') || action.includes('CREATE') || action.includes('SUCCESS') || action === 'CANCEL_REFUND') {
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }
    if (action.includes('REJECT') || action.includes('DELETE') || action.includes('FAIL') || action === 'REFUND_ORDER') {
        return 'bg-rose-50 text-rose-700 border-rose-100';
    }
    if (action.includes('UPDATE')) {
        return 'bg-blue-50 text-blue-700 border-blue-100';
    }
    if (action.includes('WITHDRAWAL')) {
        return 'bg-amber-50 text-amber-700 border-amber-100';
    }
    return 'bg-gray-50 text-gray-700 border-gray-100';
};

// Safely parse JSON or object details payload
const parseDetails = (details) => {
    if (!details) return null;
    if (typeof details === 'object') return details;
    try {
        return JSON.parse(details);
    } catch (e) {
        console.error("Failed to parse details JSON:", e);
        return null;
    }
};

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Modal states
    const [selectedLog, setSelectedLog] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await api.get(ENDPOINTS.ADMIN.AUDIT_LOGS);
                setLogs(response.data?.data || response.data || []);
            } catch (err) {
                console.error("Failed to fetch audit logs:", err);
                setError("Failed to load audit logs");
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    const renderDetailsObject = (detailsObj) => {
        const parsed = parseDetails(detailsObj);
        if (!parsed || Object.keys(parsed).length === 0) {
            return <p className="text-gray-500 text-sm italic">No detailed payload available for this action.</p>;
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-gray-100 rounded-xl p-4 bg-gray-50/50 max-h-[40vh] overflow-y-auto">
                {Object.entries(parsed).map(([key, val]) => {
                    // Format the key (e.g., "course_title" -> "Course Title")
                    const readableKey = key
                        .split('_')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');

                    let displayVal = '';
                    if (val === null || val === undefined) {
                        displayVal = <span className="text-gray-400 italic">None</span>;
                    } else if (typeof val === 'object') {
                        displayVal = (
                            <pre className="text-xs bg-gray-100 p-2 rounded-lg font-mono text-gray-700 overflow-x-auto max-w-full">
                                {JSON.stringify(val, null, 2)}
                            </pre>
                        );
                    } else {
                        displayVal = <span className="text-gray-800 font-medium break-all">{String(val)}</span>;
                    }

                    return (
                        <div key={key} className="space-y-1 border-b border-gray-100/50 pb-2 last:border-b-0">
                            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">{readableKey}</span>
                            <div className="text-sm">{displayVal}</div>
                        </div>
                    );
                })}
            </div>
        );
    };

    if (loading) return <div className="flex justify-center p-8"><Spinner /></div>;
    if (error) return <div className="text-red-500 p-8 text-center">{error}</div>;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">System Audit Logs</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
                            <tr>
                                <th className="p-4 font-semibold text-sm">Admin Name</th>
                                <th className="p-4 font-semibold text-sm">Action</th>
                                <th className="p-4 font-semibold text-sm">Target Entity</th>
                                <th className="p-4 font-semibold text-sm">Date</th>
                                <th className="p-4 font-semibold text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">No logs found</td>
                                </tr>
                            ) : (
                                logs.map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 font-medium text-sm text-gray-800">{log.admin_name || 'System'}</td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getActionBadgeColor(log.action)}`}>
                                                {formatAction(log.action)}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {renderTargetEntity(log)}
                                        </td>
                                        <td className="p-4 text-xs text-gray-400 font-medium">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedLog(log);
                                                    setIsModalOpen(true);
                                                }}
                                            >
                                                View Details
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Details Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="System Audit Log Details"
                size="lg"
                footer={
                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                        Close
                    </Button>
                }
            >
                {selectedLog && (
                    <div className="space-y-6">
                        {/* Log Meta Info */}
                        <div className="grid grid-cols-2 gap-y-4 gap-x-6 border-b border-gray-100 pb-4">
                            <div>
                                <span className="text-xs text-gray-400 block mb-0.5">Admin Name</span>
                                <span className="text-sm font-semibold text-gray-800">{selectedLog.admin_name || 'System'}</span>
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 block mb-0.5">Action Performed</span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getActionBadgeColor(selectedLog.action)}`}>
                                    {formatAction(selectedLog.action)}
                                </span>
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 block mb-0.5">Target Entity</span>
                                {renderTargetEntity(selectedLog)}
                            </div>
                            <div>
                                <span className="text-xs text-gray-400 block mb-0.5">Date & Time</span>
                                <span className="text-sm text-gray-600 font-medium">
                                    {new Date(selectedLog.created_at).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Dynamic Details Payload Parsing */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase">Detailed Payload</h3>
                            {renderDetailsObject(selectedLog.details)}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AuditLogs;