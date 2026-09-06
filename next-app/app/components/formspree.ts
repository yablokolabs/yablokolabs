"use client";

export const FORMSPREE_ENDPOINT = "https://formspree.io/f/meewwowj";

export type AiAgentLead = {
  name: string;
  email: string;
  company: string;
  agentType: string;
  challenge: string;
};

/** Builds the FormData payload sent to Formspree for an AI agent lead. */
export function buildAiAgentLeadFormData(lead: AiAgentLead): FormData {
  const formData = new FormData();
  formData.append("name", lead.name);
  formData.append("email", lead.email);
  formData.append("company", lead.company);
  formData.append("agent_type", lead.agentType);
  formData.append("challenge", lead.challenge);
  formData.append("_subject", `AI Agent Assistant Lead - ${lead.company || lead.name}`);
  formData.append("_replyto", lead.email);
  return formData;
}

/** POSTs the form data to Formspree; throws if the submission is rejected. */
export async function submitFormspree(
  formData: FormData,
  endpoint: string = FORMSPREE_ENDPOINT,
): Promise<void> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Formspree submission failed with status ${response.status}`);
  }
}