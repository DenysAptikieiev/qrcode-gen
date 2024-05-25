import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const FileUpload = ({
  fileName,
  km,
  owner,
  product,
  type,
}) => {
  if (!fileName) fileName = "default Name";
  if (!owner) owner = "default Owner";
  if (!product) product = "default Product";
  if (!type) type = "default Type";
  if (!km) km = "default Type";

  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const parseFile = () => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split("\n");
      let currentPackage = "";
      const data = [];

      lines.forEach((line) => {
        if (line.startsWith("000")) {
          currentPackage = line.trim();
        } else if (line.startsWith("010")) {
          const cleanedLine = line.substring(0, 32).trim();
          const gtin = line.slice(2, 16);
          if (cleanedLine) {
            data.push({
              КИ: cleanedLine,
              "SSCC 1 (агрегат-мешок)": currentPackage,
              "СТАТУС КМ": km,
              ВЛАДЕЛЕЦ: owner,
              ТОВАР: product,
              ТИП: type,
              "EAN(джийтин)": gtin,
            });
          }
        }
      });

      createExcelFile(data);
    };
    reader.readAsText(file);
  };

  const calculateColumnWidths = (data) => {
    if (data.length === 0) return [];
    const columnWidths = {};
    const keys = Object.keys(data[0]);

    keys.forEach(key => {
      columnWidths[key] = 10;
    });

    data.forEach(item => {

      keys.forEach(key => {
        const itemLength = item[key].length;
        if (itemLength > columnWidths[key]) {
          columnWidths[key] = itemLength + 5;
        }
      });
    });

    return keys.map(key => ({ width: columnWidths[key] }));
  };

  const createExcelFile = (data) => {
    const rows = data.map((row) => ({
      КИ: row["КИ"],
      "SSCC 1 (агрегат-мешок)": row["SSCC 1 (агрегат-мешок)"],
      "СТАТУС КМ": row["СТАТУС КМ"],
      ВЛАДЕЛЕЦ: row["ВЛАДЕЛЕЦ"],
      ТОВАР: row["ТОВАР"],
      ТИП: row["ТИП"],
      "EAN(джийтин)": row["EAN(джийтин)"],
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    
    const colWidths = calculateColumnWidths(rows);

    worksheet['!cols'] = colWidths;
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `${fileName}.xlsx`);
  };

  return (
    <div>
      <input type="file" accept=".txt" onChange={handleFileChange} />
      <button type="button" onClick={parseFile} disabled={!file}>
        Parse and Download Excel
      </button>
    </div>
  );
};

export default FileUpload;
