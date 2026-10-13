import { createServerFn } from "@tanstack/react-start";

import { enquirySchema, type EnquiryInput } from "@/lib/enquiry";

function oneLine(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function buildEmail(data: EnquiryInput) {
  const name = oneLine(data.name);
  const email = oneLine(data.email);
  const phone = data.phone ? oneLine(data.phone) : "Not provided";
  const course = oneLine(data.course);
  const message = data.message?.trim() || "No message";

  return {
    subject: `EduBerg enquiry: ${course} — ${name}`,
    text: [
      "New enquiry from the EduBerg website.",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Course: ${course}`,
      "",
      "Message:",
      message,
    ].join("\n"),
    replyTo: email,
    fromName: name,
  };
}

function getMailConfig() {
  const to = process.env.ENQUIRY_TO_EMAIL?.trim();
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!to || !host || !user || !pass || !Number.isFinite(port)) {
    throw new Error("Enquiry email is not configured.");
  }

  return { to, host, port, user, pass };
}

export const submitEnquiry = createServerFn({ method: "POST" })
  .validator(enquirySchema)
  .handler(async ({ data }) => {
    try {
      const config = getMailConfig();
      const email = buildEmail(data);
      const nodemailer = await import("nodemailer");
      const createTransport = nodemailer.createTransport ?? nodemailer.default.createTransport;

      const transporter = createTransport({
        host: config.host,
        port: config.port,
        secure: config.port === 465,
        auth: { user: config.user, pass: config.pass },
      });

      await transporter.sendMail({
        from: `"${email.fromName} via EduBerg" <${config.user}>`,
        to: config.to,
        replyTo: email.replyTo,
        subject: email.subject,
        text: email.text,
      });
    } catch (error) {
      console.error("Failed to send enquiry email", error);
      throw new Error("We could not send your enquiry. Please try again.");
    }

    return { ok: true as const };
});