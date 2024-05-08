import { createContext } from "react";

const FeedbackContext = createContext({
	isLoading: false,
	setIsLoading: (isLoading: boolean) => {},
});

export default FeedbackContext;
