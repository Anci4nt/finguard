import React, { createContext, useContext, useReducer, useEffect, ReactNode, useState } from 'react';
import { saveToStorage, getFromStorage, STORAGE_KEYS } from '../utils/firebaseStorage';
import LoadingScreen from '@/components/LoadingScreen';
import { useAuth } from './AuthContext';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  color: string;
  icon: string;
}

export interface Loan {
  id: string;
  type: string;
  bank: string;
  originalAmount: number;
  currentBalance: number;
  monthlyEmi: number;
  interestRate: number;
  remainingMonths: number;
  nextDueDate: string;
  status: 'active' | 'paid' | 'overdue';
  color: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  progress: number;
  completed: boolean;
  modules: number;
  completedModules: number;
  rating: number;
  students: number;
  thumbnail: string;
  status: 'completed' | 'in-progress' | 'locked';
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  color: string;
}

interface FinanceState {
  user: {
    name: string;
    age: number;
    profession: string;
    monthlyIncome: number;
    currentSavings: number;
    financialGoals: string[];
    showBalance: boolean;
  };
  transactions: Transaction[];
  budgetCategories: BudgetCategory[];
  loans: Loan[];
  courses: Course[];
  achievements: string[];
  savingsGoals: SavingsGoal[];
  userStats: {
    coursesCompleted: number;
    totalHours: number;
    streakDays: number;
    points: number;
  };
}

type FinanceAction = 
  | { type: 'INITIALIZE_STATE'; payload: FinanceState }
  | { type: 'SET_USER_DATA'; payload: Partial<FinanceState['user']> }
  | { type: 'TOGGLE_BALANCE_VISIBILITY' }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_BUDGET_CATEGORY'; payload: BudgetCategory }
  | { type: 'ADD_BUDGET_CATEGORY'; payload: BudgetCategory }
  | { type: 'ADD_SAVINGS_GOAL'; payload: SavingsGoal }
  | { type: 'UPDATE_COURSE_PROGRESS'; payload: { courseId: string; progress: number } }
  | { type: 'MAKE_LOAN_PAYMENT'; payload: { loanId: string; amount: number } }
  | { type: 'ADD_LOAN'; payload: Loan }
  | { type: 'UPDATE_LOAN'; payload: { loanId: string; updates: Partial<Loan> } }
  | { type: 'CLEAR_LOANS' };

const defaultState: FinanceState = {
  user: {
    name: '',
    age: 0,
    profession: '',
    monthlyIncome: 0,
    currentSavings: 0,
    financialGoals: [],
    showBalance: true
  },
  transactions: [],
  budgetCategories: [],
  loans: [],
  courses: [
    { 
      id: '1', 
      title: 'Budgeting Basics', 
      description: 'Learn the fundamentals of creating and maintaining a budget',
      duration: '2 hours',
      level: 'Beginner',
      progress: 0, 
      completed: false, 
      modules: 6, 
      completedModules: 0,
      rating: 4.8,
      students: 1250,
      thumbnail: '💰',
      status: 'in-progress'
    },
    { 
      id: '2', 
      title: 'Investment Fundamentals', 
      description: 'Understanding stocks, bonds, and mutual funds',
      duration: '3 hours',
      level: 'Intermediate',
      progress: 0, 
      completed: false, 
      modules: 8, 
      completedModules: 0,
      rating: 4.9,
      students: 980,
      thumbnail: '📈',
      status: 'in-progress'
    },
    { 
      id: '3', 
      title: 'Credit Score Mastery', 
      description: 'How to build and maintain an excellent credit score',
      duration: '1.5 hours',
      level: 'Beginner',
      progress: 0, 
      completed: false, 
      modules: 4, 
      completedModules: 0,
      rating: 4.7,
      students: 2100,
      thumbnail: '🏆',
      status: 'in-progress'
    }
  ],
  achievements: [],
  savingsGoals: [],
  userStats: {
    coursesCompleted: 0,
    totalHours: 0,
    streakDays: 0,
    points: 0
  }
};

