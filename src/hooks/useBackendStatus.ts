import { useEffect, useState } from "react";

export const useBackendStatus = () => {
  const [online, setOnline] = useState(false);

  async function checkBackend() {
    try {
      const res = await fetch("http://localhost:5000/ping", { mode: "cors" });
      if (!res.ok) throw new Error("HTTP não OK");
      const data = await res.json();

      if (data.status === "ok") {
        setOnline(true);
      } else {
        setOnline(false);
      }
    } catch (e) {
      setOnline(false);
    }
  }

  useEffect(() => {
    checkBackend();                      
    const timer = setInterval(checkBackend, 10000); 
    return () => clearInterval(timer);
  }, []);

  return { online };
};