import { preprocessText } from './textPreprocessor';
import { findSkills } from './skillDictionary';
import {
  extractName,
  extractSalary,
  extractEmail,
  extractPhone,
  ExperienceDetail
} from './regexUtils';

export interface ParsedResume {
  name: string;
  email: string | null;
  phone: string | null;
  skills: string[];
  experience: ExperienceDetail;
  yearOfExperience: number;
  salary: string | null;
  rawText: string;
}

/* ---------- NORMALIZE ---------- */
function normalizeText(text: string): string {
  // We keep \n intact to distinguish sections properly!
  // Replace carriage returns and weird dashes.
  let n = text.toLowerCase()
    .replace(/–|—|−/g, "-")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  // Collapse multiple spaces/tabs into a single space but preserve newlines
  n = n.replace(/[ \t]+/g, ' ');

  // Fix words spaced out like e x p e r i e n c e
  n = n.replace(/e[ \t\n]*x[ \t\n]*p[ \t\n]*e[ \t\n]*r[ \t\n]*i[ \t\n]*e[ \t\n]*n[ \t\n]*c[ \t\n]*e/g, 'experience')
    .replace(/e[ \t\n]*d[ \t\n]*u[ \t\n]*c[ \t\n]*a[ \t\n]*t[ \t\n]*i[ \t\n]*o[ \t\n]*n/g, 'education')
    .replace(/p[ \t\n]*r[ \t\n]*o[ \t\n]*j[ \t\n]*e[ \t\n]*c[ \t\n]*t[ \t\n]*s/g, 'projects')
    .replace(/s[ \t\n]*k[ \t\n]*i[ \t\n]*l[ \t\n]*l[ \t\n]*s/g, 'skills')
    .replace(/c[ \t\n]*e[ \t\n]*r[ \t\n]*t[ \t\n]*i[ \t\n]*f[ \t\n]*i[ \t\n]*c[ \t\n]*a[ \t\n]*t[ \t\n]*i[ \t\n]*o[ \t\n]*n[ \t\n]*s/g, 'certifications')
    .replace(/a[ \t\n]*c[ \t\n]*h[ \t\n]*i[ \t\n]*e[ \t\n]*v[ \t\n]*e[ \t\n]*m[ \t\n]*e[ \t\n]*n[ \t\n]*t[ \t\n]*s/g, 'achievements');

  return n;
}

/* ---------- WORK SECTION ---------- */
function extractWorkSection(text: string): string {
  let normalized = normalizeText(text);

  let startIndex = -1;
  const startKeywords = ["internship experience", "work experience", "professional experience", "experience"];

  // 1. Try finding clean header isolated by newlines/colons
  const searchString = "\n" + normalized;
  const startRegex = /\n\s*(internship experience|work experience|professional experience|experience)\s*(?:\n|:|$)/gi;
  let match;
  while ((match = startRegex.exec(searchString)) !== null) {
    if (startIndex === -1) {
      startIndex = match.index === 0 ? 0 : match.index - 1; 
      break;
    }
  }

  // 2. Fallback to just scanning for the first occurrence if no newlines
  if (startIndex === -1) {
    for (const kw of startKeywords) {
      const idx = normalized.indexOf(kw);
      if (idx !== -1) {
        if (startIndex === -1 || idx < startIndex) {
          startIndex = idx;
        }
      }
    }
  }

  if (startIndex === -1) return "";

  let endIndex = normalized.length;
  const stopKeywords = ["education", "projects", "skills", "certifications", "achievements"];

  // 1. Try finding clean stop header
  const stopRegex = new RegExp(`\\n\\s*(${stopKeywords.join("|")})\\s*(?:\\n|:|$)`, "gi");
  stopRegex.lastIndex = startIndex + 1; // Start searching securely after our found start index
  const stopMatch = stopRegex.exec(searchString);
  if (stopMatch) {
    endIndex = stopMatch.index === 0 ? 0 : stopMatch.index - 1;
  } else {
    // 2. Fallback
    for (const kw of stopKeywords) {
      const idx = normalized.indexOf(kw, startIndex + 1);
      if (idx !== -1 && idx < endIndex) {
        endIndex = idx;
      }
    }
  }

  return normalized.substring(startIndex, endIndex);
}

