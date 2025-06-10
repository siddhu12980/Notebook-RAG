import type { ReactNode } from 'react';

type ConversationLayoutProps = {
  header: ReactNode;
  leftSidebar: ReactNode;
  mainContent: ReactNode;
  rightSidebar: ReactNode;
  activeNoteVisible?: boolean;
};

export const ConversationLayout = ({
  header,
  leftSidebar,
  mainContent,
  rightSidebar,
  activeNoteVisible = false,
}: ConversationLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {header}
        </div>
      </header>

      {/* Content area with three columns using relative sizing */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - 1/5 on larger screens, fixed width on small */}
        <div className="w-64 md:w-1/5 max-w-xs flex-shrink-0 bg-gray-850 p-5 flex flex-col border-r border-gray-700 overflow-y-auto">
          {leftSidebar}
        </div>

        {/* Main content area - flexible width based on note visibility */}
        <div className={`flex-1 ${activeNoteVisible ? 'md:w-1/2 lg:w-3/5' : 'md:w-3/5 lg:w-3/5'} flex flex-col overflow-hidden transition-all duration-300`}>
          {mainContent}
        </div>

        {/* Right sidebar - expands to 1/4 or 1/3 when note is visible */}
        <div 
          className={`flex-shrink-0 bg-gray-850 p-5 border-l border-gray-700 overflow-y-auto transition-all duration-300 ease-in-out
            ${activeNoteVisible ? 'w-80 md:w-1/3 lg:w-1/4' : 'w-64 md:w-1/5 lg:w-1/5'}`}
        >
          {rightSidebar}
        </div>
      </div>
    </div>
  );
};

export default ConversationLayout; 