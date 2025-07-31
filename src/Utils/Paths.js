export const getBasePath = () => {
  let domain = window.location.origin;
  let folder = window.location.pathname;

  if (import.meta.env.MODE === "development") {
    domain = import.meta.env.VITE_API_HOST;
    folder = `/garden/samdyrk/`;
    //folder = `/demo/harvest/`;
  }
  return domain + folder;
};

export const plantApi = () => {
  return getBasePath() + "api/plants.php";
};

export const harvestApi = () => {
  return getBasePath() + "api/harvest.php";
};

export const replacementsApi = () => {
  return getBasePath() + "api/replacements.php";
};

export const pdfparserApi = () => {
  return getBasePath() + "api/pdfparser.php";
};

export const uploadPdfApi = () => {
  return getBasePath() + "api/uploadPdf.php";
};
