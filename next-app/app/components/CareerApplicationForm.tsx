"use client";

import { FormEvent, useRef, useState } from "react";
import { trackSiteEvent } from "./analytics";

// Cloudflare Worker in workers/careers-form. Override with
// NEXT_PUBLIC_CAREERS_FORM_ENDPOINT when deploying the worker elsewhere
// (e.g. its <account>.workers.dev URL).
const APPLY_ENDPOINT =
  process.env.NEXT_PUBLIC_CAREERS_FORM_ENDPOINT ?? "https://careers-form.yablokolabs.com";
const MAX_CV_BYTES = 5 * 1024 * 1024;

export default function CareerApplicationForm() {
  const [fileName, setFileName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = () => {
    const file = fileInputRef.current?.files?.[0];
    setFileName(file?.name ?? "");
    setErrorMessage(
      file && file.size > MAX_CV_BYTES ? "Your CV is over 5 MB. Please attach a smaller file." : "",
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;

    // Browsers ignore autocomplete="off" on fields whose name looks like a
    // profile field, and this one is named to attract bots, so managers fill it
    // for real applicants. Clear it on the way out: anyone using the form never
    // typed into it, while bots posting the fields directly still trip the
    // worker's check.
    const honeypot = form.elements.namedItem("hp_check");
    if (honeypot instanceof HTMLInputElement) {
      honeypot.value = "";
    }

    const formData = new FormData(form);
    const contact = String(formData.get("contact") ?? "");
    const role = String(formData.get("role") ?? "");
    const cv = formData.get("cv");
    const hasCv = cv instanceof File && cv.size > 0;

    trackSiteEvent("careers_application_submit", {
      role,
      hasCv,
      hasContact: Boolean(contact),
    });

    setSubmitted(false);
    setErrorMessage("");

    if (!hasCv) {
      setErrorMessage("Please attach your CV so we can read it.");
      return;
    }

    if (cv instanceof File && cv.size > MAX_CV_BYTES) {
      setErrorMessage("Your CV is over 5 MB. Please attach a smaller file.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(APPLY_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        // The worker sends a readable reason alongside its status code. Only
        // that reason is shown to the applicant; transport failures are not.
        const detail = await response.json().catch(() => null);
        const reason: unknown = detail?.error;
        if (typeof reason === "string" && reason) {
          throw Object.assign(new Error(reason), { userFacing: true });
        }
        throw new Error(`Application submission failed with status ${response.status}`);
      }

      trackSiteEvent("careers_application_success", { role });

      form.reset();
      setFileName("");
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      trackSiteEvent("careers_application_error", { role });
      const userFacing = error instanceof Error && "userFacing" in error;
      setErrorMessage(
        userFacing
          ? `${(error as Error).message}. You can also email career@yablokolabs.com.`
          : "Submission failed. Please try again or email career@yablokolabs.com.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="lead-form career-apply-form" onSubmit={handleSubmit} encType="multipart/form-data">
      <div className="form-grid">
        {/* Honeypot: hidden from people, filled by naive bots. */}
        <input
          type="text"
          name="hp_check"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="career-honeypot"
        />
        <label className="form-field">
          <span>Name</span>
          <input type="text" name="name" autoComplete="name" required />
        </label>
        <label className="form-field">
          <span>Email</span>
          <input type="email" name="email" autoComplete="email" required />
        </label>
        <label className="form-field">
          <span>Contact</span>
          <input type="tel" name="contact" autoComplete="tel" required />
        </label>
        <label className="form-field">
          <span>Role</span>
          <select name="role" defaultValue="" required>
            <option value="" disabled>
              Select a role
            </option>
            <option value="Sales Shark">Sales Shark — New Business</option>
            <option value="Apple Platforms Engineer">Apple Platforms Engineer</option>
          </select>
        </label>

        <div className="form-field form-field-full">
          <span>CV</span>
          <input
            ref={fileInputRef}
            id="career-cv"
            className="career-file-input"
            type="file"
            name="cv"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
          />
          <div className="career-file-row">
            <label htmlFor="career-cv" className="btn btn-outline career-file-button">
              Attach CV
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </label>
            <p className="form-help">{fileName || "PDF, DOC or DOCX up to 5 MB"}</p>
          </div>
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Application"}
      </button>
      <p className="form-help">
        We read every application personally and reply to everyone who sends a CV.
      </p>
      {errorMessage && (
        <p className="form-help" role="alert">
          {errorMessage}
        </p>
      )}
      {submitted && (
        <p className="form-help" role="status">
          Application sent. We will read your CV and get back to you.
        </p>
      )}
    </form>
  );
}
