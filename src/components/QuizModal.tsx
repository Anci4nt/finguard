
import React, { useState } from 'react';
import { Brain, X, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const questions = [
    {
      question: "What is the recommended emergency fund size?",
      options: ["1-2 months expenses", "3-6 months expenses", "1 year expenses", "2 years expenses"],
      correctAnswer: 1
    },
    {
      question: "Which investment option typically offers the highest returns over the long term?",
      options: ["Fixed Deposits", "Gold", "Equity Mutual Funds", "Savings Account"],
      correctAnswer: 2
    },
    {
      question: "What is a good debt-to-income ratio?",
      options: ["Below 20%", "Below 30%", "Below 40%", "Below 50%"],
      correctAnswer: 1
    },
    {
      question: "When should you start investing?",
      options: ["After 30 years", "After getting married", "As soon as you start earning", "After buying a house"],
      correctAnswer: 2
    },
    {
      question: "What is the 50/30/20 rule?",
      options: ["50% needs, 30% wants, 20% savings", "50% savings, 30% needs, 20% wants", "50% wants, 30% needs, 20% savings", "50% investments, 30% expenses, 20% emergency"],
      correctAnswer: 0
    }
  ];

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    return answers.reduce((score, answer, index) => {
      return score + (answer === questions[index].correctAnswer ? 1 : 0);
    }, 0);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
  };

  const handleClose = () => {
    resetQuiz();
    onClose();
  };

  if (!isOpen) return null;

  if (showResults) {
    const score = calculateScore();
    const percentage = (score / questions.length) * 100;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5" />
                <span>Quiz Results</span>
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-6xl mb-4">
              {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '📚'}
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">{score}/{questions.length}</div>
              <div className="text-lg text-gray-600">Score: {percentage}%</div>
            </div>
            <div className="text-sm text-gray-500">
              {percentage >= 80 ? 'Excellent! You have great financial knowledge.' :
               percentage >= 60 ? 'Good job! Keep learning to improve.' :
               'Keep studying! Financial literacy is a journey.'}
            </div>
            <div className="flex gap-2">
              <Button onClick={resetQuiz} variant="outline" className="flex-1">
                Retake Quiz
              </Button>
              <Button onClick={handleClose} className="flex-1">
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5" />
              <span>Financial Quiz</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-500">
            Question {currentQuestion + 1} of {questions.length}
          </div>
          
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{questions[currentQuestion].question}</h3>
            
            <div className="space-y-2">
              {questions[currentQuestion].options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full text-left justify-start p-4 h-auto"
                  onClick={() => handleAnswer(index)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizModal;
