import { Alert, AlertDescription, AlertAction, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { InfoIcon } from "lucide-react";
import { useErrorStore } from "@/states/ErrorState";
import { motion } from "motion/react";

export default function ErrorMessage() {
  const { errorMessage, setErrorNull } = useErrorStore();

  if (!errorMessage) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.3 } }}
      className="fixed bottom-10 min-w-125 max-w-96 bg-primary text-gray-800 border border-primary/20 shadow-2xl rounded-2xl"
    >
      <Alert className="border-none">
        <InfoIcon />
        <AlertTitle>Error!</AlertTitle>
        <AlertDescription className="text-gray-900/80">
          {errorMessage}
        </AlertDescription>
        <AlertAction>
          <Button
            variant="ghost"
            className="border border-background"
            onClick={() => setErrorNull()}
          >
            Close
          </Button>
        </AlertAction>
      </Alert>
    </motion.div>
  );
}
