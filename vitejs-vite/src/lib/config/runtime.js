const getSearchParams = () => {
  if (typeof window === 'undefined') {
    return new URLSearchParams();
  }

  return new URLSearchParams(window.location.search);
};

export const isGeneratorLabEnabled = () => {
  const searchParams = getSearchParams();

  return (
    searchParams.get('lab') === '1' ||
    searchParams.get('e2e') === '1' ||
    searchParams.get('demo') === '1'
  );
};
