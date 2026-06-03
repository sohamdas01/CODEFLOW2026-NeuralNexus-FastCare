# FastCare - An AI‑powered platform that transforms scattered medical records into clear, actionable insights for doctors
---
## 👥 Team Members
- Soham Das
- Rishabh Chakraborty
- Spandan Polley

---
## ❗ Problem Statement
Medical records are often fragmented across physical papers, PDFs, and different hospital systems. When a patient visits a new doctor or faces an emergency, retrieving a complete medical history is nearly impossible. Doctors are forced to make life-critical decisions with incomplete information, leading to missed allergies, dangerous drug interactions, and delayed care. FastCare solves this by consolidating scattered records into a single, AI-structured source of truth.

---
## 🔍 Project Overview
FastCare is an end-to-end healthcare platform designed to bridge the gap between fragmented medical data and clinical action. Patients can upload their medical history—including prescriptions, lab reports, and discharge summaries—in various formats. The platform then uses a specialized NLP pipeline to extract and structure this data.

The core value lies in its ability to turn "dumb" documents into "smart" insights. By leveraging Large Language Models (LLMs) and custom NLP logic, FastCare generates a chronological medical timeline, extracts critical health flags, and automatically detects contradictions like drug-allergy conflicts. This empowers doctors with a 360-degree view of the patient in seconds, rather than minutes or hours.

---
## ✨ Key Features
- **Multi-Format Uploads:** Effortlessly upload PDFs and scans of medical records.
- **AI-Powered Summarization:** Automatically generates concise clinical summaries from raw medical text.
- **Chronological Medical Timeline:** Visualizes patient history across all documents in a unified time-series view.
- **Critical Highlight Detection:** Instant flagging of allergies, chronic illnesses, and major surgeries.
- **Automated Contradiction Engine:** Proactively detects drug-allergy conflicts and abnormal lab values.
- **Role-Based Dashboards:** Optimized views for both patients (upload/management) and doctors (review/insights).

---
## 🧱 Core Components (MVP)
### 1. NLP Ingestion Service (Python/FastAPI)
A dedicated service that handles document parsing, OCR, and text extraction while preserving context through citation markers.

### 2. AI Insight Engine (Next.js & OpenAI)
The brain of the platform that uses GPT-4o to structure raw medical text into standardized clinical entities (medications, lab values, etc.).

### 3. Medical Timeline & Summary Generator
A dynamic visualization layer that maps fragmented data points onto a unified chronological scale for rapid clinical review.

### 4. Safety & Contradiction Checker
A backend logic layer that cross-references patient history to flag potential medical risks and abnormal results.

---
## 🛠️ Tech Stack
### Frontend
- Next.js 15 (App Router)
- Tailwind CSS
- Shadcn/UI
- Lucide React (Icons)
- Recharts (Data Visualization)

### Backend
- Next.js API Routes (Orchestration)
- Python FastAPI (NLP & Text Extraction)

### AI / ML
- OpenAI GPT-4o (Clinical Structuring)
- LangChain
- pdfplumber (Python PDF Processing)

### Database & Storage
- MongoDB (Database)
- Mongoose (ORM)
- Cloudinary (Medical Document Storage)

### Authentication
- NextAuth.js

### Deployment
- Ngrok (for local NLP service tunneling)
- Vercel

---
## 🔄 Workflow / Architecture
1. **Upload:** Patient uploads a medical PDF via the Next.js frontend.
2. **Extraction:** The document is stored in Cloudinary, and its content is sent to the **Python NLP Service**.
3. **Parsing:** Python service extracts raw text with citation markers (e.g., `[SOURCE: doc.pdf | PAGE: 1]`).
4. **Structuring:** The **AI Insight Engine** (Next.js + OpenAI) converts raw text into a structured JSON representation of the patient's history.
5. **Validation:** The **Contradiction Engine** checks for drug-allergy conflicts and flags abnormal lab results.
6. **Insight:** The Doctor views the **Patient Dashboard**, seeing the unified timeline, critical highlights, and AI-generated summary.

```text
[Patient] -> [Next.js Frontend] -> [Cloudinary Storage]
                                    |
                                    v
[Doctor]  <- [Unified Dashboard] <- [AI Insight Engine] <- [Python NLP Service]
```

---
## 🏆 Why This Is Better Than Existing Solutions
| Feature | Our Solution | Traditional Approach |
|---------|-------------|----------------------|
| **Data Retrieval** | Instant, AI-structured timeline | Manual search through paper/PDF folders |
| **Safety** | Automated drug-allergy conflict detection | Dependent on doctor's memory or manual check |
| **Summarization** | 2-sentence clinical AI summary | Doctors must read every page to summarize |
| **Accessibility** | Centralized patient-owned history | Data locked in disparate hospital silos |

---
## 🚀 Installation & Setup
### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB Instance
- OpenAI API Key
- Cloudinary Account

### Clone the Repository
```bash
git clone https://github.com/your-repo/fastcare.git
```

### Environment Variables
Create a `.env.local` file in the `fastcare/` directory:
```env
# Auth
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000

# Database
MONGODB_URI=your_mongodb_uri

# AI
OPENAI_API_KEY=your_openai_key

# Storage
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### Run the App
**1. Start the Python NLP Service:**
```bash
cd python-nlp-service
pip install -r requirements.txt
python main.py
```

**2. Start the Frontend:**
```bash
cd fastcare
npm install
npm run dev
```

---
## 🎥 Demo Video
[keep blank i will fill later]