const financeReducer = (state: FinanceState, action: FinanceAction): FinanceState => {
  let newState: FinanceState;

  switch (action.type) {
    case 'INITIALIZE_STATE':
      return action.payload;
    
    case 'SET_USER_DATA':
      newState = {
        ...state,
        user: { ...state.user, ...action.payload }
      };
      // Persist per-user
      // Note: useAuth hook is not available inside reducer; caller persists after dispatch if needed
      return newState;
    
    case 'TOGGLE_BALANCE_VISIBILITY':
      newState = {
        ...state,
        user: {
          ...state.user,
          showBalance: !state.user.showBalance
        }
      };
      return newState;
    
    case 'ADD_TRANSACTION':
      newState = {
        ...state,
        transactions: [action.payload, ...state.transactions]
      };
      
      // Update budget categories spent amount
      const updatedCategories = state.budgetCategories.map(cat => {
        if (cat.name.toLowerCase().includes(action.payload.category.toLowerCase()) && action.payload.type === 'expense') {
          return { ...cat, spent: cat.spent + action.payload.amount };
        }
        return cat;
      });
      
      newState.budgetCategories = updatedCategories;
      return newState;
    
    case 'UPDATE_BUDGET_CATEGORY':
      newState = {
        ...state,
        budgetCategories: state.budgetCategories.map(cat =>
          cat.id === action.payload.id ? action.payload : cat
        )
      };
      return newState;
    
    case 'ADD_BUDGET_CATEGORY':
      newState = {
        ...state,
        budgetCategories: [...state.budgetCategories, action.payload]
      };
      return newState;
    
    case 'ADD_SAVINGS_GOAL':
      newState = {
        ...state,
        savingsGoals: [...state.savingsGoals, action.payload]
      };
      return newState;
    
    case 'UPDATE_COURSE_PROGRESS':
      newState = {
        ...state,
        courses: state.courses.map(course =>
          course.id === action.payload.courseId
            ? { ...course, progress: action.payload.progress }
            : course
        )
      };
      return newState;
    
    case 'MAKE_LOAN_PAYMENT':
      newState = {
        ...state,
        loans: state.loans.map(loan =>
          loan.id === action.payload.loanId
            ? { ...loan, currentBalance: Math.max(0, loan.currentBalance - action.payload.amount) }
            : loan
        )
      };
      return newState;

    case 'ADD_LOAN':
      newState = {
        ...state,
        loans: [...state.loans, action.payload]
      };
      return newState;

    case 'UPDATE_LOAN':
      newState = {
        ...state,
        loans: state.loans.map(loan =>
          loan.id === action.payload.loanId ? { ...loan, ...action.payload.updates } : loan
        )
      };
      return newState;

    case 'CLEAR_LOANS':
      newState = {
        ...state,
        loans: []
      };
      return newState;
    
    default:
      return state;
  }
};

const FinanceContext = createContext<{
  state: FinanceState;
  dispatch: React.Dispatch<FinanceAction>;
} | null>(null);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(financeReducer, defaultState);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    async function load() {
      if (!user) {
        // Not authenticated: ensure we are not stuck in loading state
        setLoading(false);
        return;
      }
      const [
        savedUser,
        savedTransactions,
        savedBudgetCategories,
        savedLoans,
        savedCourses,
        savedAchievements,
        savedSavingsGoals,
        savedUserStats,
      ] = await Promise.all([
        getFromStorage(STORAGE_KEYS.USER_DATA, defaultState.user, user.uid),
        getFromStorage(STORAGE_KEYS.TRANSACTIONS, defaultState.transactions, user.uid),
        getFromStorage(STORAGE_KEYS.BUDGET_CATEGORIES, defaultState.budgetCategories, user.uid),
        getFromStorage(STORAGE_KEYS.LOANS, defaultState.loans, user.uid),
        getFromStorage(STORAGE_KEYS.COURSES, defaultState.courses, user.uid),
        getFromStorage(STORAGE_KEYS.ACHIEVEMENTS, defaultState.achievements, user.uid),
        getFromStorage(STORAGE_KEYS.SAVINGS_GOALS, defaultState.savingsGoals, user.uid),
        getFromStorage(STORAGE_KEYS.USER_STATS, defaultState.userStats, user.uid),
      ]);

      const initialState: FinanceState = {
        user: savedUser,
        transactions: savedTransactions,
        budgetCategories: savedBudgetCategories,
        loans: savedLoans,
        courses: savedCourses,
        achievements: savedAchievements,
        savingsGoals: savedSavingsGoals,
        userStats: savedUserStats,
      };

      dispatch({ type: 'INITIALIZE_STATE', payload: initialState });
      setLoading(false);
      setHydrated(true);
    }
    load();
  }, [user]);

  // Persist on key state changes with per-user scoping
  useEffect(() => {
    if (!user || !hydrated) return; // avoid overwriting before initial load
    (async () => {
      await Promise.all([
        saveToStorage(STORAGE_KEYS.USER_DATA, state.user, user.uid),
        saveToStorage(STORAGE_KEYS.TRANSACTIONS, state.transactions, user.uid),
        saveToStorage(STORAGE_KEYS.BUDGET_CATEGORIES, state.budgetCategories, user.uid),
        saveToStorage(STORAGE_KEYS.LOANS, state.loans, user.uid),
        saveToStorage(STORAGE_KEYS.COURSES, state.courses, user.uid),
        saveToStorage(STORAGE_KEYS.ACHIEVEMENTS, state.achievements, user.uid),
        saveToStorage(STORAGE_KEYS.SAVINGS_GOALS, state.savingsGoals, user.uid),
        saveToStorage(STORAGE_KEYS.USER_STATS, state.userStats, user.uid),
      ]);
    })();
  }, [state, user, hydrated]);

  return (
    <FinanceContext.Provider value={{ state, dispatch }}>
      {loading && user ? <LoadingScreen /> : children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
