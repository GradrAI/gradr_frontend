const createCustomUrl = (name: string) => {
  const base = import.meta.env.DEV ? "localhost:5173" : "gradrai.com";
  return `http://${name}.${base}/app/assessments`;
};

export default createCustomUrl;
