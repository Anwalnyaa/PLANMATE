import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plane, Moon, Sun, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const navigate = useNavigate();
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setDark(!dark);
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-lg border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 font-display font-bold text-xl text-foreground"
        >
          <Plane className="h-5 w-5 text-primary" />
          Plan<span className="text-primary">Mate</span>
        </button>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <button onClick={() => scrollTo("how-it-works")} className="hover:text-foreground transition-colors">
            How it works
          </button>
          <button onClick={() => scrollTo("features")} className="hover:text-foreground transition-colors">
            Features
          </button>
          <button onClick={() => scrollTo("why")} className="hover:text-foreground transition-colors">
            Why PlanMate
          </button>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex"
          >
            <Button variant="ghost" size="icon" className="rounded-full">
              <Github className="h-4 w-4" />
            </Button>
          </a>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleDark}>
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            onClick={() => navigate("/create-trip")}
            className="h-9 px-5 text-sm font-display gradient-warm text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
          >
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
