import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse" />
          <div className="absolute inset-0 blur-xl opacity-40 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
        </div>
        <div className="text-sm text-muted-foreground">Loading your FinanceWise experience…</div>
      </div>
    </div>
  );
};

export default LoadingScreen;


