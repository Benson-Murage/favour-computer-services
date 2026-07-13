import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getBusinessSettings } from "./settings.functions";

export type BusinessSettings = {
  company_name: string;
  business_description: string | null;
  tagline: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  till_number: string | null;
  paybill_number: string | null;
  account_number: string | null;
  payment_instructions: string | null;
  pickup_location: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
  whatsapp_url: string | null;
  sender_name: string | null;
  sender_email: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_cta_primary_label: string | null;
  hero_cta_primary_url: string | null;
  hero_cta_secondary_label: string | null;
  hero_cta_secondary_url: string | null;
  about_story: string | null;
  about_mission: string | null;
  about_vision: string | null;
  contact_hours: string | null;
  signature_url: string | null;
  stamp_url: string | null;
  signatory_name: string | null;
  signatory_title: string | null;
  google_maps_url: string | null;
  bank_name: string | null;
  bank_account: string | null;
  website_url: string | null;
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
