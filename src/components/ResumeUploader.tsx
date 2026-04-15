import { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface ResumeUploaderProps {
  onFileSelected: (file: File) => void;
  isProcessing: boolean;
}

const ResumeUploader = ({ onFileSelected, isProcessing }: ResumeUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
      onFileSelected(file);
    }
  }, [onFileSelected]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileSelected(file);
    }
  };

  const clearFile = () => {
    setFileName(null);
  };

  return (
    <div className="glass-card p-6 animate-slide-up">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary" />
        Upload Resume
      </h2>
      
      {fileName ? (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
          <FileText className="w-5 h-5 text-primary" />
          <span className="text-sm text-foreground flex-1 truncate">{fileName}</span>
          <button onClick={clearFile} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label
          className={`flex flex-col items-center justify-center gap-3 p-8 rounded-lg border-2 border-dashed cursor-pointer transition-all duration-300 ${
            dragActive
              ? 'border-primary bg-primary/10 glow-sm'
              : 'border-border hover:border-primary/50 hover:bg-muted/30'
          } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className={`w-8 h-8 transition-colors ${dragActive ? 'text-primary' : 'text-muted-foreground'}`} />
          <div className="text-center">
            <p className="text-sm text-foreground">Drop your resume here or <span className="text-primary">browse</span></p>
            <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, or TXT</p>
          </div>
          <input type="file" className="hidden" accept=".pdf,.docx,.doc,.txt" onChange={handleFileInput} />
        </label>
      )}
    </div>
  );
};

export default ResumeUploader;
