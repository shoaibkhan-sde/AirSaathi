# AirSaathi Security Policy

## Reporting Security Issues

If you discover a security vulnerability or security bug in the AirSaathi project, please report it privately:

- **Email:** security@airsaathi.dev (or contact repository owner directly)
- **Response Target:** Initial acknowledgment within 48 hours, resolution update within 7 days.

Please do not open public GitHub issues for undisclosed security vulnerabilities.

---

## Architecture & Security Controls

AirSaathi implements security defense-in-depth across the client and server:

1. **Zero Client-Side Secrets:**
   - The Google Gemini API key is accessed exclusively by server-side modules (`server/config.ts`) and is never delivered to the client bundle.
2. **Server-Side Request Validation:**
   - Inbound HTTP payloads are validated against strict Zod schemas with closed schemas, rejecting unknown or malicious fields.
3. **Prompt Injection Mitigations:**
   - User messages are scrubbed of control characters, length-capped at 1,000 characters, and system prompts are strictly isolated.
4. **Rate Limiting & Anonymized Identifiers:**
   - IP addresses are salted and hashed with SHA-256 before tracking rate-limiting counters.
5. **Security Protection Headers:**
   - Content Security Policy (CSP), HTTP Strict Transport Security (HSTS), X-Content-Type-Options: nosniff, and frame-ancestors: none.
6. **Privacy-First Data Architecture:**
   - Zero centralized database and zero tracking cookies. User profiles and checklist states are persisted purely inside the user's browser `localStorage`.
