import { site } from "@/lib/site/config";

/** Shape returned by every template: subject + html + text. */
export type EmailContent = {
  subject: string;
  html: string;
  text: string;
};

function layout(inner: string): string {
  return `<!doctype html><html><body style="margin:0;background:#0B0B0C;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#F6F6F7">
    <div style="max-width:560px;margin:0 auto;border:1px solid #33353B;padding:28px">
      <p style="margin:0 0 20px;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#8C8F97">${site.name}</p>
      ${inner}
    </div>
  </body></html>`;
}

/** A contact-form submission, sent to the gym's inbox. */
export function contactMessageEmail(input: {
  name: string;
  email: string;
  message: string;
}): EmailContent {
  const safe = (s: string) => s.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return {
    subject: `New enquiry from ${input.name}`,
    html: layout(
      `<h1 style="margin:0 0 16px;font-size:20px;color:#F6F6F7">New website enquiry</h1>
       <p style="margin:0 0 6px;color:#B4B6BC"><strong>Name:</strong> ${safe(input.name)}</p>
       <p style="margin:0 0 6px;color:#B4B6BC"><strong>Email:</strong> ${safe(input.email)}</p>
       <p style="margin:16px 0 6px;color:#B4B6BC"><strong>Message:</strong></p>
       <p style="margin:0;white-space:pre-wrap;color:#F6F6F7">${safe(input.message)}</p>`,
    ),
    text: `New website enquiry\n\nName: ${input.name}\nEmail: ${input.email}\n\n${input.message}`,
  };
}
