import React from 'react';
import '../styles/Pagination.css';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange 
}) => {
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    
    // فقط دو شماره صفحه نمایش داده می‌شود
    if (totalPages <= 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <button
            key={i}
            className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
            onClick={() => handlePageChange(i)}
          >
            {i}
          </button>
        );
      }
    } else {
      // فقط صفحه فعلی و صفحه بعدی نمایش داده می‌شود
      pages.push(
        <button
          key={currentPage}
          className="pagination-btn active"
        >
          {currentPage}
        </button>
      );
      
      if (currentPage < totalPages) {
        pages.push(
          <button
            key={currentPage + 1}
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
          >
            {currentPage + 1}
          </button>
        );
      }
    }
    
    return pages;
  };

  const startItem = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="pagination">
      <div className="pagination-info">
        نمایش <strong>{startItem}-{endItem}</strong> از <strong>{totalItems}</strong> مورد
      </div>
      
      <div className="pagination-controls">
        {/* انتخاب تعداد در صفحه */}
        <select 
          className="pagination-select"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
        >
          <option value={5}>۵</option>
          <option value={10}>۱۰</option>
          <option value={15}>۱۵</option>
          <option value={20}>۲۰</option>
        </select>
        <span style={{ fontSize: '11px', color: '#666', marginLeft: '4px' }}>در صفحه</span>

        {/* ناوبری اصلی */}
        <button
          className="pagination-btn pagination-nav-btn"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          title="اولین صفحه"
        >
          ⟪
        </button>
        
        <button
          className="pagination-btn pagination-nav-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="صفحه قبلی"
        >
          ⟨
        </button>

        {/* شماره صفحات */}
        {renderPageNumbers()}

        <button
          className="pagination-btn pagination-nav-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="صفحه بعدی"
        >
          ⟩
        </button>
        
        <button
          className="pagination-btn pagination-nav-btn"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          title="آخرین صفحه"
        >
          ⟫
        </button>
      </div>
    </div>
  );
};

export default Pagination;