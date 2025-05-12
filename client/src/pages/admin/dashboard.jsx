import ErrorBoundary from '@/components/Admin/ErrorBoundary';

const AdminDashboard = () => {
  return (
    <ErrorBoundary>
      <Overview isDarkMode={isDarkMode} />
    </ErrorBoundary>
  );
}; 