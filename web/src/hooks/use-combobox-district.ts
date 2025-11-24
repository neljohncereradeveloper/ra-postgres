import { useState, useEffect } from "react";
import { districtsApi } from "@/lib/api/district";
import { IComboboxProps } from "@/types/shared";

export const useComboboxDistrict = () => {
  const [data, setData] = useState<IComboboxProps[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const districts = await districtsApi.getComboboxDistricts();
        setData(districts);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch districts")
        );
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
};
