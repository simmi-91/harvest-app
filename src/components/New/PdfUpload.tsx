import React, { useState, useEffect } from "react";
import { pdfparserApi, uploadPdfApi } from "../Utils/Paths";
import { TextField, Stack, Button } from "@mui/material";
import { Event } from "../types";

type fileEntry = {
  modified: number;
  name: string;
  path: string;
  readable: boolean;
  size: number;
};

const PdfUpload = () => {
  const [error, setError] = useState("");

  const [selectedFile, setSelectedFile] = useState();
  const [uploadStatus, setUploadStatus] = useState("");
  const [parseStatus, setParseStatus] = useState("");
  const [folderContent, setFolderContent] = useState<fileEntry[]>([]);
  const [fileContent, setFileContent] = useState([
    "Foto: Ulven Park hagelag 2021\n\nHØSTE-\nMELDING\n\nUKE 21\n\nUlven Park\nsamdyrkelag U-REIST IS",
    "Høstemelding uke 21\n\n \n\n \n\n \n\n \n\n \n\n \n\n \n\n \n\n \n\n \n\nGrønnsak Bednr. —|Enkeltandel/ | Familie-\nparandel andel\n\nPipeløk Åkeren på | 5 stk 10 stk\nUlven T\n\nLøpestikke Åkeren på | 4 stilker T stilker\nUlven T\n\nOregano Tak B, En håndfull To\nkasse 18 håndfuller\nUlvenpark\n\nTimian Tak L, Så mye du Så mye\nkasse 48 | trenger du trenger\nUlvenpark\n\nStemorsblomst | Tak B, Nok til pynt til | Nok til\nkasse 19- |ensalat/kake | pynt til to\n23 salater/ka\nUlvenpark ke\n\nRabarbra NY! TakF+D |4 stilker T stilker\nUlven T\n\nGressløk NY! TakF+D | En halv plante |1 plante\nUlven T\n\nMynte NY! Tak F+D | Så mye du Så mye\nUlven T trenger du trenger\n\n \n\n \n\n \n\n \n\n \n\nU-REIST Fresgopet",
    "Slik finner du frem:\n1. Se kartene på neste sidene for dyrkekasser på Ulven Park\n\n2. Hver pallekarm er markert med tall. Bruk tall, kart og\nmerkepinner for å finne frem.\n\n3. Bedene på bakkeplan på Ulven T er markert med merkepinner.\nPlanter som er på takene kan identifiseres ved bruk av bildene\nsom er inkludert i dette dokumentet. Linkene i tabellen leder\n\ndeg fram til bilder som du kan bruke til å identifisere hver enkel\nplante på takene\n\nHøstemeldingen gjelder for en uke av gangen.\nTa med egen saks, samt kurv eller bokser å høste.\n*SMDV: så mye du vil\n\n*SMDT: så mye du trenger\n\n«—  ILBAKE TIL OVERSIKTEN U:REIST Iiesjapet",
    "Oppgang B\n\n \n\nOppgang F\n\n \n\n«—— TILBAKE TIL OVERSIKTEN U-REIST Ifieskopet",
    "Oppgang L\n\n \n\n \n\n \n\n———\n\nFR\nTILBAKE TIL OVERSIKTEN U-REIST IBiesiopet\nTILBAKE TIL OVERSIKTEN",
    "PIPELØK\n\nALLIUM FISTULOSUM\n\n \n\nSLIK HØSTER DU\n\nHøst de grønne toppene. Bruk saks eller kniv\nog ta alle bladene på planten samtidig, rett\novenfor der de begynner å dele seg. Da vil\n\nplanten raskt vokse opp igjen med nye skudd,\nog vi kan fortsette å høste hele sesongen.\n\nTIPS\nToppene på pipeløken kan brukes på samme måte som\ngressløk, f.eks. frisk i salater og dressinger, eller\nsmørdampet, stekt eller i wok. Den bør ikke varmebehandles\nlenge, da faller den litt sammen.\n\n«—— TILBAKE TIL OVERSIKTEN U-REIST Ifieskopet",
    "URTER:\nLØPSTIKKE\n\nLEVISTICUM OFFICINALE\n\n \n\nSLIK HØSTER DU\n\nHøstes ved å klippe av toppen. Bruk saks eller\nkniv.\n\nTIPS\nHele planten har en kraftig, sellerilignende smak som gjør at\nurten passer fint i supper, sauser og gryteretter. Aromaen er\nkraftig, så bruk den forsiktig slik at den ikke tar helt over.\nBladene kan brukes i stedet for buljongterninger, et lite blad\nholder.\n\n«—— TILBAKE TIL OVERSIKTEN U-REIST Ifieskopet",
    "URTER: OREGANO\n\nORIGANUM VULGARE\n\n \n\nSLIK HØSTER DU\n\nKlipp eller knip av toppen på planta. La ca.\nhalvparten av plantens høyde stå igjen. Den\ndelen som står igjen forgrener se og lager nye\nskudd.\n\nTIPS\nKlassisk urt til pizza og pastaretter. Egendyrket, fersk oregano\nsmaker mye bedre enn tørket fra butikken!\n\n«— 11LBAKE TIL OVERSIKTEN U:REIST |fiessjopat",
    "URTER: TIMIAN\n\nTHYMUS VULGARIS\n\n \n\nSLIK HØSTER DU\n\nHøstes ved å klippe av toppen. Bruk saks eller\nkniv. Ta flere skudd med en gang og kutt over\nca. 7 av høyden på planten.\n\nTIPS\nTimian er svært anvendelig og passer i mange ulike slags\nretter. Tåler koking godt. Blir også god urtete.\n\n«—  ILBAKE TIL OVERSIKTEN U-REIST IBiesiopet",
    "SPISELIGE BLOMSTER:\nSTEMORSBLOMST\n\nVIOLA TRICOLOR\n\n \n\nSLIK HØSTER DU\n\nKnip kun av selve blomsterhodet med hendene.\nLa knupper sitte igjen på planten slik at det blir\nflere blomster.\n\nTIPS\nFriske eller kandiserte stemorsblomster kan for eksempel\nbrukes som pynt på desserter og kaker. De pynter også\nopp enhver salat, eller du kan fryse dem i isbiter!\n\n«—  ILBAKE TIL OVERSIKTEN U-REIST IBiesiopet",
    "RABARBRA\n\nRHEUM RHABARBARUM\n\n \n\nSLIK HØSTER DU\n\nTa en av de ytre stilkene med hendene og dra\nopp, med en liten vridning. Ikke klipp eller skjær\nav stilkene, da det som er igjen lett begynner å\nråtne. Hvis vi høster flittig setter plantene flere\nstilker. Bladene kan du la ligge igjen på bakken.\nMerk: Rabarbrablader skal ikke spises.\nTIPS\nSaft, pai, kompott, syltetøy! Spede stilker trengs ikke å\n\nskrelles, men på de grovere stilkene bør det ytterste laget av\nskallet fjernes før tilberedning.\n\n«———- 1ILBAKE TIL OVERSIKTEN U*KEIS I |Fåreskjøpst",
    "URTER:\nGRESSLØK\n\nALLIUM SCHOENOPRASUM\n\n \n\nSLIK HØSTER DU\n\nBruk saks eller kniv og klipp ned hele\ngressløktuen et par centimeter over bakken. Fra\nden nedklipte delen vil det snart begynne å\nvokse ut ny gressløk.\n\nTIPS\nSpis knoppene! Fres dem i litt olivenolje og server som\ntilbehør. Godt med litt salt og balsamico på. Stengelen som\nblomsten sitter på er hard og sorteres ut fra resten av\nbunten.\n\n«—— TILBAKE TIL OVERSIKTEN U-REIST Ifieskopet",
    "URTER: MYNTE\n\nMENTHA\n\n \n\nSLIK HØSTER DU\n\nKlipp eller knip av toppen på planta. La minst et\npar bladpar på stilken stå igjen. Den delen som\nstår igjen forgrener se og lager nye skudd.\n\nTIPS\nDet finnes mange ulike typer mynte. Peppermynte,\ngrønnmynte og eplemynte er noen eksempler. Mynte har\nfrisk smak og passer godt strimlet i salater, som te og i\nkalde drikker.\n\n«— 11LBAKE TIL OVERSIKTEN U:REIST |fiessjopat",
  ]);

  const handleFileChange = (e: Event) => {
    setSelectedFile(e.target.files[0]); // Get the first selected file
  };

  const getFolderContent = async () => {
    try {
      const response = await fetch(`${uploadPdfApi()}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to get folder content");
      }
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      if (result.folder_content) {
        setFolderContent(result.folder_content);
      } else {
        setFolderContent([]);
      }

      return result;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        setUploadStatus(`Error ved henting av filer i mappen. ${err.message}`);
      } else {
        setError("Ukjent error ved henting av høstedata");
      }
    } finally {
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("myFile", selectedFile);

    setUploadStatus("Uploading...");
    try {
      const response = await fetch(`${uploadPdfApi()}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to post pdf");
      }
      const result = await response.json();
      console.log("result: ", result);

      if (!result.success) {
        throw new Error(result.message);
      }

      setUploadStatus("Upload successful!");
      getFolderContent();

      return result;
    } catch (err) {
      if (err instanceof Error) {
        setUploadStatus(`Error ved opplasting av pdf. ${err.message}`);
      } else {
        setUploadStatus("Ukjent error ved opplasting av pdf");
      }
    }
  };

  const parseFile = async (path: string) => {
    setParseStatus("Parsing...");

    try {
      const url = `${pdfparserApi()}?path=${path}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch file data: ${response.status}`);
      }
      const data = await response.json();
      console.log("data: ", data);

      if (data.success) {
        setParseStatus("successful!");
        setFileContent(data.pdf_content);
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      if (err instanceof Error) {
        setParseStatus(`Error ved parsing av pdf. ${err.message}`);
      } else {
        setParseStatus("Ukjent error ved henting av høstedata");
      }
    }
  };

  const cleanText = (text: string) => {
    let cleanedtext = text;
    cleanedtext = cleanedtext.replace(/\n\n\s*/g, "\n\n");
    cleanedtext = cleanedtext.replace(/«—.+$/, "");
    cleanedtext = cleanedtext.replace(/U-REIST.+$/, "");
    return cleanedtext;
  };

  const displayFileContent = () => {
    const cleanedContent = fileContent.map((page) => cleanText(page));

    const pages = cleanedContent.map((text, i) => ({
      pagenumber: i + 1,
      text: text,
    }));

    let html = pages.map((page) => (
      <p key={page.pagenumber}>
        <b>side: {page.pagenumber}</b>
        <br />
        <span>{page.text}</span>
      </p>
    ));
    //<br /><textarea value={page.text} />
    return <Stack>{html}</Stack>;
  };

  useEffect(() => {
    console.log("folderContent", folderContent);
  }, [folderContent]);

  return (
    <>
      <p>* TODO *</p>

      <p>
        <input type="file" onChange={handleFileChange} />
        {selectedFile && <p>Selected file: {selectedFile.name}</p>}
        <button onClick={handleUpload}>upload</button>
        {uploadStatus && (
          <span>
            <br />
            {uploadStatus}
          </span>
        )}
      </p>

      {folderContent ? (
        <div>
          <b>
            Filer: <button onClick={() => getFolderContent()}>Refresh</button>
          </b>
          <table>
            <tbody>
              {folderContent.map((fil) => (
                <tr key={fil.modified}>
                  <td>{fil.name}</td>
                  <td>
                    <button onClick={() => parseFile(fil.path)}>
                      Les fil-innhold
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {parseStatus ? (
        <div>
          <p>Status: {parseStatus}</p>
        </div>
      ) : null}

      {fileContent ? displayFileContent() : null}
    </>
  );
};

export default PdfUpload;
