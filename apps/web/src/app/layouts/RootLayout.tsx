import { Outlet, useNavigation } from "react-router-dom"

export const RootLayout = () => {
  const navigation = useNavigation();

  const isNavigating = navigation.state !== 'idle';

  return (
    <>
      {isNavigating && (
        <div
          className="navigation-progress" role="status" aria-label="Loading page"
        />
      )}
      <Outlet />
    </>
  )
}
