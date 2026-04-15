import { ParsedResume } from './resumeParser';
import { ParsedJD } from './jdParser';

export interface SkillAnalysis {
  skill: string;
  presentInResume: boolean;
}

export interface JobMatch {
  jobId: string;
  role: string;
  aboutRole: string;
  skillsAnalysis: SkillAnalysis[];
  matchingScore: number;
  matchedCount: number;
  totalRequired: number;

  // Experience fields
  requiredExperience: number;
  candidateExperience: number;
  experienceMatched: boolean;
}

export interface MatchResult {
  name: string;
  email: string | null;
  phone: string | null;
  salary: string | null;
  yearOfExperience: number;
  resumeSkills: string[];
  matchingJobs: JobMatch[];
}

export function matchResumeWithJobs(
  resume: ParsedResume,
  jobs: ParsedJD[]
): MatchResult {

  const resumeSkillsLower = new Set(
    resume.skills.map(s => s.toLowerCase())
  );

  const matchingJobs: JobMatch[] = jobs.map(jd => {

    const targetSkills =
      jd.requiredSkills.length > 0 ? jd.requiredSkills : jd.allSkills;

    const skillsAnalysis: SkillAnalysis[] = targetSkills.map(skill => ({
      skill,
      presentInResume: resumeSkillsLower.has(skill.toLowerCase()),
    }));

    const matchedCount = skillsAnalysis.filter(s => s.presentInResume).length;
    const totalRequired = targetSkills.length;

    const matchingScore =
      totalRequired > 0
        ? Math.round((matchedCount / totalRequired) * 100)
        : 0;

    // 🔥 EXPERIENCE MATCHING (FIXED)
    const candidateMonths = resume.experience.totalMonths;
    const requiredExpYears = jd.experience;

    const requiredMonths = requiredExpYears * 12;

    const experienceMatched =
      requiredExpYears > 0
        ? candidateMonths >= requiredMonths
        : true;

    return {
      jobId: jd.jobId,
      role: jd.role,
      aboutRole: jd.aboutRole,
      skillsAnalysis,
      matchingScore,
      matchedCount,
      totalRequired,

      // Experience
      requiredExperience: requiredExpYears,
      candidateExperience: resume.yearOfExperience,
      experienceMatched,
    };
  });

  // Sort jobs by score
  matchingJobs.sort((a, b) => b.matchingScore - a.matchingScore);

  return {
    name: resume.name,
    email: resume.email,
    phone: resume.phone,
    salary: resume.salary,
    yearOfExperience: resume.yearOfExperience,
    resumeSkills: resume.skills,
    matchingJobs,
  };
}