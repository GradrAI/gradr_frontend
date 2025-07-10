export function convertGCSUrlToPublicUrl(fileUrl: string): string {
  if (typeof fileUrl !== "string" || !fileUrl.startsWith("gs://"))
    return fileUrl;
  const [, ...pathParts] = fileUrl.split("gs://");
  return `https://storage.googleapis.com/${pathParts.join("")}`;
}
