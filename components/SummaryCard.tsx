import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  color?: 'emerald' | 'red' | 'amber';
}

export const SummaryCard = ({ title, value, icon, onClick, isActive, color = 'emerald' }: SummaryCardProps) => {
  const colorStyles = {
    emerald: {
      ring: "ring-emerald-500 dark:ring-emerald-400",
      iconContainer: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400",
    },
    red: {
      ring: "ring-red-500 dark:ring-red-400",
      iconContainer: "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400",
    },
    amber: {
      ring: "ring-amber-500 dark:ring-amber-400",
      iconContainer: "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400",
    }
  };

  const selectedStyle = colorStyles[color] || colorStyles.emerald;

  return (
    <div 
      className={cn(
        "bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-3 transition-all duration-300 min-w-0",
        onClick && "cursor-pointer hover:shadow-md hover:-translate-y-1",
        isActive && `ring-2 ${selectedStyle.ring}`
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
    >
      <div className={cn("p-2 rounded-full flex-shrink-0", selectedStyle.iconContainer)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate" title={title}>{title}</p>
        <p className="text-xl font-bold text-gray-800 dark:text-gray-100 truncate">{value}</p>
      </div>
    </div>
  );
};
