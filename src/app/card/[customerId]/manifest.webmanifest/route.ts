import { createClient } from "@/lib/supabase/server";

export async function GET(_req: Request, { params }: { params: Promise<{ customerId: string }> }) {
  const { customerId } = await params;
  let name = "Loyalty card";
  if (/^[0-9a-f-]{36}$/i.test(customerId)) {
    const supabase = await createClient();
    const { data } = await supabase.rpc("get_card", { p_customer_id: customerId }).single<{ business_name: string }>();
    if (data) name = data.business_name;
  }
  return Response.json(
    {
      name,
      short_name: name.slice(0, 12),
      start_url: `/card/${customerId}`,
      scope: "/card/",
      display: "standalone",
      background_color: "#F7F8F5",
      theme_color: "#0F8B6D",
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json" } }
  );
}
