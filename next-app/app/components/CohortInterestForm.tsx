"use client";

import { FormEvent, useState } from "react";
import { trackSiteEvent } from "./analytics";

// Cloudflare Worker in workers/cohort-form. Override with
// NEXT_PUBLIC_COHORT_FORM_ENDPOINT when deploying the worker elsewhere
// (e.g. its <account>.workers.dev URL).
const INTEREST_ENDPOINT =
  process.env.NEXT_PUBLIC_COHORT_FORM_ENDPOINT ?? "https://cohort-form.yablokolabs.com";

export default function CohortInterestForm() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const stage = String(formData.get("stage") ?? "");
    const hours = String(formData.get("hours") ?? "");
    const built = String(formData.get("built") ?? "").trim();

    // Browsers autofill fields whose names look like profile fields, so clear
    // the honeypot on the way out. Anyone using the form never typed into it,
    // while bots posting the fields directly still trip the worker's check.
    const honeypot = form.elements.namedItem("hp_check");
    if (honeypot instanceof HTMLInputElement) {
      honeypot.value = "";
    }

    trackSiteEvent("cohort_interest_submit", { stage, hours, builtLength: built.length });

    setSubmitted(false);
    setErrorMessage("");

    if (built.length < 10) {
      setErrorMessage("Tell us a little more about what you have built — two lines is enough.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(INTEREST_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        // The worker sends a readable reason alongside its status code. Only
        // that reason is shown; transport failures are not.
        const detail = await response.json().catch(() => null);
        const reason: unknown = detail?.error;
        if (typeof reason === "string" && reason) {
          throw Object.assign(new Error(reason), { userFacing: true });
        }
        throw new Error(`Cohort interest submission failed with status ${response.status}`);
      }

      trackSiteEvent("cohort_interest_success", { stage, hours });

      form.reset();
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      trackSiteEvent("cohort_interest_error", { stage, hours });
      const userFacing = error instanceof Error && "userFacing" in error;
      setErrorMessage(
        userFacing
          ? `${(error as Error).message}. You can also email cohort@yablokolabs.com.`
          : "Submission failed. Please try again or email cohort@yablokolabs.com.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="lead-form cohort-interest-form" onSubmit={handleSubmit} encType="multipart/form-data">
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
          <input type="text" name="name" autoComplete="name" maxLength={120} required />
        </label>
        <label className="form-field">
          <span>Email</span>
          <input type="email" name="email" autoComplete="email" maxLength={254} required />
        </label>
        <label className="form-field">
          <span>Country</span>
          <input
            type="text"
            name="country"
            autoComplete="country-name"
            maxLength={80}
            placeholder="Where you are based"
            required
          />
        </label>
        <label className="form-field">
          <span>Where you are now</span>
          <select name="stage" defaultValue="" required>
            <option value="" disabled>
              Select one
            </option>
            <option value="Final-year student">Final-year student</option>
            <option value="Recent graduate">Recent graduate (within 2 years)</option>
            <option value="Early-career developer">Early-career developer</option>
            <option value="Other">Other</option>
          </select>
        </label>
        <label className="form-field form-field-full">
          <span>GitHub, portfolio, or LinkedIn (optional)</span>
          <input
            type="url"
            name="link"
            inputMode="url"
            maxLength={300}
            placeholder="https://github.com/your-handle"
          />
        </label>
        <label className="form-field form-field-full">
          <span>What have you built?</span>
          <textarea
            name="built"
            rows={5}
            minLength={10}
            maxLength={1200}
            placeholder="A link and two lines is enough — a small app, a course project, a script you use."
            required
          />
        </label>
        <label className="form-field form-field-full">
          <span>Time you can commit each week</span>
          <select name="hours" defaultValue="" required>
            <option value="" disabled>
              Select one
            </option>
            <option value="Under 5 hours">Under 5 hours</option>
            <option value="5–10 hours">5–10 hours</option>
            <option value="10–15 hours">10–15 hours</option>
            <option value="15+ hours">15+ hours</option>
          </select>
        </label>
      </div>

      <label className="form-checkbox">
        <input type="checkbox" name="consent" value="yes" required />
        <span>
          I agree to be contacted about the cohort. Registering interest is free and does not commit me
          to joining or paying.
        </span>
      </label>

      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Register Interest"}
      </button>
      <p className="form-help">
        No CV needed at this stage. If we move to a formal application, we will ask for one then.
      </p>
      {errorMessage && (
        <p className="form-help" role="alert">
          {errorMessage}
        </p>
      )}
      {submitted && (
        <p className="form-help" role="status">
          You are on the interest list. We will email you with dates, the founding-cohort price, and
          the project before anyone pays.
        </p>
      )}
    </form>
  );
}
