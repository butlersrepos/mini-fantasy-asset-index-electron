import React from 'react';
import { Asset } from '../../services/assetService';

interface AssetTableProps {
  assets: Asset[];
}

const AssetTable: React.FC<AssetTableProps> = ({ assets }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Asset Pack</th>
          <th>Link</th>
        </tr>
      </thead>
      <tbody>
        {assets.length === 0 ? (
          <tr>
            <td colSpan={4} style={{ textAlign: 'center' }}>
              No assets found matching the current filters
            </td>
          </tr>
        ) : (
          assets.map((asset, index) => (
            <tr key={index}>
              <td>{asset.name}</td>
              <td>{asset.type}</td>
              <td>{asset.assetPack}</td>
              <td>
                {asset.link && asset.link !== '#' ? (
                  <a href={asset.link} target="_blank" rel="noopener noreferrer">
                    View
                  </a>
                ) : (
                  'N/A'
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default AssetTable;
