export const setupAutoLogout = (navigate) => {
  let timeout;

  const logout = () => {
    localStorage.removeItem('token');
    alert('Session expired due to inactivity');
    navigate('/');
  };

  const resetTimer = () => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(logout, 60 * 60 * 1000); // 1 hour
  };

  ['mousemove', 'keydown', 'mousedown', 'touchstart'].forEach(event =>
    window.addEventListener(event, resetTimer)
  );

  resetTimer();
};
