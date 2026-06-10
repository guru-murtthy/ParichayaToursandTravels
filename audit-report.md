# 🔒 Security Audit Report — Parichaya Tours & Travels
**Date:** 2026-05-09  
**Site:** https://parichaya-tours.netlify.app  
**Audited by:** Antigravity AI Security Audit

---

## Executive Summary

The website is a **React SPA on Netlify** with an Express/MongoDB backend
(currently not deployed — localhost only). The audit covers both the live
frontend and the local codebase. Overall risk is **Medium** for the backend
codebase and **Low-Medium** for the deployed frontend.

---

## FRONTEND FINDINGS

### ❌ VULN-F01 — Hardcoded WhatsApp Phone Number
**Severity:** Low  
**Files:**
- `src/App.jsx:34`
- `src/pages/Home.jsx:52,398,450`
- `src/pages/Contact.jsx:28`

**Detail:** The WhatsApp recipient number `+918073183863` is hardcoded directly
in JSX and JS logic. While not a security secret, this violates the 12-factor
principle and makes updates require a code change + redeploy.

**Fix:** Move to `VITE_WHATSAPP_NUMBER` env variable.

---

### ❌ VULN-F02 — Admin Page Hits `localhost:5000` in Production
**Severity:** HIGH  
**File:** `src/pages/Admin.jsx:11`

The admin panel is hardcoded to `http://localhost:5000`. In production this
always fails silently (CORS + network error). The admin password is transmitted
in a plain-text HTTP header over an unencrypted connection.

**Fix:** Use `VITE_API_URL` env variable. Migrate auth to JWT Bearer token.

---

### ❌ VULN-F03 — Missing Netlify SPA Redirect Rule
**Severity:** Medium  
**File:** No `_redirects` or `netlify.toml` exists

**Detail:** Navigating directly to `/about`, `/services`, `/contact`, or `/admin`
returns Netlify's default **404 page**. This is confirmed by the live site audit.

**Fix:** Add `frontend/public/_redirects` with `/* /index.html 200`.

---

### ❌ VULN-F04 — Missing HTTP Security Headers
**Severity:** Medium  
**Evidence:** Live site headers checked — none present:
- `X-Frame-Options` MISSING → allows clickjacking
- `X-Content-Type-Options` MISSING → allows MIME sniffing  
- `X-XSS-Protection` MISSING
- `Content-Security-Policy` MISSING → allows arbitrary script injection
- `Referrer-Policy` MISSING
- `Permissions-Policy` MISSING
- `Strict-Transport-Security` MISSING

**Fix:** Add `netlify.toml` with `[[headers]]` section.

---

### ❌ VULN-F05 — Contact Form Silently Discards User Data
**Severity:** Medium  
**File:** `src/pages/Contact.jsx:9`

The contact form collects user PII (name, phone, email, message) and then
silently discards it with an `alert("Message Sent (Simulation)")`. Users are
deceived into thinking their message was sent.

**Fix:** Route contact form to WhatsApp (like the booking form).

---

### ❌ VULN-F06 — `.env` Not Explicitly in `.gitignore`
**Severity:** Medium  
**File:** `frontend/.gitignore`

The `.gitignore` doesn't exclude `.env` (only `*.local`). A developer adding
secrets to `.env` could accidentally commit them.

**Fix:** Explicitly add `.env` and `.env.*` to `.gitignore`.

---

## BACKEND FINDINGS

### ❌ VULN-B01 — Plain-text Admin Password in HTTP Header
**Severity:** HIGH  
**File:** `backend/routes/api.js:66-73`

Admin authentication uses a plain-text password in a custom HTTP header.
No rate limiting on this check. Password stored unhashed in `.env`.

**Fix:** JWT-based auth with bcrypt password hashing.

---

### ❌ VULN-B02 — No Rate Limiting on Any Endpoint
**Severity:** HIGH  
**File:** `backend/server.js`

All API endpoints have zero rate limiting. Open to spam/DDoS/brute-force.

**Fix:** `express-rate-limit` on all routes.

---

### ❌ VULN-B03 — No Input Validation or Sanitization
**Severity:** HIGH  
**File:** `backend/routes/api.js`

All POST body fields saved to MongoDB with no length validation, type checking,
HTML stripping, or NoSQL injection prevention. `{"name": {"$gt": ""}}` works.

**Fix:** `express-validator` + `express-mongo-sanitize` + `xss-clean`.

---

### ❌ VULN-B04 — CORS Open to All Origins
**Severity:** HIGH  
**File:** `backend/server.js:15` — `app.use(cors())` with no config.

Any website can make requests to the backend API.

**Fix:** Restrict to `https://parichaya-tours.netlify.app` only.

---

### ❌ VULN-B05 — No Helmet Middleware
**Severity:** Medium  
**File:** `backend/server.js`

Express exposes `X-Powered-By: Express`. No API security headers.

**Fix:** Add `helmet()` as the first middleware.

---

### ❌ VULN-B06 — Mongoose Schemas Lack Validation
**Severity:** Medium  
**Files:** `backend/models/Booking.js`, `backend/models/Contact.js`

No `maxlength`, no `enum` validators, no `trim`. Storage exhaustion possible.

**Fix:** Add `maxlength`, `enum`, `trim`, and `timestamps` to all schemas.

---

### ❌ VULN-B07 — MongoDB on localhost (No Atlas)
**Severity:** Medium  
**File:** `backend/.env`

Local MongoDB instance. Port 27017 could be exposed on a server.

**Fix:** Use MongoDB Atlas with IP whitelisting.

---

### ❌ VULN-B08 — Weak Placeholder Credentials in `.env`
**Severity:** Medium  
**File:** `backend/.env`

`ADMIN_PASSWORD=secret` is trivially guessable.

**Fix:** Strong random values. Hash admin password with bcrypt.

---

## SUMMARY TABLE

| ID | Area | Severity | Title |
|---|---|---|---|
| F01 | Frontend | Low | Hardcoded WhatsApp number |
| F02 | Frontend | HIGH | Admin hits localhost:5000 in production |
| F03 | Frontend | Medium | Missing SPA redirect → 404 on direct URLs |
| F04 | Frontend | Medium | Missing all HTTP security headers |
| F05 | Frontend | Medium | Contact form discards data silently |
| F06 | Frontend | Medium | .env not in .gitignore |
| B01 | Backend | HIGH | Plain-text admin password in HTTP header |
| B02 | Backend | HIGH | No rate limiting on any endpoint |
| B03 | Backend | HIGH | No input validation or sanitization |
| B04 | Backend | HIGH | CORS open to all origins |
| B05 | Backend | Medium | No Helmet middleware |
| B06 | Backend | Medium | Mongoose schemas lack validation |
| B07 | Backend | Medium | MongoDB on localhost |
| B08 | Backend | Medium | Weak placeholder credentials in .env |

**Estimated Security Score (Before Fixes): 28/100**

*No changes have been made to any files. Awaiting approval.*
