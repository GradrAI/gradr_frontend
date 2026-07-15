import { useEffect, useRef, useState } from "react";
import useStore from "@/state";
import api from "@/lib/axios";

export const usePaymentRail = () => {
  const { selectedRail, setSelectedRail } = useStore();
  const [rails, setRails] = useState<string[]>(["paystack_ngn", "creem_usd"]);
  const [country, setCountry] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const hasDetected = useRef(false);

  useEffect(() => {
    if (hasDetected.current) return;
    hasDetected.current = true;

    async function detectRail() {
      setIsLoading(true);
      let detectedCountry = null;
      
      try {
        // Fetch geo country from the frontend Origin Edge function
        const geoRes = await fetch("/api/geo");
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          detectedCountry = geoData.country;
          setCountry(detectedCountry);
        }
      } catch (err) {
        console.error("Failed to fetch geo country:", err);
      }

      try {
        const res = await api.get("/payment/rails", {
          params: { country: detectedCountry }
        });

        if (res.data && res.data.success) {
          setRails(res.data.rails || ["paystack_ngn", "creem_usd"]);
          // Only set rail if not manually selected yet
          const currentRail = useStore.getState().selectedRail;
          if (!currentRail) {
            setSelectedRail(res.data.default || "creem_usd");
          }
        }
      } catch (err) {
        console.error("Failed to fetch rails from backend:", err);
        const currentRail = useStore.getState().selectedRail;
        if (!currentRail) {
          setSelectedRail("creem_usd"); // Fallback default
        }
      } finally {
        setIsLoading(false);
      }
    }

    detectRail();
  }, [setSelectedRail]);

  return {
    selectedRail,
    setSelectedRail,
    rails,
    country,
    isLoading
  };
};
