import { env } from "@/env";

function generateUniqueId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export async function sendEmail({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}) {
  const uniqueId = generateUniqueId();

  const response = await fetch("https://next-api.useplunk.com/v1/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.PLUNK_API_KEY}`,
    },
    body: JSON.stringify({
      to,
      subject,
      body,
      from: `no-reply@${env.PLUNK_EMAIL}`,
      headers: {
        "X-Entity-Ref-ID": uniqueId,
      },
    }),
  });

  const data = (await response.json()) as {
    success: boolean;
    error?: { code: string; message: string };
    data?: unknown;
  };

  if (!data.success) {
    throw new Error(
      `[${data.error?.code}] ${data.error?.message ?? response.statusText}`
    );
  }

  return data.data;
}
