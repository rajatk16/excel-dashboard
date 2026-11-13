import { Outlet, useNavigation } from 'react-router-dom';

export const RootLayout = () => {
  const navigation = useNavigation();

  const isNavigating = navigation.state !== 'idle';

  return (
    <>
      {isNavigating && (
        <div
          role="status"
          aria-label="Loading page"
          className="fixed inset-x-0 top-0 z-100 h-0.5 overflow-hidden bg-primary/20"
        >
          <div className="h-full w-1/2 animate-pulse bg-primary" />
        </div>
      )}

      <Outlet />
    </>
  );
};