/* ---------- EXPERIENCE EXTRACTION ---------- */
function extractExperienceFromSection(text: string): ExperienceDetail {
  if (!text) {
    return {
      totalMonths: 0,
      years: 0,
      months: 0
    };
  }

  // Standarize dash mappings
  text = text.replace(/–|—|−/g, "-").replace(/\s*to\s*/g, "-");

  let totalMonths = 0;
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); 

  const monthMap: Record<string, number> = {
    jan: 0, january: 0,
    feb: 1, february: 1,
    mar: 2, march: 2,
    apr: 3, april: 3,
    may: 4,
    jun: 5, june: 5,
    jul: 6, july: 6,
    aug: 7, august: 7,
    sep: 8, september: 8,
    oct: 9, october: 9,
    nov: 10, november: 10,
    dec: 11, december: 11
  };

  const processedRanges = new Set<string>();

  const processRange = (startM: number, startY: number, endM: number, endY: number, rawMatch: string) => {
    if (endY > currentYear + 1) return; // Future projection threshold
    const duration = (endY - startY) * 12 + (endM - startM);
    if (duration < 0 || duration > 600) return; // Ignore negative or 50+ year durations as parse errors

    const key = `${startM}-${startY}-${endM}-${endY}`;
    if (processedRanges.has(key)) return;
    processedRanges.add(key);

    console.log("VALID MATCH:", rawMatch, duration + 1, "months");
    totalMonths += (duration + 1);
  };

  // 1. Pattern: Month Year - Month Year/Present (e.g. Jan 2026 - Present, October 2025 - Dec 2025)
  const monthPattern = "jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?";
  const myRegex = new RegExp(`(?:\\b|[^a-z])(${monthPattern})\\.?\\s*,?'?\\s*(\\d{4})\\s*-\\s*(?:(${monthPattern})\\.?\\s*,?'?\\s*(\\d{4})|(present|current|now|till\\s*date|ongoing))`, "gi");

  let match;
  while ((match = myRegex.exec(text)) !== null) {
    const startM = monthMap[match[1].toLowerCase()];
    const startY = parseInt(match[2], 10);
    
    let endM, endY;
    if (match[5]) { 
      endM = currentMonth;
      endY = currentYear;
    } else {
      endM = monthMap[match[3].toLowerCase()];
      endY = parseInt(match[4], 10);
    }

    if (startM !== undefined && !isNaN(startY) && endM !== undefined && !isNaN(endY)) {
      processRange(startM, startY, endM, endY, match[0]);
    }
  }

  // 2. Pattern: MM/YYYY - MM/YYYY/Present (e.g. 05/2022 - 08/2024)
  const numRegex = /\b(\d{1,2})\s*[/.-]\s*(\d{4})\s*-\s*(?:(\d{1,2})\s*[/.-]\s*(\d{4})|(present|current|now|till\s*date|ongoing))\b/gi;
  while ((match = numRegex.exec(text)) !== null) {
    const startM = parseInt(match[1], 10) - 1;
    const startY = parseInt(match[2], 10);

    let endM, endY;
    if (match[5]) {
      endM = currentMonth;
      endY = currentYear;
    } else {
      endM = parseInt(match[3], 10) - 1;
      endY = parseInt(match[4], 10);
    }

    if (startM >= 0 && startM <= 11 && endM >= 0 && endM <= 11) {
      if (startY >= 1970 && startY <= currentYear + 1) {
        processRange(startM, startY, endM, endY, match[0]);
      }
    }
  }

  // 3. Pattern: YYYY - YYYY/Present (e.g. 2020 - 2024, 2021-Present)
  if (totalMonths === 0) {
    const yearRegex = /\b(\d{4})\s*-\s*(?:(\d{4})|(present|current|now|till\s*date|ongoing))\b/gi;
    while ((match = yearRegex.exec(text)) !== null) {
      const startY = parseInt(match[1], 10);
      let endY;
      if (match[3]) {
        endY = currentYear;
      } else {
        endY = parseInt(match[2], 10);
      }
      
      if (startY >= 1970 && startY <= currentYear + 1 && endY >= startY) {
        // Compute full year block (Assume 12 months per given year span safely on fallback)
        processRange(0, startY, 11, endY, match[0]);
      }
    }
  }

  console.log("TOTAL MONTHS COMPUTED:", totalMonths);

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  return {
    totalMonths,
    years,
    months,
  };
}

/* ---------- MAIN ---------- */
export function parseResume(rawText: string): ParsedResume {
  const name = extractName(rawText);
  const email = extractEmail(rawText);
  const phone = extractPhone(rawText);

  const processedText = preprocessText(rawText);
  const skills = findSkills(processedText);

  const workSection = extractWorkSection(rawText);

  const experienceDetail = extractExperienceFromSection(workSection);

  const salary = extractSalary(rawText);

  return {
    name,
    email,
    phone,
    skills,
    experience: experienceDetail,
    yearOfExperience:
      Math.round((experienceDetail.totalMonths / 12) * 10) / 10,

    salary,
    rawText,
  };
}