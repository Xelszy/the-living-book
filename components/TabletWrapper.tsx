import React from 'react';

interface TabletWrapperProps {
  children: React.ReactNode;
}

export const TabletWrapper: React.FC<TabletWrapperProps> = ({ children }) => {
  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-[#1e1b4b]">
       {children}
    </div>
  );
};