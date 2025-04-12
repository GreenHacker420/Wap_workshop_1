import { useState, useMemo } from 'react';
import Modal from 'react-modal';

function Transactions({ transactions, categories, onAddTransaction, stats }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    startDate: '',
    endDate: '',
    type: '',
    category: '',
    minAmount: '',
    maxAmount: ''
  });
  const [newTransaction, setNewTransaction] = useState({
    Amount: '',
    Type: 'Expence',
    Date: new Date().toISOString().split('T')[0],
    Transaction_Description: '',
    category: ''
  });

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    onFilterChange(filters);
    setIsFilterModalOpen(false);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      startDate: '',
      endDate: '',
      type: '',
      category: '',
      minAmount: '',
      maxAmount: ''
    });
    onFilterChange({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAddTransaction(newTransaction);
    setIsModalOpen(false);
    setNewTransaction({
      Amount: '',
      Type: 'Expence',
      Date: new Date().toISOString().split('T')[0],
      Transaction_Description: '',
      category: ''
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0 // Remove decimal places for INR
    }).format(amount);
  };

  return (
    <div className="transactions-section">
      <div className="section-header">
        <div className="header-content">
          <h2>Recent Transactions</h2>
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search transactions..." 
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input"
            />
            <button 
              className="filter-button"
              onClick={() => setIsFilterModalOpen(true)}
            >
              Filter
            </button>
            {Object.values(filters).some(v => v !== '') && (
              <button 
                className="clear-filter-button"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
        <button className="add-button" onClick={() => setIsModalOpen(true)}>
          Add Transaction
        </button>
      </div>

      <div className="transactions-summary">
        <div className="summary-card income">
          <h3>Income</h3>
          <p className="amount">{formatCurrency(stats.totalIncome)}</p>
          <p className="change positive">+{stats.incomeChange}%</p>
        </div>
        <div className="summary-card expense">
          <h3>Expense</h3>
          <p className="amount">{formatCurrency(stats.totalExpense)}</p>
          <p className="change negative">{stats.expenseChange}%</p>
        </div>
        <div className="summary-card balance">
          <h3>My Balance</h3>
          <p className="amount">{formatCurrency(stats.balance)}</p>
          <p className="change positive">+{stats.balanceChange}%</p>
        </div>
      </div>

      <div className="transactions-table">
        <table>
          <thead>
            <tr>
              <th>Transaction</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="transaction-info">
                  <span className="transaction-name">{transaction.Transaction_Description}</span>
                </td>
                <td>{new Date(transaction.Date).toLocaleString()}</td>
                <td className={`amount ${transaction.Type.toLowerCase()}`}>
                  {transaction.Type === 'Expence' ? '-' : '+'}{formatCurrency(Math.abs(transaction.Amount))}
                </td>
                <td>
                  <span className={`type-tag ${transaction.Type.toLowerCase()}`}>
                    {transaction.Type}
                  </span>
                </td>
                <td><span className="status success">Success</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isFilterModalOpen}
        onRequestClose={() => setIsFilterModalOpen(false)}
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Filter Transactions</h2>
        <form onSubmit={handleFilterSubmit}>
          <div className="form-group">
            <label>Date Range:</label>
            <div className="date-range">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                placeholder="Start Date"
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                placeholder="End Date"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Type:</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Income">Income</option>
              <option value="Expence">Expense</option>
            </select>
          </div>
          <div className="form-group">
            <label>Category:</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Amount Range:</label>
            <div className="amount-range">
              <input
                type="number"
                value={filters.minAmount}
                onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                placeholder="Min Amount"
              />
              <input
                type="number"
                value={filters.maxAmount}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                placeholder="Max Amount"
              />
            </div>
          </div>
          <div className="button-group">
            <button type="submit">Apply Filters</button>
            <button type="button" onClick={clearFilters}>Clear All</button>
            <button type="button" onClick={() => setIsFilterModalOpen(false)}>Cancel</button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Add New Transaction</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Amount:</label>
            <input
              type="number"
              value={newTransaction.Amount}
              onChange={(e) => setNewTransaction({ ...newTransaction, Amount: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Type:</label>
            <select
              value={newTransaction.Type}
              onChange={(e) => setNewTransaction({ ...newTransaction, Type: e.target.value })}
            >
              <option value="Expence">Expense</option>
              <option value="Income">Income</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date:</label>
            <input
              type="datetime-local"
              value={newTransaction.Date}
              onChange={(e) => setNewTransaction({ ...newTransaction, Date: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <input
              type="text"
              value={newTransaction.Transaction_Description}
              onChange={(e) => setNewTransaction({ ...newTransaction, Transaction_Description: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Category:</label>
            <select
              value={newTransaction.category}
              onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="button-group">
            <button type="submit">Add Transaction</button>
            <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Transactions; 