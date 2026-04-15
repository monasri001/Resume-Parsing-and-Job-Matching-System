import { useState } from 'react';
import { Zap, Download, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ThreeDBackground from '@/components/ThreeDBackground';
import ResumeUploader from '@/components/ResumeUploader';
import JobDescriptionInput from '@/components/JobDescriptionInput';
import MatchResults from '@/components/MatchResults';
import { extractText } from '@/utils/fileParser';
import { parseResume } from '@/utils/resumeParser';
import { parseJobDescription } from '@/utils/jdParser';
import { matchResumeWithJobs, MatchResult } from '@/utils/matchingService';

const Index = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobs, setJobs] = useState<{ id: string; text: string }[]>([{ id: 'JD001', text: '' }]);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMatch = async () => {
    if (!resumeFile) {
      toast({ title: 'Please upload a resume', variant: 'destructive' });
      return;
    }

    const validJobs = jobs.filter(j => j.text.trim().length > 0);
    if (validJobs.length === 0) {
      toast({ title: 'Please add at least one job description', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);
    try {
      const resumeText = await extractText(resumeFile);
      const parsedResume = parseResume(resumeText);
      const parsedJobs = validJobs.map(j => parseJobDescription(j.text, j.id));
      const matchResult = matchResumeWithJobs(parsedResume, parsedJobs);
      setResult(matchResult);
      toast({ title: 'Matching complete!', description: `Found ${matchResult.resumeSkills.length} skills across ${parsedJobs.length} job(s)` });
    } catch (error) {
      console.error(error);
      toast({ title: 'Error processing files', description: String(error), variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadJSON = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'match-result.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ThreeDBackground>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10 animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-3">
            Resume to Job Matcher
          </h1>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Rule-based resume parsing & job matching — no AI, no LLMs, just smart regex and pattern matching.
          </p>
        </div>

        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ResumeUploader onFileSelected={setResumeFile} isProcessing={isProcessing} />
          <JobDescriptionInput onJobsChange={setJobs} />
        </div>

        {/* Match Button */}
        <div className="flex justify-center gap-3 mb-10">
          <button
            onClick={handleMatch}
            disabled={isProcessing}
            className="flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all glow-md disabled:opacity-50 disabled:pointer-events-none"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {isProcessing ? 'Processing...' : 'Match Now'}
          </button>

          {result && (
            <button
              onClick={downloadJSON}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm bg-muted text-foreground hover:bg-muted/80 border border-border transition-all"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
          )}
        </div>

        {/* Results */}
        {result && <MatchResults result={result} />}
      </div>
    </ThreeDBackground>
  );
};

export default Index;
