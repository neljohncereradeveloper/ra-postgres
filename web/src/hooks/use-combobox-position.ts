import { useState, useEffect } from "react";
import { positionsApi } from "@/lib/api/position";
import { IComboboxProps } from "@/types/shared";

export const useComboboxPosition = () => {
  const [data, setData] = useState<IComboboxProps[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const positions = await positionsApi.getComboboxPositions();
        setData(positions);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch positions")
        );
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
};
