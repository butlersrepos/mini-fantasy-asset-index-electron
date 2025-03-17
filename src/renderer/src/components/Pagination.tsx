import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
    setCurrentPage: (page: number) => void;
    setItemsPerPage: (itemsPerPage: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems,
    setCurrentPage,
    setItemsPerPage
}) => {
    // No pagination needed if there are no items or showing all items
    if (totalItems === 0 || (totalPages === 1 && itemsPerPage !== 0)) {
        return null;
    }

    const itemsPerPageOptions = [
        { value: 10, label: '10' },
        { value: 20, label: '20' },
        { value: 50, label: '50' },
        { value: 0, label: 'All' }
    ];

    // Calculate range of items being displayed
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = itemsPerPage === 0 ? totalItems : Math.min(startItem + itemsPerPage - 1, totalItems);

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            // Show all pages if total pages is small
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Always include first page
            pageNumbers.push(1);

            // Calculate start and end of middle section
            let startPage = Math.max(2, currentPage - 1);
            let endPage = Math.min(totalPages - 1, currentPage + 1);

            // Adjust to always show 3 pages in middle if possible
            if (startPage === 2) endPage = Math.min(4, totalPages - 1);
            if (endPage === totalPages - 1) startPage = Math.max(2, totalPages - 3);

            // Add ellipsis after first page if needed
            if (startPage > 2) pageNumbers.push('...');

            // Add middle pages
            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }

            // Add ellipsis before last page if needed
            if (endPage < totalPages - 1) pageNumbers.push('...');

            // Always include last page
            pageNumbers.push(totalPages);
        }

        return pageNumbers;
    };

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newValue = parseInt(e.target.value, 10);
        setItemsPerPage(newValue);
    };

    return (
        <div className="flex flex-wrap justify-between items-center py-4 bg-gray-800 px-4 mt-4 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>Showing</span>
                <span className="font-medium text-app-light">
                    {itemsPerPage === 0 ? `all ${totalItems}` : `${startItem}-${endItem} of ${totalItems}`}
                </span>
                <span>items</span>
            </div>

            <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                {itemsPerPage !== 0 && (<div className="flex items-center space-x-1">
                    <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="p-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="11 17 6 12 11 7"></polyline>
                            <polyline points="18 17 13 12 18 7"></polyline>
                        </svg>
                    </button>
                    <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                    </button>

                    <div className="flex items-center">
                        {getPageNumbers().map((page, index) => (
                            typeof page === 'number' ? (
                                <button
                                    key={index}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1 mx-1 rounded ${currentPage === page
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                >
                                    {page}
                                </button>
                            ) : (
                                <span key={index} className="px-1 text-gray-500">
                                    {page}
                                </span>
                            )
                        ))}
                    </div>

                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </button>
                    <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="p-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="13 17 18 12 13 7"></polyline>
                            <polyline points="6 17 11 12 6 7"></polyline>
                        </svg>
                    </button>
                </div>)}

                <div className="flex items-center ml-4">
                    <label htmlFor="itemsPerPage" className="text-sm text-gray-400 mr-2">
                        Show:
                    </label>
                    <select
                        id="itemsPerPage"
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        className="bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        {itemsPerPageOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default Pagination;
