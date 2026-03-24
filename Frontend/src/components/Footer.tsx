import { Plane, Github, Linkedin } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-card/50 py-12 px-6">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-2 font-display font-bold text-lg text-foreground">
        <Plane className="h-4 w-4 text-primary" />
        Plan<span className="text-primary">Mate</span>
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Built with React · Node · Python · AI &nbsp;|&nbsp; © {new Date().getFullYear()} PlanMate
      </p>

      <div className="flex items-center gap-4">
        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
          <Github className="h-5 w-5" />
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
          <Linkedin className="h-5 w-5" />
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
