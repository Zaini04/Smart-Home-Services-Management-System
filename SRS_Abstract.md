
# ABSTRACT

## Smart Home Services Management System — A Web and Mobile-Based Platform for On-Demand Home Services in Multan, Pakistan

---

**Background:**
Residents of Multan, Pakistan, face significant challenges in finding reliable and fairly priced home service providers for tasks such as plumbing, electrical work, and maintenance. The existing informal hiring practices — based on word-of-mouth and unverified listings — lack transparency, quality assurance, and accountability. Simultaneously, skilled service providers struggle to access a steady customer base and build professional credibility. No dedicated digital platform currently exists to address this gap in Multan's local market.

**Objectives:**
This project aims to design and develop a full-stack Smart Home Services Management System that connects Multan's residents with KYC-verified service providers through a centralized web platform, governed by an administrative panel. Key objectives include implementing a multi-role authentication system (resident, service provider, admin), a comprehensive booking lifecycle with inspection and OTP-verified milestones, real-time chat, a tiered commission-based financial system, intelligent schedule conflict detection, and an API-first backend architecture that will serve both the current web application and a planned React Native mobile application.

**Research Methodologies:**
The system follows the Agile development methodology with an MVC architectural pattern. The frontend is built using React 19 with Vite 7 and TailwindCSS 4, while the backend uses Express.js 5 with MongoDB (Mongoose 9). Authentication is handled via JWT with bcryptjs, real-time communication through Socket.IO, and file uploads via Multer. Role-based access control is enforced through custom Express middleware at every protected endpoint.

**Findings:**
The completed platform comprises 14 database models, 15 controllers, 5 route modules, and 5 middleware layers on the backend, with 34 frontend pages, 9 reusable components, and 6 API modules. The booking model implements an 11-state lifecycle (posted → completed/cancelled). The commission engine uses four tiers (10%–2.5% on labor cost in PKR) with a 50% discount for new providers' first five jobs. The scheduling utility enforces 2-day and 2-hour gap buffers to prevent double-booking.

**Conclusions:**
The system successfully digitizes Multan's informal home services market into a structured, transparent, and accountable platform with CNIC-based provider verification, OTP-confirmed work milestones, and fair cancellation penalties. The API-first architecture validates the feasibility of reusing the backend for future mobile deployment.

**Implications:**
The platform can be commercially deployed across residential communities in Multan and scaled to other Pakistani cities. The planned React Native mobile app will extend reach to Pakistan's smartphone-first demographic. The financial and commission model provides a sustainable revenue framework for marketplace operations.

**Limitations:**
Current limitations include: web-only deployment (mobile app under development), single-city scope without geolocation matching, absence of automated testing, no payment gateway integration (JazzCash/Easypaisa), no API rate limiting, and lack of Urdu localization and PWA capabilities.

---

**Keywords:** Smart Home Services, Multan Pakistan, MERN Stack, React Native, Real-time Chat, Booking Management, KYC Verification

---

*Word Count: ~380 words*

