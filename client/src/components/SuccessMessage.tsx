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
          className="fixed top-10 right-10 z-900 max-w-80 sm:text-sm text-xs bg-surface-container-highest text-on-surface border border-white/10 shadow-2xl rounded-lg"
        >
          <Alert className="border-none bg-transparent">
            <CheckCircle className="text-on-surface" />
            <AlertTitle className="text-on-surface font-bold">Successful</AlertTitle>
            <AlertDescription className="text-on-surface-variant">
              {successMessage}
            </AlertDescription>
            <AlertAction>
              <Button
                variant="outline"
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
