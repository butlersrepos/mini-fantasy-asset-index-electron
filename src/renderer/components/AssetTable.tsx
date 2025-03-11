import React from 'react';
import { Asset } from '../../services/assetService';

interface AssetTableProps {
  assets: Asset[];
}

const AssetTable: React.FC<AssetTableProps> = ({ assets }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Asset Pack
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Link
            </th>
          </tr>
        </thead>
        <tbody className="bg-gray-900 divide-y divide-gray-700">
          {assets.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-center text-gray-400">
                No assets found matching the current filters
              </td>
            </tr>
          ) : (
            assets.map((asset, index) => (
              <tr key={index} className="hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap">{asset.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{asset.type}</td>
                <td className="px-6 py-4 whitespace-nowrap">{asset.assetPack}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {asset.link && asset.link !== '#' ? (
                    <a 
                      href={asset.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-gray-500">N/A</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AssetTable;
