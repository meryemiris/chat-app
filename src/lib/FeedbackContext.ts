import { alertMessage } from "@/components/Alert";
import { createContext } from "react";

const FeedbackContext = createContext({
  alert: null as alertMessage | null,
  setAlert: (alert: alertMessage | null) => {},

  isLoading: false,
  setIsLoading: (isLoading: boolean) => {},

  messageLoading: false,
  setMessageLoading: (messageLoading: boolean) => {},
});

export default FeedbackContext;
