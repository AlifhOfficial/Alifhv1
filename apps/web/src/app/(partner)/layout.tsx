'use client';

import { useState } from 'react';
import { PartnerDashboardNav } from '@/components/ui/navigation/partner-dashboard-nav';
import { PartnerSecondaryNav } from '@/components/ui/navigation/partner-secondary-nav';

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentSection, setCurrentSection] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<string>('');

  const handleActionSelect = (action: string) => {
    setSelectedAction(action);
    // Here you could emit events or call callbacks to handle actions
    console.log('Partner action selected:', action);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Navigation */}
      <div className="w-64 flex-shrink-0">
        <PartnerDashboardNav />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Middle Display Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Partner Hub</h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 bg-emerald-400 rounded-full"></span>
                  <span className="text-sm text-gray-600">Partnership Active</span>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Partner Notifications</span>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                  </svg>
                </button>
                <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">P</span>
                </div>
              </div>
            </div>
          </header>
          
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-5xl mx-auto">
              {children}
            </div>
          </main>
        </div>
        
        {/* Right Secondary Navigation */}
        <div className="flex-shrink-0">
          <PartnerSecondaryNav 
            currentSection={currentSection}
            onActionSelect={handleActionSelect}
          />
        </div>
      </div>
    </div>
  );
}