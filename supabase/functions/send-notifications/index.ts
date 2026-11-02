import { serve } from "https://deno.land/std@0.200.0/http/server.ts";

serve(async (req) => {
  try {
    const projectId = Deno.env.get("FCM_PROJECT_ID");
    const clientEmail = Deno.env.get("FCM_CLIENT_EMAIL");
    const privateKey = Deno.env.get("FCM_PRIVATE_KEY");

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error("Missing Firebase credentials");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Firebase credentials loaded successfully",
        projectId,
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});