import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getBusinessSettings } from "./settings.functions";

export type BusinessSettings = {
  company_name: string;
  business_description: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  till_number: string | null;
  paybill_number: string | null;
  account_number: string | null;
  payment_instructions: string | null;
  pickup_location: string | null;
};

export function useBusinessSettings() {
  const fn = useServerFn(getBusinessSettings);
  const q = useQuery({
    queryKey: ["public", "settings"],
    queryFn: () => fn({}),
    staleTime: 60_000,
  });
  return (q.data ?? null) as BusinessSettings | null;
}