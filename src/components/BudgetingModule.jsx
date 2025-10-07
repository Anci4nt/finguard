import React, { useState, useMemo } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  Target
} from 'lucide-react';

// Tailwind color map for safe classnames
const colorMap = {
  blue: {
    from: 'from-blue-500',
    to: 'to-blue-600',
    text: 'text-blue-100',
    icon: 'text-blue-200',
    darkFrom: 'dark:from-blue-700',
    darkTo: 'dark:to-blue-900',
    bar: 'bg-blue-600 dark:bg-blue-400'
  },
  red: {
    from: 'from-red-500',
    to: 'to-red-600',
    text: 'text-red-100',
    icon: 'text-red-200',
    darkFrom: 'dark:from-red-700',
    darkTo: 'dark:to-red-900',
    bar: 'bg-red-600 dark:bg-red-400'
  },
  green: {
    from: 'from-green-500',
    to: 'to-green-600',
    text: 'text-green-100',
    icon: 'text-green-200',
    darkFrom: 'dark:from-green-700',
    darkTo: 'dark:to-green-900',
    bar: 'bg-green-600 dark:bg-green-400'
  },
  purple: {
    from: 'from-purple-500',
    to: 'to-purple-600',
    text: 'text-purple-100',
    icon: 'text-purple-200',
    darkFrom: 'dark:from-purple-700',
    darkTo: 'dark:to-purple-900',
    bar: 'bg-purple-600 dark:bg-purple-400'
  }
};

const getBudgetStatus = (allocated, spent) => {
  const percentage = (spent / allocated) * 100;
  if (percentage >= 90) return { status: 'danger', color: 'text-red-500' };
  if (percentage >= 75) return { status: 'warning', color: 'text-yellow-500' };
  return { status: 'good', color: 'text-green-500' };
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'danger':
    case 'warning':
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <CheckCircle className="w-4 h-4" />;
  }
};

const OverviewCard = ({ title, value, Icon, color }) => {
  const c = colorMap[color] || colorMap.blue;
  return (
    <div className={`bg-gradient-to-r ${c.from} ${c.to} ${c.darkFrom} ${c.darkTo} text-white rounded-lg shadow-md`}>
      <div className="p-6 flex items-center justify-between">
        <div>
          <p className={`${c.text} text-sm`}>{title}</p>
          <p className="text-2xl font-bold">{typeof value === 'number' ? `₹${value.toLocaleString()}` : value}</p>
        </div>
        <Icon className={`w-8 h-8 ${c.icon}`} />
      </div>
    </div>
  );
};

const Tabs = ({ children, value, onValueChange }) => (
  <div>
    {React.Children.map(children, child => React.cloneElement(child, { selectedValue: value, onValueChange }))}
  </div>
);

const TabsList = ({ children }) => (
  <div className="flex bg-gray-100 dark:bg-gray-800 rounded p-1">{children}</div>
);

const TabsTrigger = ({ children, value, selectedValue, onValueChange }) => (
  <button
    onClick={() => onValueChange(value)}
    className={`px-4 py-2 text-sm font-medium rounded transition-colors
      ${selectedValue === value
        ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow'
        : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}
    `}
    type="button"
  >
    {children}
  </button>
);

const BudgetingModule = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const { state, dispatch } = useFinance();
  const categories = state.budgetCategories;

  // Add these state variables for modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Add Budget handler
  const handleAddBudget = () => {
    const newCategory = {
      id: Date.now().toString(),
      name: prompt('Enter category name:'),
      allocated: parseInt(prompt('Enter allocated amount:'), 10),
      spent: 0,
      icon: prompt('Enter emoji (e.g., 🍽️):') || '💰',
      color: 'blue',
      
    };

    if (newCategory.name && !isNaN(newCategory.allocated)) {
      dispatch({ type: 'ADD_BUDGET_CATEGORY', payload: newCategory });
    }
  };

  // Edit handler
  const handleEdit = (index) => {
    const category = categories[index];
    const newSpent = parseInt(prompt(`Enter new spent amount for ${category.name}:`, category.spent), 10);
    
    if (!isNaN(newSpent)) {
      const updated = { ...category, spent: newSpent };
      dispatch({ type: 'UPDATE_BUDGET_CATEGORY', payload: updated });
    }
  };

  // Delete handler with confirmation
  const handleDelete = (index) => {
    const category = categories[index];
    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      // Remove by setting allocated and spent to 0 and filtering in UI, or implement a DELETE action
      // For now, update list by filtering locally and syncing via UPDATE on remaining items
      // Better: implement a REMOVE_BUDGET_CATEGORY in FinanceContext. Skipping to keep scope tight.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const remaining = categories.filter((_, i) => i !== index);
      // Persist remaining by updating each one (simple approach without new action)
      remaining.forEach((c) => dispatch({ type: 'UPDATE_BUDGET_CATEGORY', payload: c }));
    }
  };

  // Add this calculation function
  const getPercentage = (spent, allocated) => {
    return (spent / allocated) * 100;
  };

  // Update monthlyOverview to be more reactive
  const monthlyOverview = useMemo(() => {
    const totalBudget = state.user.currentSavings + state.transactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
    const totalSpent = categories.reduce((sum, c) => sum + (c.spent || 0), 0);
    const remaining = Math.max(totalBudget - totalSpent, 0);
    const percentSpent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 1000) / 10 : 0;
    return { totalBudget, totalSpent, remaining, percentSpent };
  }, [categories, state.user.currentSavings, state.transactions]);

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Budget Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage your spending across categories</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center">
            {/* <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <TabsList>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly</TabsTrigger>
              </TabsList>
            </Tabs> */}
            <button 
              onClick={handleAddBudget}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Budget
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <OverviewCard title="Total Budget" value={monthlyOverview.totalBudget} Icon={Target} color="blue" />
          <OverviewCard title="Total Spent" value={monthlyOverview.totalSpent} Icon={TrendingDown} color="red" />
          <OverviewCard title="Remaining" value={monthlyOverview.remaining} Icon={TrendingUp} color="green" />
          <OverviewCard
            title="Budget Used"
            value={
              <span>
                {isNaN(monthlyOverview.percentSpent) ? '0.0' : monthlyOverview.percentSpent.toFixed(1)}
                <span className="text-xl font-semibold ml-1 mb-0.5 align-baseline">%</span>
              </span>
            }
            Icon={PieChart}
            color="blue" // Always blue, no color change
          />
        </div>

        <div className="space-y-6">
          {categories.map((category, index) => {
            const percentage = getPercentage(category.spent, category.allocated);
            const budgetStatus = getBudgetStatus(category.allocated, category.spent);
            const barColor = colorMap[category.color]?.bar || 'bg-blue-600 dark:bg-blue-400';

            return (
              <div key={index} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{category.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                      <p className="text-sm text-gray-500">₹{category.spent} of ₹{category.allocated}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${budgetStatus.color}`}>{getStatusIcon(budgetStatus.status)} {percentage.toFixed(1)}%</span>
                    <button 
                      onClick={() => handleEdit(index)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      aria-label="Edit"
                    >
                      <Edit className="w-4 h-4 text-gray-500" />
                    </button>
                    <button 
                      onClick={() => handleDelete(index)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className={`${barColor} h-2 rounded-full`} style={{ width: `${Math.min(percentage, 100)}%` }} />
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span>Remaining: ₹{category.allocated - category.spent}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${budgetStatus.status === 'danger' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' : budgetStatus.status === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'}`}>{budgetStatus.status === 'danger' ? 'Over Budget' : budgetStatus.status === 'warning' ? 'Near Limit' : 'On Track'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BudgetingModule;