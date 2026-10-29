// Builds a wa.me link that opens the OWNER'S OWN WhatsApp with a drafted message.
// Buya never sends anything itself.
export function waLink(phone: string, message: string): string {
  let d = phone.replace(/[^\d+]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  else if (d.startsWith("00")) d = d.slice(2);
  else if (d.startsWith("0")) d = "27" + d.slice(1); // South African local format
  return `https://wa.me/${d}?text=${encodeURIComponent(message)}`;
}
