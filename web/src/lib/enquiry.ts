import { site } from "@/content/site";
import { checkEmail, checkName, checkPhone, checkText } from "@/lib/validate";

export const ENQUIRY_TOPICS = ["A company order", "A gift for someone", "Something else"] as const;

export type Enquiry = { name: string; email: string; phone: string; topic: string; message: string };
export type EnquiryErrors = Partial<Record<keyof Enquiry, string>>;

export function checkEnquiry(input: Partial<Enquiry>): { ok: true; enquiry: Enquiry } | { ok: false; errors: EnquiryErrors } {
  const phoneRaw = (input.phone ?? "").trim();
  const results = {
    name: checkName(input.name ?? ""),
    email: checkEmail(input.email ?? ""),
    phone: phoneRaw ? checkPhone(phoneRaw) : ({ ok: true, value: "" } as const),
    topic: ENQUIRY_TOPICS.includes(input.topic as (typeof ENQUIRY_TOPICS)[number])
      ? ({ ok: true, value: input.topic as string } as const)
      : ({ ok: true, value: ENQUIRY_TOPICS[2] } as const),
    message: checkText(input.message ?? "", { label: "a short message", required: true, max: 3000 }),
  };
  const errors: EnquiryErrors = {};
  const enquiry = {} as Enquiry;
  for (const [key, result] of Object.entries(results) as [keyof Enquiry, (typeof results)[keyof Enquiry]][]) {
    if (result.ok) enquiry[key] = result.value;
    else errors[key] = result.message;
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, enquiry };
}

export function enquiryText(e: Enquiry) {
  return [
    `Hello ${site.name},`,
    "",
    e.message,
    "",
    `Name: ${e.name}`,
    `Email: ${e.email}`,
    ...(e.phone ? [`Phone: ${e.phone}`] : []),
    `About: ${e.topic}`,
  ].join("\n");
}
