import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { clearAllStorage } from '@/utils/firebaseStorage';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { state, dispatch } = useFinance();
  const [name, setName] = useState(state.user.name);
  const [profession, setProfession] = useState(state.user.profession);
  const [monthlyIncome, setMonthlyIncome] = useState(state.user.monthlyIncome.toString());
  const [currentSavings, setCurrentSavings] = useState(state.user.currentSavings.toString());
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    setSaving(true);
    dispatch({ type: 'SET_USER_DATA', payload: { 
      name, 
      profession,
      monthlyIncome: parseInt(monthlyIncome || '0', 10) || 0,
      currentSavings: parseInt(currentSavings || '0', 10) || 0
    } });
    setSaving(false);
  };

  const onReset = async () => {
    if (!user) return;
    await clearAllStorage(user.uid);
    dispatch({ type: 'INITIALIZE_STATE', payload: {
      ...state,
      transactions: [],
      budgetCategories: [],
      loans: [],
      courses: [],
      achievements: [],
      savingsGoals: [],
      userStats: { coursesCompleted: 0, totalHours: 0, streakDays: 0, points: 0 },
      user: { ...state.user, monthlyIncome: 0, currentSavings: 0 }
    }});
    dispatch({ type: 'CLEAR_LOANS' });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-start justify-center py-10 px-4">
      <Card className="w-full max-w-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Email</div>
            <div className="text-sm">{user?.email}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Name</div>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Profession</div>
            <Input value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="Your profession" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Monthly Income (₹)</div>
              <Input value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} type="number" placeholder="0" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Current Savings (₹)</div>
              <Input value={currentSavings} onChange={(e) => setCurrentSavings(e.target.value)} type="number" placeholder="0" />
            </div>
          </div>
          <div className="pt-2 flex gap-2">
            <Button onClick={onSave} disabled={saving} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" onClick={onReset}>Reset Data</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;


