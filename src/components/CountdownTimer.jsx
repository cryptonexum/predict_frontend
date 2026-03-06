import { useEffect, useState } from "react";

export default function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const calculateTime = () => {
      const now = Date.now();
      const distance = new Date(targetDate).getTime() - now;

      if (distance < 0) return { expired: true };

      return {
        d: Math.floor(distance / (1000 * 60 * 60 * 24)),
        h: Math.floor((distance / (1000 * 60 * 60)) % 24),
        m: Math.floor((distance / (1000 * 60)) % 60),
        s: Math.floor((distance / 1000) % 60),
        expired: false,
      };
    };

    setTimeLeft(calculateTime());

    const interval = setInterval(() => {
      const updated = calculateTime();
      setTimeLeft(updated);
      if (updated.expired) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) return null;
  if (timeLeft.expired) return <span className="text-red-500 text-xs">Ended</span>;

  return (
    <span className="text-xs text-slate-400 font-mono">
      {timeLeft.d > 0 && `${timeLeft.d}d `}
      {timeLeft.h}h {timeLeft.m}m {timeLeft.s}s
    </span>
  );
}