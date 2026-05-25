import { Alert, AlertDescription, AlertAction, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { CheckCircle } from "lucide-react";
import { motion } from "motion/react";
import { useSuccessStore } from "@/states/SuccessState";

export default function SuccessMessage() {
  const { successMessage, setSuccessMessageNull } = useSuccessStore();

  if (!successMessage) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.3 } }}
      className="fixed bottom-10 min-w-125 max-w-96 bg-primary text-gray-800 border border-primary/20 shadow-2xl rounded-2xl"
    >
      <Alert className="border-none">
        <CheckCircle />
        <AlertTitle>Successful</AlertTitle>
        <AlertDescription className="text-gray-900/80">
          {successMessage}
        </AlertDescription>
        <AlertAction>
          <Button
            variant="ghost"
            className="border border-background"
            onClick={() => setSuccessMessageNull()}
          >
            Close
          </Button>
        </AlertAction>
      </Alert>
    </motion.div>
  );
}
