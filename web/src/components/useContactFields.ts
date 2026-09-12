"use client";

import { useCallback, useState } from "react";

import { checkEmail, checkPhone, suggestEmail, type FieldResult } from "@/lib/validate";

/**
 * Email and phone checking as the customer types: errors appear once they
 * leave the field (or on submit), and a green tick confirms a good value.
 */
export function useContactFields({ phoneRequired = true }: { phoneRequired?: boolean } = {}) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState({ email: false, phone: false });

  const emailResult: FieldResult = checkEmail(email);
  const phoneResult: FieldResult = !phoneRequired && !phone.trim() ? { ok: true, value: "" } : checkPhone(phone);
  const suggestion = emailResult.ok ? suggestEmail(email) : null;

  const touchAll = useCallback(() => setTouched({ email: true, phone: true }), []);

  return {
    email,
    phone,
    setEmail,
    setPhone,
    suggestion,
    blurEmail: () => setTouched((t) => ({ ...t, email: true })),
    blurPhone: () => setTouched((t) => ({ ...t, phone: true })),
    touchAll,
    emailError: touched.email && !emailResult.ok ? emailResult.message : undefined,
    phoneError: touched.phone && !phoneResult.ok ? phoneResult.message : undefined,
    emailOk: emailResult.ok && email.trim() ? "Looks right." : undefined,
    phoneOk: phoneResult.ok && phone.trim() ? `We'll use ${phoneResult.value}.` : undefined,
  };
}
