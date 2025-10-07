import React, { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { 
  CreditCard, 
  TrendingUp, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Plus,
  Calculator,
  Target,
  X
} from 'lucide-react';

// --- UI COMPONENTS ---
const Card = ({ children, className = "" }) => (
  <div className={`rounded-xl shadow-lg ${className}`}>{children}</div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

const Button = ({ children, variant = "default", size = "default", onClick, className = "", ...props }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
  };
  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-sm"
  };
  return (
    <button 
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, className = "" }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

const Progress = ({ value, className = "" }) => (
  <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${className}`}>
    <div 
      className="bg-blue-600 dark:bg-blue-400 h-full rounded-full transition-all duration-300"
      style={{ width: `${Math.min(100, Math.max(0, value))}%`, height: "100%" }}
    />
  </div>
);

const Input = ({ type = "text", placeholder, value, onChange, className = "" }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-gray-100 ${className}`}
  />
);

const Label = ({ children, className = "" }) => (
  <label className={`block text-sm font-medium text-gray-700 dark:text-gray-200 ${className}`}>
    {children}
  </label>
);

// useFinance from global FinanceContext

// --- MOCK TOAST ---
const useToast = () => {
  const toast = ({ title, description }) => {
    alert(`${title}: ${description}`);
  };
  return { toast };
};

