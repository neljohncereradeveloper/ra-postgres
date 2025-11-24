import { useState, useEffect } from "react";
import { IComboboxProps } from "@/types/shared";
import { precinctsApi } from "@/lib/api/precincts";

export const useComboboxPrecincts = () => {
  const [data, setData] = useState<IComboboxProps[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const precincts = await precinctsApi.getComboboxPrecincts();
        setData(precincts);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch precincts")
        );
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
};
