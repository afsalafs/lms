import { useEffect, useState } from "react";

export function useTypewriter(text: string, speedMs = 35) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
    const id = setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          clearInterval(id);
          return c;
        }
        return c + 1;
      });
    }, speedMs);
    return () => clearInterval(id);
  }, [text, speedMs]);

  return text.slice(0, count);
}