import React from 'react';
import type { Asset } from '../../types';
import Pagination from './Pagination';

interface AssetTableProps {
    assets: Asset[];
    currentPage: number;
    setCurrentPage: (page: number) => void;
    itemsPerPage: number;
    setItemsPerPage: (itemsPerPage: number) => void;
}

const TableHeaderClasses = "px-6 py-3 bg-gray-400 text-left text-md font-bold text-black uppercase tracking-wider";
const TableCellClasses = "px-2 py-1 whitespace-nowrap";

const AssetTable: React.FC<AssetTableProps> = ({
    assets,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage
}) => {
    // Calculate pagination
    const totalItems = assets.length;
    const totalPages = itemsPerPage === 0 ? 1 : Math.ceil(totalItems / itemsPerPage);

    // Ensure current page is valid
    const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
    if (validCurrentPage !== currentPage) {
        setCurrentPage(validCurrentPage);
    }

    // Get current items
    const currentItems = itemsPerPage === 0
        ? assets
        : assets.slice(
            (validCurrentPage - 1) * itemsPerPage,
            validCurrentPage * itemsPerPage
        );

    return (
        <div>
            <Pagination
                currentPage={validCurrentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                setCurrentPage={setCurrentPage}
                setItemsPerPage={setItemsPerPage}
                totalItems={totalItems}
            />
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
                        {currentItems.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-center text-gray-400">
                                    No assets found matching the current filters
                                </td>
                            </tr>
                        ) : (
                            currentItems.map((asset, index) => {
                                // Format tags for tooltip
                                const tagsTooltip = asset.tags?.length > 0
                                    ? `Tags: ${asset.tags.join(', ')}`
                                    : 'No tags';

                                return (
                                    <tr
                                        key={index}
                                        className={`hover:bg-gray-500${index % 2 === 0 ? '' : ' bg-gray-800'}`}
                                        title={tagsTooltip}
                                        style={{ cursor: 'help' }}
                                    >
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
                                                    Open
                                                </a>
                                            ) : (
                                                <span className="text-gray-500">N/A</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AssetTable;
