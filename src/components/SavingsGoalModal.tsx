
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFinance } from '@/contexts/FinanceContext';
import { useToast } from '@/hooks/use-toast';

interface SavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SavingsGoalModal = ({ isOpen, onClose }: SavingsGoalModalProps) => {
  const { dispatch } = useFinance();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    target: '',
    current: '0'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.target) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const newGoal = {
      id: Date.now().toString(),
      name: formData.name,
      target: parseFloat(formData.target),
      current: parseFloat(formData.current) || 0,
      color: `bg-${['blue', 'green', 'purple', 'pink', 'yellow'][Math.floor(Math.random() * 5)]}-500`
    };

    dispatch({ type: 'ADD_SAVINGS_GOAL', payload: newGoal });
    
    toast({
      title: "Success",
      description: "Savings goal added successfully!"
    });

    setFormData({ name: '', target: '', current: '0' });
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Savings Goal</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Goal Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Emergency Fund, Vacation"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target">Target Amount (₹) *</Label>
            <Input
              id="target"
              type="number"
              value={formData.target}
              onChange={(e) => handleInputChange('target', e.target.value)}
              placeholder="50000"
              min="1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="current">Current Amount (₹)</Label>
            <Input
              id="current"
              type="number"
              value={formData.current}
              onChange={(e) => handleInputChange('current', e.target.value)}
              placeholder="0"
              min="0"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Goal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SavingsGoalModal;
