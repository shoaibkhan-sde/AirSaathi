import React from 'react';

export const BackgroundLeaves: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none z-0 overflow-hidden"
    >
      {/* Top Left Leaf Cluster */}
      <svg
        className="absolute -top-6 -left-6 w-44 h-44 md:w-60 md:h-60 text-[#85CAA8] dark:text-[#2A5243] opacity-60 dark:opacity-40 transition-all"
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main leaf 1 */}
        <path
          d="M0 60C45 40 90 60 115 105C90 120 45 110 0 60Z"
          fill="currentColor"
          fillOpacity="0.55"
        />
        <path d="M0 60Q65 75 115 105" stroke="currentColor" strokeWidth="2" strokeOpacity="0.7" />
        {/* Leaf 2 */}
        <path
          d="M30 0C65 30 75 80 50 115C25 90 20 40 30 0Z"
          fill="currentColor"
          fillOpacity="0.65"
        />
        <path d="M30 0Q55 50 50 115" stroke="currentColor" strokeWidth="2" strokeOpacity="0.7" />
        {/* Leaf 3 (smaller) */}
        <path
          d="M10 110C40 100 70 120 85 155C65 165 30 150 10 110Z"
          fill="currentColor"
          fillOpacity="0.45"
        />
      </svg>

      {/* Top Right Leaf Cluster */}
      <svg
        className="absolute -top-6 -right-6 w-44 h-44 md:w-60 md:h-60 text-[#85CAA8] dark:text-[#2A5243] opacity-60 dark:opacity-40 transition-all"
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main leaf 1 */}
        <path
          d="M240 60C195 40 150 60 125 105C150 120 195 110 240 60Z"
          fill="currentColor"
          fillOpacity="0.55"
        />
        <path
          d="M240 60Q175 75 125 105"
          stroke="currentColor"
          strokeWidth="2"
          strokeOpacity="0.7"
        />
        {/* Leaf 2 */}
        <path
          d="M210 0C175 30 165 80 190 115C215 90 220 40 210 0Z"
          fill="currentColor"
          fillOpacity="0.65"
        />
        <path d="M210 0Q185 50 190 115" stroke="currentColor" strokeWidth="2" strokeOpacity="0.7" />
        {/* Leaf 3 */}
        <path
          d="M230 110C200 100 170 120 155 155C175 165 210 150 230 110Z"
          fill="currentColor"
          fillOpacity="0.45"
        />
      </svg>

      {/* Bottom Left Leaf Cluster */}
      <svg
        className="absolute -bottom-6 -left-6 w-44 h-44 md:w-64 md:h-64 text-[#85CAA8] dark:text-[#2A5243] opacity-60 dark:opacity-40 transition-all"
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main leaf 1 */}
        <path
          d="M0 180C45 200 90 180 115 135C90 120 45 130 0 180Z"
          fill="currentColor"
          fillOpacity="0.55"
        />
        <path d="M0 180Q65 165 115 135" stroke="currentColor" strokeWidth="2" strokeOpacity="0.7" />
        {/* Leaf 2 */}
        <path
          d="M30 240C65 210 75 160 50 125C25 150 20 200 30 240Z"
          fill="currentColor"
          fillOpacity="0.65"
        />
        <path d="M30 240Q55 190 50 125" stroke="currentColor" strokeWidth="2" strokeOpacity="0.7" />
        {/* Leaf 3 */}
        <path
          d="M10 130C40 140 70 120 85 85C65 75 30 90 10 130Z"
          fill="currentColor"
          fillOpacity="0.45"
        />
      </svg>

      {/* Bottom Right Leaf Cluster */}
      <svg
        className="absolute -bottom-6 -right-6 w-44 h-44 md:w-64 md:h-64 text-[#85CAA8] dark:text-[#2A5243] opacity-60 dark:opacity-40 transition-all"
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main leaf 1 */}
        <path
          d="M240 180C195 200 150 180 125 135C150 120 195 130 240 180Z"
          fill="currentColor"
          fillOpacity="0.55"
        />
        <path
          d="M240 180Q175 165 125 135"
          stroke="currentColor"
          strokeWidth="2"
          strokeOpacity="0.7"
        />
        {/* Leaf 2 */}
        <path
          d="M210 240C175 210 165 160 190 125C215 150 220 200 210 240Z"
          fill="currentColor"
          fillOpacity="0.65"
        />
        <path
          d="M210 240Q185 190 190 125"
          stroke="currentColor"
          strokeWidth="2"
          strokeOpacity="0.7"
        />
        {/* Leaf 3 */}
        <path
          d="M230 130C200 140 170 120 155 85C175 75 210 90 230 130Z"
          fill="currentColor"
          fillOpacity="0.45"
        />
      </svg>
    </div>
  );
};
