const useAppNavigation = () => {
  const navigateToRoute = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.location.reload();
  };

  return { navigateToRoute };
};

export default useAppNavigation;