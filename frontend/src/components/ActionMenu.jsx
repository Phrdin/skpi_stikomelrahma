import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

const ActionMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
      >
        <MoreVertical size={18} />
      </button>
      
      {isOpen && (
        <div className="absolute right-1/2 translate-x-1/2 md:translate-x-0 md:right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl z-50 border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
          <div className="py-1 flex flex-col items-stretch">
            {React.Children.map(children, child => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, {
                  className: `${child.props.className || ''} w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors text-[10px] font-black uppercase tracking-wider block border-none rounded-none bg-transparent shadow-none !min-w-0 !justify-start`,
                  onClick: (e) => {
                    if (child.props.onClick) child.props.onClick(e);
                    setIsOpen(false);
                  }
                });
              }
              return child;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
