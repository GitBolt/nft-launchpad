export const postNetworkRequest = async (
  data: any,
  route: string,
  errorMessage?: string,
  ignoreErrorToast?: boolean,
) => {
  const request = await fetch(route, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  const response = await request.json();
  if (!request.ok && ignoreErrorToast) {
    throw new Error(errorMessage || response.error || response.detail);
  }
  return {
    response,
    request,
  };
};
  