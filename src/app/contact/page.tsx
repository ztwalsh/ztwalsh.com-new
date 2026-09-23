"use client";

import { useState, FormEvent } from "react";
import { CrtRoot, InvertButton } from "../../components/Crt";

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
    <CrtRoot>
      <main className="wrap">
        <header className="hero">
          <h1>contact</h1>
        </header>

        {status === "success" ? (
          <div className="success">
            <p>
              Thanks for reaching out. I&apos;ll get back to you as soon as I
              can.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {status === "error" && <p className="error">{errorMessage}</p>}

            {/* Honeypot */}
            <div className="honeypot" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                type="text"
                id="website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="field">
              <label htmlFor="name">Full name</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                maxLength={100}
                placeholder="Your name"
                autoComplete="name"
                className={missingFields.has("name") ? "field-error" : ""}
                onChange={() => {
                  if (missingFields.has("name")) {
                    setMissingFields((prev) => {
                      const next = new Set(prev);
                      next.delete("name");
                      return next;
                    });
                  }
                }}
              />
            </div>

            <div className="field">
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                placeholder="you@example.com"
                autoComplete="email"
                className={missingFields.has("email") ? "field-error" : ""}
                onChange={() => {
                  if (missingFields.has("email")) {
                    setMissingFields((prev) => {
                      const next = new Set(prev);
                      next.delete("email");
                      return next;
                    });
                  }
                }}
              />
            </div>

            <div className="field">
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
                    setMissingFields((prev) => {
                      const next = new Set(prev);
                      next.delete("message");
                      return next;
                    });
                  }
                }}
              />
            </div>

            <button type="submit" className="submit" disabled={status === "sending"}>
              {status === "sending" ? "Sending..." : "Send message"}
            </button>
          </form>
        )}

        <p className="alt">
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

        <footer className="foot">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- full reload keeps the CRT mount clean */}
          <a href="/">home</a>
          <a
            href="https://www.linkedin.com/in/zacharywalsh/"
            target="_blank"
            rel="noopener noreferrer"
          >
            linkedin
          </a>
          <InvertButton />
        </footer>
      </main>
    </CrtRoot>
  );
}
