export function hasBlobStorageConfig() {
  return Boolean(
    process.env.BLOB_STORE_ID ||
      process.env.BLOB_READ_WRITE_TOKEN ||
      process.env.VERCEL_OIDC_TOKEN,
  );
}

export function getBlobStorageErrorMessage(error, fallback = "Vercel Blob konnte nicht speichern.") {
  const message = error instanceof Error ? error.message : "";

  if (
    message.includes("No blob credentials found") ||
    message.includes("No read-write token found") ||
    message.includes("BLOB_STORE_ID") ||
    message.includes("oidcToken")
  ) {
    return "Vercel Blob ist noch nicht fuer dieses Deployment verbunden. Bitte Blob Store mit dem Projekt verbinden und danach neu deployen.";
  }

  if (message.includes("OIDC is enabled") || message.includes("oidc_environment_not_allowed")) {
    return "Vercel Blob OIDC ist fuer diese Umgebung nicht freigeschaltet. Bitte Production/Preview im Blob Store aktivieren und neu deployen.";
  }

  if (message.includes("Access denied")) {
    return "Vercel Blob Zugriff wurde abgelehnt. Bitte die Blob-Projektverbindung und den letzten Redeploy pruefen.";
  }

  return message || fallback;
}
