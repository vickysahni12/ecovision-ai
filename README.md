# EcoVision AI 🌿
**Intelligent Multimodal Waste Classification & Carbon Diversion Intelligence**  
*Built for the WeMakeDevs × AWS Environmental Hacks Hackathon 2026 — Track 03: Waste and Energy*

---

## 🌟 Overview

**EcoVision AI** empowers individuals and municipal facilities with real-time multimodal computer vision to accurately sort waste, eradicate recycling contamination, and calculate avoided carbon footprints.

By combining the **Google Gemini Multimodal Vision API** with private **Amazon S3 cloud storage** and a decoupled client-side storage architecture, EcoVision AI delivers an enterprise-grade, lightning-fast sorting experience with zero fake AI classifications.

---

## 🚀 Key Features

1. **Multimodal AI Waste Scanner (`/scan`)**:
   - Drag-and-drop & device browsing for waste photography (JPG, PNG, WebP $\le 5\text{ MB}$).
   - Magic-number binary header inspection to prevent MIME spoofing.
   - Live Google Gemini Multimodal Vision classification (`gemini-flash-latest`).
   - Identifies material composition, resin codes (e.g. PET #1, HDPE #2), recyclability viability, and step-by-step disposal procedures.
   - **Food Waste vs. Edible Food Ambiguity**: Explicitly recognizes edible food items and advises human consumption, proper storage, or donation before composting.
   - **Scientific Disclaimers**: Clarifies confidence and carbon metrics as educational model benchmark estimates based on EPA WARM / DEFRA diversion factors rather than certified laboratory Life Cycle Assessments (LCA).

2. **Private Amazon S3 Cloud Storage (`ap-south-1`)**:
   - Full-resolution photos are archived in a private S3 bucket (`ecovision-ai-waste-images-2026`) using AES256 server-side encryption.
   - Bucket remains **100% private** (direct unauthenticated access returns `HTTP 403 Forbidden`).
   - Secure temporary viewing is facilitated via server-generated **1-hour presigned GET URLs**.
   - Supports both **local development** (via AWS CLI profile `ecovision-local`) and **serverless production** (via standard IAM environment variables on Vercel).

3. **Impact Analytics Dashboard (`/dashboard`)**:
   - Live landfill diversion rate (%) and avoided CO₂ footprint calculation.
   - Dynamic municipal category distribution breakdown (Recyclables, Compost/Organics, Hazardous, Landfill).
   - Real-time audit history distinguishing live AI scans from preset demo samples.
   - Displays cloud synchronization tags (`S3 Archived`) for verified cloud objects.

4. **Robust Storage Architecture**:
   - `0 Base64 images` stored in browser `localStorage`, eliminating `QuotaExceededError`.
   - Lightweight metadata and S3 object keys are persisted locally.
   - Fast image thumbnails are stored in browser `IndexedDB`.
   - Automatic migration and graceful emergency record eviction.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (Emerald green, soft mint, white, charcoal theme)
- **Icons**: Lucide React
- **Animations**: Motion (Framer Motion)
- **AI Engine**: Google Gemini Multimodal Vision API (`@google/genai` official SDK)
- **Cloud Storage**: Amazon S3 (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`)
- **AWS Region**: `ap-south-1` (Mumbai)

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### Required Configuration

| Variable | Description | Where to Set |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/) | `.env.local` & Vercel |
| `AWS_REGION` | AWS Region (e.g. `ap-south-1`) | `.env.local` & Vercel |
| `AWS_S3_BUCKET` | Private S3 Bucket name (`ecovision-ai-waste-images-2026`) | `.env.local` & Vercel |

### Authentication Modes

* **Mode A: Local Development** (Automatic via AWS CLI):
  ```env
  AWS_PROFILE=ecovision-local
  ```
  *Reads local credentials from `~/.aws/credentials` automatically without hardcoding access keys in files.*

* **Mode B: Production / Vercel Serverless** (Server-Side Environment Variables):
  ```env
  AWS_ACCESS_KEY_ID=your_iam_access_key_id
  AWS_SECRET_ACCESS_KEY=your_iam_secret_access_key
  ```
  *Configure these securely in Vercel Project Settings &rarr; Environment Variables. Never commit access keys to source code or git.*

---

## 🧪 Testing & Verification

Run the automated test suite covering storage quotas, duplicate prevention, file validation, magic numbers, and S3 integration:

```bash
# Run test suites
npm test

# Run ESLint checks
npm run lint

# Run optimized production build
npm run build
```

---

## 📱 Browser Storage & Device Synchronization Note

> [!NOTE]
> **Device Synchronization Behavior**:  
> In EcoVision AI, scan history records and metrics are stored in the client's browser using `localStorage` and `IndexedDB`. This ensures frictionless access without requiring a mandatory user login, password, or third-party tracking wall.  
> As a result, your scan history persists across page reloads and browser sessions on your specific device, but will **not** automatically sync across different devices or separate browsers unless cloud user authentication is introduced in a future update. Full-resolution photos remain safely backed up in your private Amazon S3 bucket.

---

## 🚢 Vercel Deployment Guide

To deploy EcoVision AI to Vercel:

### 1. Push to GitHub
1. Initialize git and commit your files:
   ```bash
   git add .
   git commit -m "feat: EcoVision AI production release"
   ```
2. Create a repository on GitHub and push your code:
   ```bash
   git remote add origin https://github.com/your-username/ecovision-ai.git
   git branch -M main
   git push -u origin main
   ```
   *(Confirmed: `.env.local` and all credentials are excluded by `.gitignore`)*

### 2. Import into Vercel
1. Log in to [Vercel](https://vercel.com/) and click **Add New** &rarr; **Project**.
2. Select your `ecovision-ai` GitHub repository and click **Import**.
3. Under **Framework Preset**, Next.js will be detected automatically.

### 3. Add Environment Variables in Vercel
Under **Environment Variables**, add the following 5 server-side variables:
* `GEMINI_API_KEY`: Your Gemini API key from Google AI Studio
* `AWS_REGION`: `ap-south-1`
* `AWS_S3_BUCKET`: `ecovision-ai-waste-images-2026`
* `AWS_ACCESS_KEY_ID`: IAM user Access Key ID with `s3:PutObject` and `s3:GetObject` on `scans/*`
* `AWS_SECRET_ACCESS_KEY`: IAM user Secret Access Key

### 4. Deploy
Click **Deploy**. Vercel will build and launch your production application with global edge acceleration and serverless functions.

---

## 📜 Ethical Compliance & Hackathon Guidelines

- **Zero Hallucination / Honest Fallbacks**: EcoVision AI refuses to hallucinate classifications. If an API is unavailable or unconfigured, the system provides transparent status indicators.
- **Strict Least-Privilege IAM**: S3 access is restricted strictly to `s3:PutObject` and `s3:GetObject` under `scans/*`.
- **Zero Paid Upsells**: Fully operable within the standard AWS Free Tier.
