import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Target, 
  Gift, 
  Plus,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useFinance } from '@/contexts/FinanceContext';
import TransactionModal from './TransactionModal';
import SavingsGoalModal from './SavingsGoalModal';

const Dashboard = () => {
  const { state, dispatch } = useFinance();
  const [transactionModal, setTransactionModal] = useState<{ isOpen: boolean; type: 'income' | 'expense' }>({
    isOpen: false,
    type: 'income'
  });
  const [showSavingsGoalModal, setShowSavingsGoalModal] = useState(false);

  // Calculate total balance from savings and net transactions
  const totalBalance = useMemo(() => {
    const netTransactions = state.transactions.reduce((sum, transaction) => {
      return transaction.type === 'income' 
        ? sum + transaction.amount 
        : sum - transaction.amount;
    }, 0);
    
    return state.user.currentSavings + netTransactions;
  }, [state.user.currentSavings, state.transactions]);

  // Calculate monthly expenses from transactions
  const monthlyExpenses = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return state.transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === 'expense' && 
               transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [state.transactions]);

  const toggleBalanceVisibility = () => {
    dispatch({ type: 'TOGGLE_BALANCE_VISIBILITY' });
  };

  const openTransactionModal = (type: 'income' | 'expense') => {
    setTransactionModal({ isOpen: true, type });
  };

  const closeTransactionModal = () => {
    setTransactionModal({ isOpen: false, type: 'income' });
  };

  const quickStats = [
    { 
      title: 'Total Balance', 
      amount: `₹${totalBalance.toLocaleString()}`, 
      color: 'bg-green-500'
    },
    { 
      title: 'Monthly Expenses', 
      amount: `₹${monthlyExpenses.toLocaleString()}`, 
    
      color: 'bg-red-500'
    },
    { 
      title: 'Monthly Income', 
      amount: `₹${state.user.monthlyIncome.toLocaleString()}`, 
    
      color: 'bg-blue-500'
    },
    { 
      title: 'Savings Rate', 
      amount: `${state.user.monthlyIncome > 0 ? Math.round(((state.user.monthlyIncome - monthlyExpenses) / state.user.monthlyIncome) * 100) : 0}%`, 
   
      color: 'bg-purple-500'
    }
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold mb-2">Good morning, {state.user.name || 'User'}! 👋</h1>
              <p className="text-blue-100">Your financial journey is looking great today</p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <span className="text-sm opacity-90">Total Balance</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleBalanceVisibility}
                  className="text-white hover:bg-white/20"
                >
                  {state.user.showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
              </div>
              <div className="text-3xl font-bold">
                {state.user.showBalance ? `₹${totalBalance.toLocaleString()}` : '₹••••••'}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <Card key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.amount}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      {/* Only show the change, no color logic for trend */}
                      <span className="text-sm text-gray-500">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center`}>
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <Card className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold">Recent Transactions</CardTitle>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {state.transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No transactions yet. Add your first transaction to get started!
                  </div>
                ) : (
                  state.transactions.slice(0, 4).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {transaction.type === 'income' ? 
                            <TrendingUp className="w-5 h-5" /> : 
                            <TrendingDown className="w-5 h-5" />
                          }
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()
                        }</p>
                        <Badge variant="secondary" className="text-xs">
                          {transaction.category}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Savings Goals */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold">Savings Goals</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowSavingsGoalModal(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Goal
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {state.savingsGoals.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No savings goals yet. Add your first goal to get started!
                  </div>
                ) : (
                  state.savingsGoals.map((goal) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{goal.name}</span>
                        <span className="text-sm text-gray-500">
                          ₹{goal.current.toLocaleString()} / ₹{goal.target.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={Math.min((goal.current / goal.target) * 100, 100)} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{Math.min(Math.round((goal.current / goal.target) * 100), 100)}% completed</span>
                        <span>₹{Math.max(goal.target - goal.current, 0).toLocaleString()} remaining</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Button 
                className="h-20 flex-col space-y-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                onClick={() => openTransactionModal('income')}
              >
                <Plus className="w-6 h-6" />
                <span>Add Income</span>
              </Button>
              <Button 
                className="h-20 flex-col space-y-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                onClick={() => openTransactionModal('expense')}
              >
                <Target className="w-6 h-6" />
                <span>Add Expense</span>
              </Button>
              <Button 
                className="h-20 flex-col space-y-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                onClick={() => setShowSavingsGoalModal(true)}
              >
                <Gift className="w-6 h-6" />
                <span>Set Goal</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <TransactionModal 
        isOpen={transactionModal.isOpen}
        onClose={closeTransactionModal}
        type={transactionModal.type}
      />

      <SavingsGoalModal 
        isOpen={showSavingsGoalModal}
        onClose={() => setShowSavingsGoalModal(false)}
      />
    </>
  );
};

export default Dashboard;
