import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical } from 'lucide-react';

const ActionMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current && !menuRef.current.contains(event.target) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    
    const handleScroll = () => {
      if (isOpen) setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true); // Use capture phase to catch all scrolls
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!isOpen) {
      const rect = menuRef.current.getBoundingClientRect();
      // Calculate position relative to viewport. width is 12rem = 192px
      // We align the right edge of the dropdown with the right edge of the button
      setCoords({
        top: rect.bottom,
        left: rect.right - 192
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button 
        type="button"
        onClick={handleToggle} 
        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
      >
        <MoreVertical size={18} />
      </button>
      
      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          style={{ top: coords.top + 8, left: coords.left }}
          className="fixed w-48 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] z-[9999] border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right"
        >
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
        </div>,
        document.body
      )}
    </div>
  );
};

export default ActionMenu;
