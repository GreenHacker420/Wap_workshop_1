// src/lib/pocketbase.js
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090'); 
pb.autoCancellation(false); 

// Categories
export const getCategories = async (search = '') => {
    try {
        const filter = search 
            ? `name ~ "${search}"` 
            : '';
        return await pb.collection('categories').getFullList({
            filter,
            sort: 'name'
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

export const createCategory = async (categoryData) => {
    try {
        await pb.collection('categories').create(categoryData);
        return await getCategories();
    } catch (error) {
        console.error('Error creating category:', error);
        throw error;
    }
};

// Transactions
export const getTransactions = async (filters = {}) => {
    try {
        let filterConditions = [];
        
        // Search by description
        if (filters.search) {
            filterConditions.push(`Transaction_Description ~ "${filters.search}"`);
        }
        
        // Filter by date range
        if (filters.startDate) {
            filterConditions.push(`Date >= "${filters.startDate}"`);
        }
        if (filters.endDate) {
            filterConditions.push(`Date <= "${filters.endDate}"`);
        }
        
        // Filter by type
        if (filters.type) {
            filterConditions.push(`Type = "${filters.type}"`);
        }
        
        // Filter by category
        if (filters.category) {
            filterConditions.push(`category = "${filters.category}"`);
        }
        
        // Filter by amount range
        if (filters.minAmount) {
            filterConditions.push(`Amount >= ${filters.minAmount}`);
        }
        if (filters.maxAmount) {
            filterConditions.push(`Amount <= ${filters.maxAmount}`);
        }

        const filter = filterConditions.join(' && ');

        return await pb.collection('Transaction').getFullList({
            sort: '-Date',
            expand: 'category',
            filter
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw error;
    }
};

export const createTransaction = async (transactionData) => {
    try {
        await pb.collection('Transaction').create(transactionData);
        return await getTransactions();
    } catch (error) {
        console.error('Error creating transaction:', error);
        throw error;
    }
};

// Get transaction statistics with category breakdown
export const getTransactionStats = async (filters = {}) => {
    try {
        const transactions = await getTransactions(filters);
        const categories = await getCategories();
        
        // Initialize category stats
        const categoryStats = categories.reduce((acc, category) => {
            acc[category.id] = {
                name: category.name,
                totalIncome: 0,
                totalExpense: 0,
                count: 0
            };
            return acc;
        }, {});

        // Calculate overall stats and category breakdown
        const stats = transactions.reduce((acc, transaction) => {
            const amount = parseFloat(transaction.Amount);
            
            // Update overall stats
            if (transaction.Type === 'Income') {
                acc.totalIncome += amount;
                acc.incomeCount++;
            } else {
                acc.totalExpense += amount;
                acc.expenseCount++;
            }

            // Update category stats if category exists
            if (transaction.category && categoryStats[transaction.category]) {
                if (transaction.Type === 'Income') {
                    categoryStats[transaction.category].totalIncome += amount;
                } else {
                    categoryStats[transaction.category].totalExpense += amount;
                }
                categoryStats[transaction.category].count++;
            }

            return acc;
        }, { 
            totalIncome: 0, 
            totalExpense: 0, 
            incomeCount: 0, 
            expenseCount: 0,
            categoryStats
        });

        // Calculate balance
        stats.balance = stats.totalIncome - stats.totalExpense;

        // Calculate percentage changes based on filtered data
        const previousPeriodFilters = { ...filters };
        if (filters.startDate && filters.endDate) {
            const currentStart = new Date(filters.startDate);
            const currentEnd = new Date(filters.endDate);
            const duration = currentEnd - currentStart;
            
            previousPeriodFilters.endDate = currentStart.toISOString();
            previousPeriodFilters.startDate = new Date(currentStart - duration).toISOString();
            
            const previousStats = await getTransactions(previousPeriodFilters).then(transactions => 
                transactions.reduce((acc, t) => {
                    const amount = parseFloat(t.Amount);
                    if (t.Type === 'Income') acc.income += amount;
                    else acc.expense += amount;
                    return acc;
                }, { income: 0, expense: 0 })
            );

            stats.incomeChange = previousStats.income ? ((stats.totalIncome - previousStats.income) / previousStats.income) * 100 : 0;
            stats.expenseChange = previousStats.expense ? ((stats.totalExpense - previousStats.expense) / previousStats.expense) * 100 : 0;
            stats.balanceChange = ((stats.balance - (previousStats.income - previousStats.expense)) / Math.abs(previousStats.income - previousStats.expense)) * 100;
        } else {
            stats.incomeChange = 0;
            stats.expenseChange = 0;
            stats.balanceChange = 0;
        }

        return stats;
    } catch (error) {
        console.error('Error calculating transaction stats:', error);
        throw error;
    }
};

export default pb;
