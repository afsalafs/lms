function env(name: string) {
    const value = import.meta.env[name];
    return typeof value === "string" ? value.trim() : "";
  }
  
  export function telHref(phone: string) {
    return `tel:${phone.replace(/[^\d+]/g, "")}`;
  }
  
  export const site = {
    email: env("VITE_CONTACT_EMAIL"),
    phones: [env("VITE_CONTACT_PHONE_1"), env("VITE_CONTACT_PHONE_2")].filter(Boolean),
    socials: [
      { id: "linkedin" as const, label: "LinkedIn", href: env("VITE_SOCIAL_LINKEDIN") },
      { id: "instagram" as const, label: "Instagram", href: env("VITE_SOCIAL_INSTAGRAM") },
      { id: "facebook" as const, label: "Facebook", href: env("VITE_SOCIAL_FACEBOOK") },
    ],
};