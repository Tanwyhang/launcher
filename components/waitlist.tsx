"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SubmitState = "idle" | "loading" | "success" | "error";

export function Waitlist() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message || "Could not join the waitlist.");
      }

      setEmail("");
      setState("success");
      setMessage(result.message || "You are on the waitlist.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Could not join the waitlist.");
    }
  }

  const disabled = state === "loading";

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-6 flex w-full flex-col gap-3 sm:flex-row">
      <label className="sr-only" htmlFor="waitlist-email">
        Email address
      </label>
      <Input
        id="waitlist-email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email address"
        required
        disabled={disabled}
        className="h-12 rounded-xl border-neutral-200 bg-white px-4 text-[0.98rem] text-black placeholder:text-neutral-400 focus:border-black focus:ring-black sm:flex-1"
      />
      <Button
        type="submit"
        disabled={disabled}
        className="h-12 rounded-xl bg-black px-6 text-[0.98rem] text-white hover:bg-neutral-800 focus-visible:ring-black sm:w-auto"
      >
        {disabled ? "Joining..." : "Join waitlist"}
      </Button>
      {message ? (
        <p
          className={state === "error" ? "text-sm text-red-600 sm:basis-full" : "text-sm text-neutral-500 sm:basis-full"}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
