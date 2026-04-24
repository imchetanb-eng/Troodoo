let pdfjsLibInstance: any = null;

export const setupPdfWorker = async () => {
  if (typeof window === 'undefined') return null;
  if (!pdfjsLibInstance) {
    // @ts-ignore
    const pdfjsLib = await import(/* webpackIgnore: true */ '/pdf.min.mjs');
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    pdfjsLibInstance = pdfjsLib;
  }
  return pdfjsLibInstance;
};

export { pdfjsLibInstance as pdfjsLib };
