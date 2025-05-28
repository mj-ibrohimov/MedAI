import React from 'react';
import Sidebar from './sidebar/Sidebar';

interface LayoutProps {
  header?: React.ReactNode;
  main: React.ReactNode;
  footer?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ header, main, footer }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      {/* Sidebar - Always visible */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Header */}
        {header && (
          <header className="flex-shrink-0 p-3 glass backdrop-blur-lg z-10 border-b border-white/10">
            {header}
          </header>
        )}

        {/* Main Content Area - Takes most space */}
        <main className={`flex-1 overflow-hidden p-4 bg-transparent min-h-0 ${footer ? '' : 'pb-6'}`}>
          {main}
        </main>

        {/* Footer - Only shown when provided (articles for new chats) */}
        {footer && (
          <footer className="flex-shrink-0 h-64 overflow-y-auto p-4 glass backdrop-blur-lg border-t border-white/10 bg-black/20 animate-fade-in">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};

export default Layout;