import { useRef } from 'react';

interface ThreeDBackgroundProps {
  children: React.ReactNode;
}

const ThreeDBackground = ({ children }: ThreeDBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden bg-background">
      {/* 3D Grid floor */}
      <div
        className="absolute inset-0 bg-grid-3d"
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(180deg, 
                transparent 0%, 
                hsl(225 25% 6% / 0.3) 30%,
                hsl(225 25% 6% / 0.7) 60%,
                hsl(225 25% 6%) 100%
              )
            `,
            transform: 'rotateX(60deg) translateZ(-100px)',
            transformOrigin: 'center top',
          }}
        />
      </div>

      {/* Floating orbs */}
      <div className="absolute top-20 left-[15%] w-72 h-72 rounded-full animate-pulse-glow"
        style={{
          background: 'radial-gradient(circle, hsl(200 100% 55% / 0.15), transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div className="absolute top-[40%] right-[10%] w-96 h-96 rounded-full animate-pulse-glow"
        style={{
          background: 'radial-gradient(circle, hsl(260 80% 60% / 0.12), transparent 70%)',
          filter: 'blur(60px)',
          animationDelay: '1.5s',
        }}
      />
      <div className="absolute bottom-20 left-[30%] w-64 h-64 rounded-full animate-pulse-glow"
        style={{
          background: 'radial-gradient(circle, hsl(170 80% 45% / 0.1), transparent 70%)',
          filter: 'blur(50px)',
          animationDelay: '3s',
        }}
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid-3d opacity-30" />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 0%, hsl(200 100% 55% / 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 50%, hsl(260 80% 60% / 0.05) 0%, transparent 40%),
            radial-gradient(ellipse at 20% 80%, hsl(170 80% 45% / 0.05) 0%, transparent 40%)
          `,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default ThreeDBackground;
