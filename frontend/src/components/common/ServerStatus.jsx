import React, { useEffect, useState } from 'react';
import { useApp } from '../../contexts/AppContext';

const ServerStatus = () => {
    const { serverStatus, loading } = useApp();
    const [isVisible, setIsVisible] = useState(true);

    if (loading && !serverStatus) return null;

    const isConnected = serverStatus?.server === 'running' && serverStatus?.database === 'connected';

    return (
        <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <div className={`
                flex items-center gap-3 px-4 py-2 rounded-full border backdrop-blur-md shadow-lg
                ${isConnected
                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'}
            `}>
                <div className="relative flex h-3 w-3">
                    {isConnected && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    )}
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                </div>
                <div className="flex flex-col text-xs font-medium">
                    <span>Server: {serverStatus?.server || 'Down'}</span>
                    <span>Database: {serverStatus?.database || 'Unknown'}</span>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors"
                    title="Hide Status"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ServerStatus;
