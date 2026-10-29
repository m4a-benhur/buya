import { waLink } from "@/lib/whatsapp";

export default function WhatsAppButton({ phone, message }: { phone: string; message: string }) {
  return (
    <a href={waLink(phone, message)} target="_blank" rel="noopener noreferrer"
      className="btn-ghost mt-2 min-h-[44px] px-4 text-sm">
      Remind on WhatsApp
    </a>
  );
}
