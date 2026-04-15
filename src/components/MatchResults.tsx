import {
  CheckCircle2,
  XCircle,
  User,
  Mail,
  Phone,
  Coins,
  Clock,
  Code2,
  Trophy,
  Briefcase
} from 'lucide-react';
import { MatchResult } from '@/utils/matchingService';

interface MatchResultsProps {
  result: MatchResult;
}

const ScoreRing = ({ score }: { score: number }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 70
      ? 'hsl(170, 80%, 45%)'
      : score >= 40
      ? 'hsl(45, 90%, 55%)'
      : 'hsl(0, 72%, 55%)';

  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="hsl(225, 20%, 18%)"
          strokeWidth="6"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-foreground">
          {score}%
        </span>
      </div>
    </div>
  );
};

const MatchResults = ({ result }: MatchResultsProps) => {
  return (
    <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
      
      {/* Candidate Info */}
      <div className="glass-card-accent p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Candidate Profile
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          <InfoItem icon={<User className="w-4 h-4" />} label="Name" value={result.name} />

          {result.email && (
            <InfoItem icon={<Mail className="w-4 h-4" />} label="Email" value={result.email} />
          )}

          {result.phone && (
            <InfoItem icon={<Phone className="w-4 h-4" />} label="Phone" value={result.phone} />
          )}

          {/* ✅ FIXED EXPERIENCE */}
          <InfoItem
            icon={<Clock className="w-4 h-4" />}
            label="Experience"
            value={`${result.yearOfExperience} years`}
          />

          {result.salary && (
            <InfoItem icon={<Coins className="w-4 h-4" />} label="Salary" value={result.salary} />
          )}

        </div>

        {/* Skills */}
        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Code2 className="w-3.5 h-3.5" /> Detected Skills ({result.resumeSkills.length})
          </p>

          <div className="flex flex-wrap gap-1.5">
            {result.resumeSkills.map(skill => (
              <span
                key={skill}
                className="px-2 py-0.5 rounded-full text-xs bg-primary/15 text-primary border border-primary/20"
              >
                {skill}
              </span>
            ))}

            {result.resumeSkills.length === 0 && (
              <span className="text-xs text-muted-foreground">
                No skills detected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Job Matches */}
      {result.matchingJobs.map((job, i) => (
        <div
          key={job.jobId}
          className="glass-card p-6 animate-slide-up"
          style={{ animationDelay: `${0.3 + i * 0.1}s` }}
        >
          <div className="flex items-start gap-4">
            <ScoreRing score={job.matchingScore} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-secondary" />
                <span className="text-xs font-mono text-muted-foreground">
                  {job.jobId}
                </span>
              </div>

              <h3 className="text-base font-semibold text-foreground">
                {job.role}
              </h3>

              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {job.aboutRole}
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-2">
                {/* 🔥 EXPERIENCE MATCH STATUS */}
                <span className={`px-2 py-1 rounded text-xs font-medium mt-2 inline-block ${
                  job.experienceMatched
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                }`}>
                  {job.experienceMatched
                    ? "Experience Matched"
                    : `Experience Not Matched (${job.requiredExperience} yr req)`}
                </span>
              </div>
            </div>
          </div>

          {/* Skills Analysis */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {job.skillsAnalysis.map(sa => (
              <div
                key={sa.skill}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs ${
                  sa.presentInResume
                    ? 'bg-accent/10 text-accent'
                    : 'bg-destructive/10 text-destructive'
                }`}
              >
                {sa.presentInResume ? (
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                )}
                <span>{sa.skill}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const InfoItem = ({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-2 text-sm">
    <span className="text-muted-foreground">{icon}</span>
    <span className="text-muted-foreground">{label}:</span>
    <span className="text-foreground font-medium truncate">
      {value}
    </span>
  </div>
);

export default MatchResults;