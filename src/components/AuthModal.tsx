import { Dialog } from "@/components/ui/dialog";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const AuthModal = ({ isOpen, onClose, onLoginSuccess }: AuthModalProps) => {
  // Redirect to auth page instead
  if (isOpen) {
    window.location.href = '/auth';
  }
  
  return null;
};

export default AuthModal;
