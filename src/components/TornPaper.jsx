import React from 'react';

const tornEdges = {
  top: "polygon(0% 8px, 3% 2px, 7% 6px, 12% 1px, 18% 5px, 24% 0px, 31% 4px, 38% 1px, 45% 6px, 52% 2px, 58% 5px, 65% 0px, 72% 3px, 78% 6px, 85% 1px, 91% 4px, 96% 2px, 100% 6px, 100% 100%, 0% 100%)",
  bottom: "polygon(0% 0%, 100% 0%, 100% calc(100% - 6px), 97% calc(100% - 2px), 92% calc(100% - 5px), 86% 100%, 79% calc(100% - 4px), 73% calc(100% - 1px), 66% calc(100% - 6px), 59% calc(100% - 2px), 52% calc(100% - 5px), 45% 100%, 38% calc(100% - 3px), 31% calc(100% - 6px), 24% calc(100% - 1px), 17% calc(100% - 4px), 10% calc(100% - 2px), 4% calc(100% - 5px), 0% calc(100% - 3px))",
  both: "polygon(0% 8px, 3% 2px, 7% 6px, 12% 1px, 18% 5px, 24% 0px, 31% 4px, 38% 1px, 45% 6px, 52% 2px, 58% 5px, 65% 0px, 72% 3px, 78% 6px, 85% 1px, 91% 4px, 96% 2px, 100% 6px, 100% calc(100% - 6px), 97% calc(100% - 2px), 92% calc(100% - 5px), 86% 100%, 79% calc(100% - 4px), 73% calc(100% - 1px), 66% calc(100% - 6px), 59% calc(100% - 2px), 52% calc(100% - 5px), 45% 100%, 38% calc(100% - 3px), 31% calc(100% - 6px), 24% calc(100% - 1px), 17% calc(100% - 4px), 10% calc(100% - 2px), 4% calc(100% - 5px), 0% calc(100% - 3px))",
  left: "polygon(6px 0%, 2px 4%, 5px 10%, 0px 17%, 4px 25%, 1px 33%, 6px 42%, 2px 51%, 5px 60%, 0px 68%, 3px 76%, 6px 84%, 1px 92%, 4px 97%, 100% 100%, 100% 0%)",
  right: "polygon(0% 0%, 0% 100%, calc(100% - 4px) 97%, calc(100% - 1px) 92%, calc(100% - 6px) 84%, 100% 76%, calc(100% - 3px) 68%, 100% 60%, calc(100% - 5px) 51%, calc(100% - 2px) 42%, calc(100% - 6px) 33%, 100% 25%, calc(100% - 4px) 17%, calc(100% - 1px) 10%, calc(100% - 5px) 4%, calc(100% - 2px) 0%)"
};

export default function TornPaper({ 
  children, 
  variant = 'both', 
  className = '', 
  bgColor = '#FFFFFF',
  rotate = 0,
  style = {}
}) {
  return (
    <div 
      className={`relative ${className}`}
      style={{
        clipPath: tornEdges[variant] || tornEdges.both,
        backgroundColor: bgColor,
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        ...style
      }}
    >
      {children}
    </div>
  );
}