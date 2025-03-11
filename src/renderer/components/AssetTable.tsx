import React from 'react';
import { Asset } from '../../services/assetService';

interface AssetTableProps {
    assets: Asset[];
}

const TableHeaderClasses = "px-6 py-3 bg-gray-400 text-left text-md font-bold text-black uppercase tracking-wider";
const TableCellClasses = "px-2 py-1 whitespace-nowrap";

const AssetTable: React.FC<AssetTableProps> = ({ assets }) => {
    return (
        <div className="overflow-x-auto rounded-lg border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700">
                <thead>
                    <tr>
                        <th scope="col" className={TableHeaderClasses}>
                            Name
                        </th>
                        <th scope="col" className={TableHeaderClasses}>
                            Type
                        </th>
                        <th scope="col" className={TableHeaderClasses}>
                            Asset Pack
                        </th>
                        <th scope="col" className={TableHeaderClasses}>
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
                            <tr key={index} className="hover:bg-gray-500">
                                <td className={TableCellClasses}>{asset.name}</td>
                                <td className={TableCellClasses}>{asset.type}</td>
                                <td className={TableCellClasses}>{asset.assetPack}</td>
                                <td className={TableCellClasses}>
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