// --- MODALS ---
const EMICalculator = ({ isOpen, onClose }) => {
  const [loanAmount, setLoanAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTenure, setLoanTenure] = useState('');
  const [emiResult, setEmiResult] = useState(null);

  const calculateEMI = () => {
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 12 / 100;
    const months = parseFloat(loanTenure);

    if (principal && rate && months) {
      const emi = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
      const totalAmount = emi * months;
      const totalInterest = totalAmount - principal;

      setEmiResult({
        emi: Math.round(emi),
        totalAmount: Math.round(totalAmount),
        totalInterest: Math.round(totalInterest)
      });
    }
  };

  const resetCalculator = () => {
    setLoanAmount('');
    setInterestRate('');
    setLoanTenure('');
    setEmiResult(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">EMI Calculator</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Loan Amount (₹)</Label>
            <Input
              type="number"
              placeholder="Enter loan amount"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
            />
          </div>

          <div>
            <Label>Interest Rate (% per annum)</Label>
            <Input
              type="number"
              placeholder="Enter interest rate"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
            />
          </div>

          <div>
            <Label>Loan Tenure (months)</Label>
            <Input
              type="number"
              placeholder="Enter loan tenure"
              value={loanTenure}
              onChange={(e) => setLoanTenure(e.target.value)}
            />
          </div>

          <div className="flex space-x-2">
            <Button onClick={calculateEMI} className="flex-1">
              Calculate EMI
            </Button>
            <Button variant="outline" onClick={resetCalculator}>
              Reset
            </Button>
          </div>

          {emiResult && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-3">EMI Calculation Result</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Monthly EMI:</span>
                  <span className="font-semibold">₹{emiResult.emi.toLocaleString()}</span>
                </div>
                
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AddLoanModal = ({ isOpen, onClose }) => {
  const { state, dispatch } = useFinance();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    type: '',
    bank: '',
    originalAmount: '',
    currentBalance: '',
    monthlyEmi: '',
    interestRate: '',
    remainingMonths: '',
    nextDueDate: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.type || !formData.bank || !formData.originalAmount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields"
      });
      return;
    }

    const colors = ['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-purple-500', 'bg-yellow-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    dispatch({ type: 'ADD_LOAN', payload: {
      type: formData.type,
      bank: formData.bank,
      originalAmount: parseFloat(formData.originalAmount),
      currentBalance: parseFloat(formData.originalAmount),
      monthlyEmi: parseFloat(formData.monthlyEmi),
      interestRate: parseFloat(formData.interestRate),
      remainingMonths: parseInt(formData.remainingMonths, 10),
      nextDueDate: formData.nextDueDate,
      status: 'active',
      color: randomColor,
      id: Date.now().toString()
    }});

    toast({
      title: "Success",
      description: "Loan added successfully!"
    });

    setFormData({
      type: '',
      bank: '',
      originalAmount: '',
      currentBalance: '',
      monthlyEmi: '',
      interestRate: '',
      remainingMonths: '',
      nextDueDate: ''
    });
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Add New Loan</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Loan Type *</Label>
            <Input
              placeholder="e.g., Personal Loan, Home Loan"
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
            />
          </div>

          <div>
            <Label>Bank/Lender *</Label>
            <Input
              placeholder="e.g., HDFC Bank"
              value={formData.bank}
              onChange={(e) => handleChange('bank', e.target.value)}
            />
          </div>

          <div>
            <Label>Original Amount (₹) *</Label>
            <Input
              type="number"
              placeholder="Enter original loan amount"
              value={formData.originalAmount}
              onChange={(e) => handleChange('originalAmount', e.target.value)}
            />
          </div>

          <div>
            <Label>Current Balance (₹)</Label>
            <Input
              type="number"
              placeholder="Enter current outstanding balance"
              value={formData.currentBalance}
              onChange={(e) => handleChange('currentBalance', e.target.value)}
            />
          </div>

          <div>
            <Label>Monthly EMI (₹)</Label>
            <Input
              type="number"
              placeholder="Enter monthly EMI"
              value={formData.monthlyEmi}
              onChange={(e) => handleChange('monthlyEmi', e.target.value)}
            />
          </div>

          <div>
            <Label>Interest Rate (%)</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="Enter interest rate"
              value={formData.interestRate}
              onChange={(e) => handleChange('interestRate', e.target.value)}
            />
          </div>

          <div>
            <Label>Remaining Months</Label>
            <Input
              type="number"
              placeholder="Enter remaining months"
              value={formData.remainingMonths}
              onChange={(e) => handleChange('remainingMonths', e.target.value)}
            />
          </div>

          <div>
            <Label>Next Due Date</Label>
            <Input
              type="date"
              value={formData.nextDueDate}
              onChange={(e) => handleChange('nextDueDate', e.target.value)}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="submit" className="flex-1">
              Add Loan
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PaymentModal = ({ isOpen, onClose, loan }) => {
  const { state, dispatch } = useFinance();
  const { toast } = useToast();
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentType, setPaymentType] = useState('emi');

  const handlePayment = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid payment amount"
      });
      return;
    }

    const amount = parseFloat(paymentAmount);
    const newBalance = Math.max(0, loan.currentBalance - amount);
    
    dispatch({ type: 'UPDATE_LOAN', payload: { loanId: loan.id, updates: {
      currentBalance: newBalance,
      nextDueDate: paymentType === 'emi' ? getNextDueDate(loan.nextDueDate) : loan.nextDueDate
    }}});

    toast({
      title: "Payment Successful",
      description: `Payment of ₹${amount.toLocaleString()} processed successfully!`
    });

    setPaymentAmount('');
    onClose();
  };

  const getNextDueDate = (currentDueDate) => {
    const date = new Date(currentDueDate);
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().split('T')[0];
  };

  if (!isOpen || !loan) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Make Payment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-semibold">{loan.type}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{loan.bank}</p>
            <p className="text-lg font-bold">Outstanding: ₹{loan.currentBalance.toLocaleString()}</p>
          </div>

          <div>
            <Label>Payment Type</Label>
            <select 
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="emi">Regular EMI (₹{loan.monthlyEmi.toLocaleString()})</option>
              <option value="extra">Extra Payment</option>
              <option value="full">Full Payment</option>
            </select>
          </div>

          <div>
            <Label>Payment Amount (₹)</Label>
            <Input
              type="number"
              placeholder="Enter payment amount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
            {paymentType === 'emi' && (
              <button 
                type="button"
                onClick={() => setPaymentAmount(loan.monthlyEmi.toString())}
                className="text-sm text-blue-600 hover:text-blue-800 mt-1"
              >
                Use EMI amount (₹{loan.monthlyEmi.toLocaleString()})
              </button>
            )}
            {paymentType === 'full' && (
              <button 
                type="button"
                onClick={() => setPaymentAmount(loan.currentBalance.toString())}
                className="text-sm text-blue-600 hover:text-blue-800 mt-1"
              >
                Pay full amount (₹{loan.currentBalance.toLocaleString()})
              </button>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <Button onClick={handlePayment} className="flex-1">
              Process Payment
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoanDetailsModal = ({ isOpen, onClose, loan }) => {
  if (!isOpen || !loan) return null;

  const calculateProgress = (original, current) => {
    return ((original - current) / original) * 100;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Loan Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Loan Type</Label>
              <p className="font-semibold">{loan.type}</p>
            </div>
            <div>
              <Label>Bank/Lender</Label>
              <p className="font-semibold">{loan.bank}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Original Amount</Label>
              <p className="font-semibold">₹{loan.originalAmount.toLocaleString()}</p>
            </div>
            <div>
              <Label>Current Balance</Label>
              <p className="font-semibold">₹{loan.currentBalance.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Monthly EMI</Label>
              <p className="font-semibold">₹{loan.monthlyEmi.toLocaleString()}</p>
            </div>
            <div>
              <Label>Interest Rate</Label>
              <p className="font-semibold">{loan.interestRate}%</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Remaining Months</Label>
              <p className="font-semibold">{loan.remainingMonths}</p>
            </div>
            <div>
              <Label>Next Due Date</Label>
              <p className="font-semibold">{loan.nextDueDate}</p>
            </div>
          </div>

          <div>
            <Label>Repayment Progress</Label>
            <div className="mt-2">
              <Progress value={calculateProgress(loan.originalAmount, loan.currentBalance)} className="h-3" />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>{calculateProgress(loan.originalAmount, loan.currentBalance).toFixed(1)}% completed</span>
                <span>₹{(loan.originalAmount - loan.currentBalance).toLocaleString()} paid</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Total Interest (Projected)</Label>
              <p className="font-semibold">₹{((loan.monthlyEmi * loan.remainingMonths) - loan.currentBalance).toLocaleString()}</p>
            </div>
            <div>
              <Label>Status</Label>
              <Badge className={loan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
              </Badge>
            </div>
          </div>

          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const LoanManagement = () => {
  const { state } = useFinance();
  const [showEMICalculator, setShowEMICalculator] = useState(false);
  const [showAddLoan, setShowAddLoan] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  const handleMakePayment = (loanId) => {
    const loan = state.loans.find(l => l.id === loanId);
    setSelectedLoan(loan);
    setShowPaymentModal(true);
  };

  const handleViewDetails = (loanId) => {
    const loan = state.loans.find(l => l.id === loanId);
    setSelectedLoan(loan);
    setShowDetailsModal(true);
  };

  const loanSummary = {
    totalDebt: state.loans.reduce((sum, loan) => sum + (loan.currentBalance || 0), 0),
    monthlyEmi: state.loans.reduce((sum, loan) => sum + (loan.monthlyEmi || 0), 0),
    totalInterest: state.loans.reduce((sum, loan) => sum + Math.max((loan.monthlyEmi || 0) * (loan.remainingMonths || 0) - (loan.currentBalance || 0), 0), 0),
    avgInterestRate: state.loans.length > 0 ? (
      state.loans.reduce((sum, loan) => sum + (loan.interestRate || 0), 0) / state.loans.length
    ) : 0
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'paid': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    }
  };

  const calculateProgress = (original, current) => {
    return ((original - current) / original) * 100;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-300">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Loan Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage all your debts in one place</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              className="flex-1 min-w-[140px] sm:min-w-0"
              onClick={() => setShowEMICalculator(true)}
            >
              <Calculator className="w-4 h-4 mr-2" />
              EMI Calculator
            </Button>
            <Button 
              className="flex-1 min-w-[140px] sm:min-w-0 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              onClick={() => setShowAddLoan(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Loan
            </Button>
          </div>
        </div>

        {/* Loan Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-red-500 to-red-600 dark:from-red-700 dark:to-red-900 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Total Debt</p>
                  <p className="text-2xl font-bold">₹{loanSummary.totalDebt.toLocaleString()}</p>
                </div>
                <CreditCard className="w-8 h-8 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-900 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Monthly EMI</p>
                  <p className="text-2xl font-bold">₹{loanSummary.monthlyEmi.toLocaleString()}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          

          
        </div>

        {/* Loan Details */}
        <Card className="bg-white dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg transition-colors">
          <CardHeader>
            <CardTitle className="text-xl font-bold dark:text-white">Active Loans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {state.loans.map((loan) => (
                <div key={loan.id} className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${loan.color} rounded-full flex items-center justify-center`}>
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{loan.type}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{loan.bank}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusColor(loan.status)}>
                        {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                      </Badge>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Next Due</p>
                        <p className="font-medium dark:text-white">{loan.nextDueDate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Outstanding</p>
                      <p className="text-lg font-semibold dark:text-white">₹{loan.currentBalance.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Monthly EMI</p>
                      <p className="text-lg font-semibold dark:text-white">₹{loan.monthlyEmi.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Interest Rate</p>
                      <p className="text-lg font-semibold dark:text-white">{loan.interestRate}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Remaining Months</p>
                      <p className="text-lg font-semibold dark:text-white">{loan.remainingMonths}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>Repayment Progress</span>
                      <span>{calculateProgress(loan.originalAmount, loan.currentBalance).toFixed(1)}% paid</span>
                    </div>
                    <Progress 
                      value={calculateProgress(loan.originalAmount, loan.currentBalance)} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>₹{(loan.originalAmount - loan.currentBalance).toLocaleString()} paid</span>
                      <span>₹{loan.currentBalance.toLocaleString()} remaining</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center space-x-2">
                      {loan.nextDueDate && new Date(loan.nextDueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {loan.nextDueDate && new Date(loan.nextDueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
                          ? 'Due soon' 
                          : 'On track'
                        }
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleMakePayment(loan.id)}
                      >
                        Make Payment
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(loan.id)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        
        
      </div>

      {/* Modals */}
      <EMICalculator 
        isOpen={showEMICalculator}
        onClose={() => setShowEMICalculator(false)}
      />
      <AddLoanModal 
        isOpen={showAddLoan}
        onClose={() => setShowAddLoan(false)}
      />
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        loan={selectedLoan}
      />
      <LoanDetailsModal 
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        loan={selectedLoan}
      />
    </div>
  );
};

export default function App() {
  return <LoanManagement />;
}