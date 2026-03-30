import { useState, useEffect } from 'react';

export function useCountdown(targetDate: string) {
  const [days, setDays] = useState<number>(0);

  useEffect(() => {
    const calc = () => {
      const diff = Math.ceil((new Date(targetDate).getTime() - Date.now()) / 86400000);
      setDays(Math.max(0, diff));
    };
    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, [targetDate]);

  return days;
}
