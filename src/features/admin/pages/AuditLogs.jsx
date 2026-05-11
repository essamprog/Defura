import React, { useEffect, useState } from 'react';
import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import { Spinner } from '@/components/ui';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    if (loading) return <div className="flex justify-center p-8"><Spinner /></div>;
    if (error) return <div className="text-red-500 p-8 text-center">{error}</div>;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">System Audit Logs</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 border-b">
                        <tr>
                            <th className="p-4">Admin</th>
                            <th className="p-4">Action</th>
                            <th className="p-4">Target</th>
                            <th className="p-4">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="p-4 text-center text-gray-500">No logs found</td>
                            </tr>
                        ) : (
                            logs.map(log => (
                                <tr key={log.id} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-medium">{log.admin_name || 'System'}</td>
                                    <td className="p-4 text-purple-600 font-semibold">{log.action}</td>
                                    <td className="p-4 text-gray-500">
                                        {log.entity_type} (ID: {log.entity_id})
                                    </td>
                                    <td className="p-4 text-sm text-gray-400">
                                        {new Date(log.created_at).toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuditLogs;