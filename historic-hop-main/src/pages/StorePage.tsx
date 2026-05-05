import StoreModal from "@/components/StoreModal";
import { useNavigate } from "react-router-dom";

const StorePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0c] pt-20">
      <StoreModal 
        isPage={true}
        onClose={() => navigate("/")} 
      />
    </div>
  );
};

export default StorePage;
