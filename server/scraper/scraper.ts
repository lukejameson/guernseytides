export async function getWebContent(url: string): Promise<string> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Error');
  }

  return response.text();
}
