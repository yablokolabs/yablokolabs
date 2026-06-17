"use client";

import { FormEvent, useState } from "react";
import { trackSiteEvent } from "./analytics";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/meewwowj";

export default function AiAgentsLeadForm() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") ?? "");
    const company = String(formData.get("company") ?? "");
    const phone = String(formData.get("phone") ?? "");
    const industry = String(formData.get("industry") ?? "");
    const email = String(formData.get("email") ?? "");

    trackSiteEvent("ai_agents_consultation_request", {
      company,
      industry,
      hasPhone: Boolean(phone),
    });

    setIsSubmitting(true);
    setSubmitted(false);
    setErrorMessage("");

    formData.append("_subject", `AI Agents Consultation Request - ${company || name || "Yabloko Labs"}`);
    formData.append("_replyto", email);

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Formspree submission failed with status ${response.status}`);
      }

      trackSiteEvent("ai_agents_consultation_success", {
        company,
        industry,
      });

      form.reset();
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      trackSiteEvent("ai_agents_consultation_error", {
        company,
        industry,
      });
      setErrorMessage("Submission failed. Please try again or email support@yablokolabs.com.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="lead-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label className="form-field">
          <span>Name</span>
          <input type="text" name="name" autoComplete="name" required />
        </label>
        <label className="form-field">
          <span>Company</span>
          <input type="text" name="company" autoComplete="organization" required />
        </label>
        <label className="form-field">
          <span>Email</span>
          <input type="email" name="email" autoComplete="email" required />
        </label>
        <label className="form-field">
          <span>Phone Number</span>
          <input type="tel" name="phone" autoComplete="tel" />
        </label>
        <label className="form-field form-field-full">
          <span>Industry</span>
          <input type="text" name="industry" autoComplete="organization-title" />
        </label>
        <label className="form-field form-field-full">
          <span>What would you like an AI Agent to do?</span>
          <textarea name="challenge" rows={6} required />
        </label>
      </div>
      <button type="submit" className="btn btn-primary">
        {isSubmitting ? "Submitting..." : "Request Consultation"}
      </button>
      <p className="form-help">Tell us your business challenge and we&apos;ll show you how AI Agents can help.</p>
      {errorMessage && (
        <p className="form-help" role="alert">
          {errorMessage}
        </p>
      )}
      {submitted && (
        <p className="form-help" role="status">
          Consultation request sent. Our team will review it and get back to you.
        </p>
      )}
    </form>
  );
}
