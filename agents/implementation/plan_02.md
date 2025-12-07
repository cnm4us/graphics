# Implementation Plan: CloudFront + Signed URLs for Private Image Delivery

## 1. Overview
Goal: Serve generated images from a private S3 bucket through CloudFront using signed URLs, while keeping per-user/space access control enforced by the backend and avoiding mixed-content or public-bucket issues.

In scope:
- Configure a CloudFront distribution in front of the `bacs-graphics` S3 bucket using an Origin Access Control (OAC).
- Set up a CloudFront key group and signing key pair for generating short-lived signed URLs.
- Add backend logic to generate CloudFront signed URLs for images after validating user/space ownership.
- Expose a simple images API returning gallery metadata + signed URLs for use in the frontend.
- Update the React dashboard to render thumbnails via CloudFront instead of raw S3 URLs.

Out of scope (for this plan):
- Advanced caching policies or multiple CloudFront behaviors.
- Thumbnail generation or image transformations (all images are served as generated).
- Multi-tenant bucket separation, logging configuration, or WAF/Shield hardening.

---

## 2. Step-by-Step Plan

1. Create CloudFront distribution and S3 Origin Access Control (OAC)  
   Status: Pending  
   Testing: From the EC2 instance, `curl` an object via the CloudFront domain (using a temporarily public test file or direct URL) and verify it returns 200 while the S3 object remains non-public.  
   Checkpoint: Wait for developer approval before proceeding.

2. Lock down S3 bucket to CloudFront origin only  
   Status: Pending  
   Testing: Confirm that direct `https://bacs-graphics.s3...` access to objects is denied (403), while the same object can be read via CloudFront. Use `curl` or browser dev tools to verify.  
   Checkpoint: Wait for developer approval before proceeding.

3. Configure CloudFront key group and signing keys for signed URLs  
   Status: Pending  
   Testing: Generate a test signed URL (e.g., with a small Node script) and confirm that the URL works until its expiry and then correctly fails afterward.  
   Checkpoint: Wait for developer approval before proceeding.

4. Implement backend helper for generating CloudFront signed URLs per image  
   Status: Pending  
   Testing: Add a temporary backend route (or use the planned images API) that returns a signed URL for a known image `s3_key`; hit the route, then open the URL in a browser to verify the image loads and respects the configured expiry.  
   Checkpoint: Wait for developer approval before proceeding.

5. Expose image metadata + signed URLs from the backend images API  
   Status: Pending  
   Testing: Call the new API (e.g., `GET /api/spaces/:spaceId/images`) from curl or Postman; verify it returns image records for that space only, each with a valid `cloudfrontUrl` field that loads in the browser.  
   Checkpoint: Wait for developer approval before proceeding.

6. Update React dashboard to render gallery thumbnails via CloudFront signed URLs  
   Status: Pending  
   Testing: In the Dashboard UI, ensure that images for the selected space render correctly, no mixed-content warnings appear, and that a page reload after the signed URL expires either refreshes URLs or shows a clear error (depending on chosen behavior).  
   Checkpoint: Wait for developer approval before proceeding.

---

## 3. Progress Tracking Notes

- Step 1 — Status: Pending.  
- Step 2 — Status: Pending.  
- Step 3 — Status: Pending.  
- Step 4 — Status: Pending.  
- Step 5 — Status: Pending.  
- Step 6 — Status: Pending.

