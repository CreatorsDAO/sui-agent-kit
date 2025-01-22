export const logError = (error: any, context: string = "") => {
  console.error("=== Error Details ===");
  console.error(`Context: ${context}`);
  console.error("Message:", error.message);
  console.error("Stack:", error.stack);
  if (error.response) {
    console.error("Response data:", error.response.data);
    console.error("Response status:", error.response.status);
  }
  console.error("==================");
};
