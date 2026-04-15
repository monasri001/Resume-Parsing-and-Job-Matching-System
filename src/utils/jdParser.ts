import { preprocessText } from './textPreprocessor';
import { findSkills } from './skillDictionary';
import { extractSalary } from './regexUtils';

export interface ParsedJD {
  jobId: string;
  role: string;
  aboutRole: string;
  requiredSkills: string[];
  optionalSkills: string[];
  allSkills: string[];
  experience: number;
  salary: string | null;
}

function extractSection(text: string, headers: string[]): string {
  const headerPattern = headers.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const regex = new RegExp(`(?:${headerPattern})\\s*:?\\s*([\\s\\S]*?)(?=\\n(?:[A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*\\s*:|$))`, 'gi');
  const match = regex.exec(text);
  return match ? match[1].trim().slice(0, 500) : '';
}

function extractRole(text: string): string {
  const patterns = [
    // 1. Explicit Key-value
    /^(?:job\s*title|position\s*title|role)\s*:\s*(.+)$/im,

    // 2. Headings on their own line
    /^([A-Z][a-zA-Z0-9\s\+\-\/\(\)]*?(?:Engineer|Developer|Manager|Analyst|Scientist|Architect|Programmer|Administrator|Specialist|Consultant)(?:\s*\([A-Za-z0-9\s]+\))?)\s*$/im,
    
    // 3. "position is for a..."
    /position\s+is\s+for\s+(?:a\s+|an\s+|the\s+)?([A-Z][a-zA-Z0-9\s\+\-\/]+?(?:Engineer|Developer|Manager|Analyst|Scientist|Architect|Programmer|Administrator|Specialist|Consultant))/i,

    // 4. "seeking a..."
    /(?:seeking|looking\s+for|opening\s+for|hiring)\s+(?:a\s+|an\s+|the\s+)?([A-Z][a-zA-Z0-9\s\+\-\/]+?(?:Engineer|Developer|Manager|Analyst|Scientist|Architect|Programmer|Administrator|Specialist|Consultant))/i,

    // 5. "As a..."
    /as\s+(?:a\s+|an\s+|the\s+)?([A-Z][a-zA-Z0-9\s\+\-\/]+?(?:Engineer|Developer|Manager|Analyst|Scientist|Architect|Programmer|Administrator|Specialist|Consultant))\s+at/i,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match && match[1]) {
      const extracted = match[1].trim();
      if (extracted.length > 3 && extracted.length < 80 && !extracted.includes('\n')) {
        return extracted;
      }
    }
  }

  // Backup Semantic Search
  const semanticPattern = /((?:Senior|Junior|Lead|Principal|Staff|Chief|Full Stack|Frontend|Backend|Software|Systems?|Data|Machine\s+Learning|AI|Cloud|DevOps|Network|Security|Test|QA|Web|Mobile|Scientific|C\+\+|Java|Python)?\s*(?:[A-Za-z]+\s+){0,2}(?:Engineer|Developer|Architect|Scientist|Programmer|Analyst|Consultant|Administrator)\s*(?:\([A-Za-z0-9\s]+\))?)/i;
  
  const semanticMatch = semanticPattern.exec(text);
  if (semanticMatch && semanticMatch[1]) {
      const extracted = semanticMatch[1].trim();
      if (extracted.length > 3 && extracted.length < 80) {
          return extracted;
      }
  }

  // First line fallback
  const firstLine = text.trim().split('\n')[0]?.trim();
  if (firstLine && firstLine.length < 60) {
      return firstLine;
  }
  
  return 'Unknown Role';
}

/**
 * Extract the required years of experience from a JD.
 * Looks for patterns like "3+ years", "3 yoe", "minimum 3 years", etc.
 * Returns the number (e.g. 3) or 0 if not found.
 */
function extractRequiredExperience(text: string): number {
  const patterns = [
    // Safely capture MIN value from ranges first so they aren't overridden by single-digit captures
    /(\d+)\s*(?:-|–|to)\s*\d+\s*\+?\s*years?(?:\s+(?:of|in|working))?/gi,
    /experience\s*:?\s*(\d+)\s*(?:-|–|to)\s*\d+\s*\+?\s*years?/gi,
    /(\d+)\s*-\s*\d+\s*years?\s+(?:of\s+)?(?:experience|exp)/gi,

    // High fidelity specifiers
    /(?:minimum|min|at\s+least|atleast)\s+(\d+)\s*\+?\s*years?/gi,
    /experience\s*:?\s*(\d+)\s*\+?\s*years?/gi,

    // Generic fallbacks
    /(\d+)\s*\+?\s*years?\s+(?:of\s+)?(?:experience|exp)\b/gi,
    /(\d+)\s*\+?\s*years?\s+(?:in|of|working)/gi,
    /(\d+)\s*\+?\s*(?:yoe|yrs?)\b/gi,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      return parseInt(match[1]);
    }
  }
  return 0;
}

export function parseJobDescription(rawText: string, jobId: string): ParsedJD {
  const role = extractRole(rawText);
  const processedText = preprocessText(rawText);
  
  // Extract sections
  const requiredSection = extractSection(rawText, [
    'required skills', 'must have', 'requirements', 'required',
    'mandatory', 'essential skills', 'key skills',
  ]);
  
  const optionalSection = extractSection(rawText, [
    'preferred', 'good to have', 'nice to have', 'optional',
    'bonus', 'desired', 'plus',
  ]);
  
  const aboutSection = extractSection(rawText, [
    'about the role', 'job description', 'responsibilities',
    'about this role', 'overview', 'summary', 'description',
  ]);
  
  const requiredSkills = requiredSection
    ? findSkills(preprocessText(requiredSection))
    : [];
  
  const optionalSkills = optionalSection
    ? findSkills(preprocessText(optionalSection))
    : [];
  
  // All skills from full text as fallback
  const allTextSkills = findSkills(processedText);
  const allSkills = [...new Set([...requiredSkills, ...optionalSkills, ...allTextSkills])];
  
  const experience = extractRequiredExperience(rawText);
  const salary = extractSalary(rawText);
  const aboutRole = aboutSection || rawText.slice(0, 300);
  
  return {
    jobId,
    role,
    aboutRole,
    requiredSkills: requiredSkills.length > 0 ? requiredSkills : allSkills,
    optionalSkills,
    allSkills,
    experience,
    salary,
  };
}
