import { useState } from 'react';
import { Plus, Trash2, Briefcase } from 'lucide-react';

interface JobDescriptionInputProps {
  onJobsChange: (jobs: { id: string; text: string }[]) => void;
}

import { SAMPLE_JDS } from '../utils/sampleJDs';

const JobDescriptionInput = ({ onJobsChange }: JobDescriptionInputProps) => {
  const [jobs, setJobs] = useState<{ id: string; text: string }[]>([
    { id: 'JD001', text: '' },
  ]);
  const [sampleIndex, setSampleIndex] = useState(0);

  const updateJob = (index: number, text: string) => {
    const updated = [...jobs];
    updated[index] = { ...updated[index], text };
    setJobs(updated);
    onJobsChange(updated);
  };

  const addJob = () => {
    const newId = `JD${String(jobs.length + 1).padStart(3, '0')}`;
    const updated = [...jobs, { id: newId, text: '' }];
    setJobs(updated);
    onJobsChange(updated);
  };

  const removeJob = (index: number) => {
    if (jobs.length <= 1) return;
    const updated = jobs.filter((_, i) => i !== index);
    setJobs(updated);
    onJobsChange(updated);
  };

  const loadSample = (index: number) => {
    updateJob(index, SAMPLE_JDS[sampleIndex]);
    setSampleIndex((prev) => (prev + 1) % SAMPLE_JDS.length);
  };

  return (
    <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-secondary" />
        Job Descriptions
      </h2>

      <div className="space-y-4">
        {jobs.map((job, index) => (
          <div key={job.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground">{job.id}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => loadSample(index)}
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  Load sample
                </button>
                {jobs.length > 1 && (
                  <button onClick={() => removeJob(index)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            <textarea
              value={job.text}
              onChange={(e) => updateJob(index, e.target.value)}
              placeholder="Paste job description here..."
              className="w-full h-40 p-3 rounded-lg bg-muted/30 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 resize-none transition-all"
            />
          </div>
        ))}
      </div>

      <button
        onClick={addJob}
        className="mt-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add another JD
      </button>
    </div>
  );
};

export default JobDescriptionInput;
