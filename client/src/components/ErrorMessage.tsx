import { Alert, AlertDescription, AlertAction, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { InfoIcon } from "lucide-react";
import { useErrorStore } from "@/states/ErrorState";
import { motion, AnimatePresence } from "motion/react";

export default function ErrorMessage() {
  const { errorMessage, setErrorNull } = useErrorStore();

  return (
    <AnimatePresence>
      {errorMessage && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed top-10 right-10 z-50 min-w-100 max-w-80 bg-surface-container-highest text-white border border-white/10 shadow-2xl rounded-lg"
        >
          <Alert className="border-none bg-transparent">
            <InfoIcon className="text-error" />
            <AlertTitle className="text-white font-bold">Error!</AlertTitle>
            <AlertDescription className="text-white/70">
              {errorMessage}
            </AlertDescription>
            <AlertAction>
              <Button
                variant="ghost"
                className="hover:bg-white/10 text-white border border-white/20"
                onClick={() => setErrorNull()}
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
