import { Download } from 'lucide-react';
import { Button } from './button';
import { cn } from "@/lib/utils";

const DownloadButton = ({ onClick, isDarkMode }) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2",
        isDarkMode
          ? "border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      )}
    >
      <Download size={16} />
      Download Report
    </Button>
  );
};

export default DownloadButton; 