import { Download } from 'lucide-react';
import { Button } from './button';

const DownloadButton = ({ onClick, isDarkMode }) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={`
        flex items-center gap-2
        ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'}
      `}
    >
      <Download size={16} />
      Download Report
    </Button>
  );
};

export default DownloadButton; 