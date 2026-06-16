import { Alert, AlertDescription, AlertAction, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useSuccessStore } from "@/states/SuccessState";

export default function SuccessMessage() {
  const { successMessage, setSuccessMessageNull } = useSuccessStore();

  return (
    <AnimatePresence>
      {successMessage && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed top-10 right-10 z-50 min-w-100 max-w-80 bg-surface-container-highest text-white border border-white/10 shadow-2xl rounded-lg"
        >
          <Alert className="border-none bg-transparent">
            <CheckCircle className="text-primary" />
            <AlertTitle className="text-white font-bold">Successful</AlertTitle>
            <AlertDescription className="text-white/70">
              {successMessage}
            </AlertDescription>
            <AlertAction>
              <Button
                variant="ghost"
                className="hover:bg-white/10 text-white border border-white/20"
                onClick={() => setSuccessMessageNull()}
              >
                Close
              </Button>
            </AlertAction>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
