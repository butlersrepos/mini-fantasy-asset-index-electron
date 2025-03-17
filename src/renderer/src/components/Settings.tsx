import React, { useState, useEffect } from 'react';
import { CacheInfo } from 'src/types';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onRefetch: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, onRefetch }) => {
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCacheInfo();
    }
  }, [isOpen]);

  const loadCacheInfo = async () => {
    try {
      const info = await window.electronAPI.getCacheInfo();
      setCacheInfo(info);
    } catch (error) {
      console.error('Failed to get cache info:', error);
    }
  };

  const handleDeleteClick = () => {
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsLoading(true);
      await window.electronAPI.deleteCacheAndRefetch();
      setIsConfirmDialogOpen(false);
      onRefetch();
      onClose();
    } catch (error) {
      console.error('Failed to delete cache:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmDialogOpen(false);
  };

  const handleOpenCacheDirectory = async () => {
    try {
      await window.electronAPI.openCacheDirectory();
    } catch (error) {
      console.error('Failed to open cache directory:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-gray-800 shadow-lg p-6 transition-transform transform"
      style={{ zIndex: 50 }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-app-light">Settings</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-app-light mb-2">Cache Information</h3>
          {cacheInfo ? (
            <div className="bg-gray-700 rounded p-4">
              {cacheInfo.exists ? (
                <>
                  <p className="text-gray-300 mb-1">Last Updated:</p>
                  <p className="text-white mb-3">
                    {new Date(cacheInfo.timestamp!).toLocaleString()}
                  </p>
                  <p className="text-gray-300 mb-1">Assets Cached:</p>
                  <p className="text-white">{cacheInfo.assetCount}</p>
                </>
              ) : (
                <p className="text-gray-300">No cache found</p>
              )}
            </div>
          ) : (
            <div className="animate-pulse h-20 bg-gray-700 rounded"></div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleOpenCacheDirectory}
            disabled={isLoading || !cacheInfo?.exists}
            className="flex items-center justify-center space-x-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span>Open Cached Data</span>
          </button>

          <button
            onClick={handleDeleteClick}
            disabled={isLoading || !cacheInfo?.exists}
            className="flex items-center justify-center space-x-2 w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Delete Cache &amp; Refresh</span>
          </button>
        </div>
      </div>

      {isConfirmDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium text-app-light mb-4">Confirm Delete Cache</h3>
            <p className="text-gray-300 mb-6">
              This will delete the cached asset data and download the latest data from the server. Are you sure you want to continue?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancelDelete}
                className="text-gray-300 hover:text-white"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors flex items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Delete & Refresh'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
