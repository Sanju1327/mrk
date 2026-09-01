import React from 'react';
import { Code2, Github, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border/40 bg-background/50 py-8 text-sm text-muted-foreground">
      <div className="container max-w-screen-2xl flex flex-col md:flex-row items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">CodeCraft</span>
          <span>&copy; {new Date().getFullYear()} — Enterprise Java & Full-Stack Learning Platform</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
            <Terminal className="h-3.5 w-3.5 text-emerald-400" />
            <span>Sandbox Ready (Java 21 LTS)</span>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
};
