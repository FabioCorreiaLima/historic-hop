import Ranking from "@/components/Ranking";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const RankingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0c] pt-24 pb-12 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 blur-[120px] rounded-full -z-10" />
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigate("/")}
        className="absolute top-24 right-6 z-50 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10"
      >
        <X className="w-6 h-6" />
      </Button>
      
      <div className="container mx-auto">
        <Ranking />
      </div>
    </div>
  );
};

export default RankingPage;
