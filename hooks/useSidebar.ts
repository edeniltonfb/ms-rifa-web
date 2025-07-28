// components/useSidebar.ts
import { useEffect, useState } from 'react';

export function useSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setCollapsed(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggle = () => setCollapsed(prev => !prev);
  const close = () => isMobile && setCollapsed(true);
  const open = () => setCollapsed(false);

  return { collapsed, isMobile, toggle, close, open };
}
