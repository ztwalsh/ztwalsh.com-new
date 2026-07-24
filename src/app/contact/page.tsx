"use client";

import { useState, FormEvent } from "react";
import Header from "../../components/Header";

export default function Contact() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [missingFields, setMissingFields] = useState<Set<string>>(new Set());

  function validate(data: { name: string; email: string; message: string }) {
    const missing = new Set<string>();
    if (!data.name.trim()) missing.add("name");
    if (!data.email.trim()) missing.add("email");
    if (!data.message.trim()) missing.add("message");
    return missing;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      name: (formData.get("name") as string) || "",
      email: (formData.get("email") as string) || "",
      message: (formData.get("message") as string) || "",
      website: formData.get("website") as string,
    };

    const missing = validate(data);
    setMissingFields(missing);

    if (missing.size > 0) {
      setStatus("error");
      setErrorMessage("Please fill out all fields.");
      return;
    }

    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Something went wrong.");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container">
        <div className="page-hero">
          <h1 className="page-title">contact</h1>
        </div>

        <div className="content-section">
          <div className="section-content">
            {status === "success" ? (
              <div className="form-success">
                <p className="form-success-body">
                  Thanks for reaching out. I&apos;ll get back to you as soon as I
                  can.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form" noValidate>
                {status === "error" && (
                  <p className="form-error">{errorMessage}</p>
                )}

                {/* Honeypot */}
                <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
                  <label htmlFor="website">Website</label>
                  <input
                    type="text"
                    id="website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="name">Full name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    maxLength={100}
                    placeholder="Your name"
                    className={missingFields.has("name") ? "field-error" : ""}
                    onChange={() => {
                      if (missingFields.has("name")) {
                        setMissingFields((prev) => { const next = new Set(prev); next.delete("name"); return next; });
                      }
                    }}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="email">Email address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="you@example.com"
                    className={missingFields.has("email") ? "field-error" : ""}
                    onChange={() => {
                      if (missingFields.has("email")) {
                        setMissingFields((prev) => { const next = new Set(prev); next.delete("email"); return next; });
                      }
                    }}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    minLength={10}
                    maxLength={5000}
                    placeholder="What's on your mind?"
                    className={missingFields.has("message") ? "field-error" : ""}
                    onChange={() => {
                      if (missingFields.has("message")) {
                        setMissingFields((prev) => { const next = new Set(prev); next.delete("message"); return next; });
                      }
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="form-submit"
                  disabled={status === "sending"}
                >
                  {status === "sending" ? "Sending..." : "Send message"}
                </button>
              </form>
            )}

            <p className="contact-alt">
              You can also reach me at{" "}
              <a href="mailto:ztwalsh@gmail.com">ztwalsh@gmail.com</a> or on{" "}
              <a
                href="https://www.linkedin.com/in/zacharywalsh/"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
              .
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
