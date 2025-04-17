import { useEffect, useState } from "react";

export default function App() {
  const [formData, setFormData] = useState({
    docName: "",
    surname: "",
    groupName: "",
    id: "",
    date: new Date().toISOString().split("T")[0],
  });

  const fieldLabels = {
    docName: "Název výkresu",
    surname: "Příjmení",
    groupName: "Název skupiny",
    id: "ID",
  };

  const maxFieldLengths = {
    docName: 40,
    surname: 20,
    groupName: 8,
    id: 8,
  };

  const [areFieldsValid, setAreFieldsValid] = useState(false);

  const [pdfLib, setPdfLib] = useState(null);
  const [fontkit, setFontkit] = useState(null);
  const [statusMessage, setStatusMessage] = useState("Načítání knihoven…");
  const isReady = pdfLib && fontkit && areFieldsValid;

  // Dynamically load pdf-lib and fontkit on mount
  useEffect(() => {
    const loadLibraries = async () => {
      const pdfLibModule = await import("pdf-lib");
      const fontkitModule = await import("@pdf-lib/fontkit");
      setPdfLib(pdfLibModule);
      setFontkit(fontkitModule.default); // default export
      setStatusMessage("");
    };
    loadLibraries();
  }, []);

  const handleChange = (e) => {
    const field = e.target;
    field.value = field.value.toUpperCase();
    const { name, value } = field;

    const updatedFormData = { ...formData, [name]: value };
    setFormData(updatedFormData);

    let hasInvalidField = false;
    let errorMessage = "";

    Object.entries(updatedFormData)
      .filter(([key]) => key !== "date")
      .forEach(([key, value]) => {
        const maxLength = maxFieldLengths[key] ?? 20;

        if (value.length === 0) {
          hasInvalidField = true;
        } else if (value.length > maxLength) {
          hasInvalidField = true;
          const label = fieldLabels[key] || key;
          errorMessage = `Pole „${label}“ je příliš dlouhé (${value.length}/${maxLength})`;
        }
      });

    setAreFieldsValid(!hasInvalidField);
    setStatusMessage(hasInvalidField ? errorMessage : "");
  };

  const generatePDF = async () => {
    const { PDFDocument, PageSizes } = pdfLib;

    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const A4_WIDTH = PageSizes.A4[0]; // width
    const A4_HEIGHT = PageSizes.A4[1]; // height

    const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]); // Portrait A4

    const fontBytes = await fetch("/fonts/osifont-lgpl3fe.ttf").then((res) =>
      res.arrayBuffer(),
    );
    const customFont = await pdfDoc.embedFont(fontBytes);

    const fontSize = 19;
    const margin = 28.35;
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();
    const usableWidth = pageWidth - 2 * margin;

    const { docName, surname, groupName, id, date } = formData;

    const date_object = new Date(date);
    const day = String(date_object.getDate()).padStart(2, "0");
    const month = String(date_object.getMonth() + 1).padStart(2, "0");
    const year = date_object.getFullYear();
    const formatted_date = `${day}.${month}.${year}`;

    // Top center
    page.drawText(docName, {
      x:
        margin +
        usableWidth / 2 -
        customFont.widthOfTextAtSize(docName, fontSize) / 2,
      y: pageHeight - margin - fontSize,
      size: fontSize,
      font: customFont,
    });

    // Bottom left
    const bottomLeftText = `${surname}/${groupName}`;
    page.drawText(bottomLeftText, {
      x: margin,
      y: margin,
      size: fontSize,
      font: customFont,
    });

    // Bottom right
    const bottomRightText = `${id}/${formatted_date}`;
    page.drawText(bottomRightText, {
      x:
        pageWidth -
        margin -
        customFont.widthOfTextAtSize(bottomRightText, fontSize),
      y: margin,
      size: fontSize,
      font: customFont,
    });

    // Margin debugging code
    // page.drawRectangle({
    //   x: margin,
    //   y: margin,
    //   width: pageWidth - 2 * margin,
    //   height: pageHeight - 2 * margin,
    //   borderColor: rgb(1, 0, 0),
    //   borderWidth: 1.5,
    // });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    // link.target = "_blank";
    link.download = `TZO-${formData.surname}-${formData.groupName}.pdf`;
    link.click();
  };

  const renderField = (name, placeholder) => (
    <>
      <label htmlFor={name}>{fieldLabels[name]}</label>
      <input
        name={name}
        placeholder={placeholder}
        value={formData[name]}
        onChange={handleChange}
        className="input"
      />
    </>
  );

  return (
    <div className="p-6 max-w-2xl w-full mx-auto space-y-1">
      {renderField("docName", "PRŮMĚTY")}
      {renderField("surname", "MENČER")}
      {renderField("groupName", "4ZS1")}
      {renderField("id", "KC-69")}
      <div className="flex flex-col">
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-fit my-3 input mx-auto"
        />
        <button
          onClick={generatePDF}
          disabled={!isReady || !areFieldsValid}
          className="bg-cyan-600 dark:bg-cyan-800 enabled:active:bg-cyan-700 dark:enabled:active:bg-cyan-900 border-2 border-neutral-700 enabled:hover:border-neutral-600 dark:border-neutral-600 dark:enabled:hover:border-neutral-700 disabled:opacity-50 rounded-sm my-1 py-1 px-2 w-fit mx-auto"
        >
          Stáhnout
        </button>
        <p className="text-center text-sm min-h-[1.25rem]">{statusMessage}</p>
      </div>
    </div>
  );
}
