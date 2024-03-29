import { alertMessage } from "@/components/utils/Alert";
import { createContext } from "react";

const FeedbackContext = createContext({
  alert: null as alertMessage | null,
  setAlert: (alert: alertMessage | null) => {},

  isLoading: false,
  setIsLoading: (isLoading: boolean) => {},
});

export default FeedbackContext;
