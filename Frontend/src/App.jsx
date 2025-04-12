import { useState, useEffect } from 'react'
import './App.css'
import Categories from './components/Categories';
import Transactions from './components/Transactions';
import { getCategories, createCategory, getTransactions, createTransaction, getTransactionStats } from './lib/pocketbase';

function App() {
  const [categories, setCategories] = useState([])
  const [transactions, setTransactions] = useState([])
  const [filters, setFilters] = useState({})
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    incomeChange: 0,
    expenseChange: 0,
    balanceChange: 0
  });

  useEffect(() => {
    fetchInitialData();
  }, [])

  useEffect(() => {
    fetchFilteredData();
  }, [filters]);

  const fetchInitialData = async () => {
    try {
      const [categoriesData, transactionsData, statsData] = await Promise.all([
        getCategories(),
        getTransactions(),
        getTransactionStats()
      ]);
      
      setCategories(categoriesData);
      setTransactions(transactionsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchFilteredData = async () => {
    try {
      const [transactionsData, statsData] = await Promise.all([
        getTransactions(filters),
        getTransactionStats(filters)
      ]);
      
      setTransactions(transactionsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching filtered data:', error);
    }
  };

  const handleAddCategory = async (newCategory) => {
    try {
      const updatedCategories = await createCategory(newCategory);
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  }

  const handleAddTransaction = async (newTransaction) => {
    try {
      const [updatedTransactions, updatedStats] = await Promise.all([
        createTransaction(newTransaction),
        getTransactionStats(filters)
      ]);
      setTransactions(updatedTransactions);
      setStats(updatedStats);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="app-container">
      <header className="main-header">
        <h1>Hi, Welcome back!</h1>
        <p className="subtitle">Manage your expenses and review recent transactions.</p>
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search or type a command" 
            className="global-search"
            value={filters.search || ''}
            onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
          />
        </div>
      </header>

      <main className="main-content">
        <Transactions 
          transactions={transactions} 
          categories={categories}
          onAddTransaction={handleAddTransaction}
          onFilterChange={handleFilterChange}
          stats={stats}
        />
        <Categories 
          categories={categories}
          onAddCategory={handleAddCategory}
        />
      </main>
    </div>
  )
}

export default App