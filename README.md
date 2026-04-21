# Resume Parsing and Job Matching System

production app : live 

A smart, rule-based web application that dramatically simplifies the recruitment process by automatically parsing candidate resumes, extracting core professional attributes, and scoring them directly against specific Job Description (JD) requirements. 

Built strictly with robust regex rules and structural parsing (no external LLMs or black-box AI dependencies), this system delivers fully deterministic, fast, and fully transparent matching results.

## 🌟 Key Features

* **Advanced Resume Parsing**: Accurately extracts precise total experience metrics (years & months) along with core competencies directly from raw textual resume data.
* **Intelligent JD Extraction**: Pulls precise Job Titles, Required Skills, Preferred Skills from Job Descriptions avoiding unrelated paragraphs.
* **Mathematical Eligibility Checking**: Calculates true candidate experience normalized to total months and cross-references them against Minimum Required Experience parameters of the target JD. 
* **Sample JD Engine**: Contains a robust, cyclable library of 15 fully-crafted Sample Job Descriptions built directly into the UI for rapid testing and demonstration.
* **Deterministic Scoring Engine**: Provides absolute matching percentages between the user's skillset and the explicitly stated requirement of the Job Description.

---

## 📸 Application Screenshots

### Dashboard & Sample JD Loader
<img width="1918" height="966" alt="image" src="https://github.com/user-attachments/assets/1cc2838a-0c5c-44ed-9154-7cf0acd7f3ef" />


### Match Results & Analytics
<img width="1919" height="967" alt="image" src="https://github.com/user-attachments/assets/480ade40-b035-4fe1-a29b-4a0c076b4531" />


### Detailed Tracking
<img width="1919" height="969" alt="image" src="https://github.com/user-attachments/assets/582677f5-fa87-44ba-88e4-687b9403ac24" />


---

## 🚀 Tech Stack

* **Frontend Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/), Radix UI Primitives
* **Icons**: [Lucide React](https://lucide.dev/)

## 🛠️ Local Development Setup

To run this project locally, ensure you have [Node.js](https://nodejs.org/) installed on your machine.

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/monasri001/Resume-Parsing-and-Job-Matching-System.git
   cd Resume-Parsing-and-Job-Matching-System
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Access the application**
   Navigate to \`http://localhost:8080\` (or the port specified by Vite) in your local web browser.

---

## 🧠 System Architecture Overview

### Parsing Engine (\`src/utils\`)
* **\`jdParser.ts\`**: Responsible for analyzing JD text using complex Regex rulesets designed to reliably extract exact Job Titles, Minimum Experience Requirements, and Categorized Skills despite highly variant input formats.
* **\`resumeParser.ts\`**: Isolates the "Work Experience" section of uploaded resumes, parses date string ranges (e.g., `Jan 2026 - Present`), and aggressively calculates the exact candidate's overall lifespan in the industry utilizing strict Number standards.
* **\`skillDictionary.ts\`**: Maintains an active hardcoded token list of current technologies, platforms, soft skills, and programming languages to aggressively identify within both inputs.
* **\`matchingService.ts\`**: Cross-references the normalized Candidate object with the JD object, enforcing eligibility blocking if the candidate's exact computed months falls beneath the required JD metric, generating an absolute `MatchResult`.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](../../issues).
