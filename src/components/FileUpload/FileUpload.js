import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const FileUpload = ({
                        fileName,
                        km,
                        owner,
                        product,
                        type,
                        selectedScanner,
                        numberOfProductInPackage,
                        setMismatchMessage,
                        mismatchMessage
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
            const data = [];
            let currentPackage = '';
            let currentPackageCount = 0;
            let mismatches = [];

            if (selectedScanner === "scanner1") {
                lines.forEach((line) => {
                    const parts = line.split("\t");
                    if (parts.length === 3) {
                        const content = parts[1];
                        if (content.startsWith("000")) {
                            if (currentPackage && +currentPackageCount !== +numberOfProductInPackage) {
                                mismatches.push(`Package ${currentPackage} contains ${currentPackageCount} products.`);
                            }
                            currentPackage = content;
                            currentPackageCount = 0;
                        } else if (content.includes("(01)") && content.includes("(21)")) {
                            let cleanedLine = content.replace("(01)", "01").replace("(21)", "21");
                            if (cleanedLine.includes("91EE")) {
                                cleanedLine = cleanedLine.split("91EE")[0].trim();
                                const gtin = cleanedLine.slice(3, 16);
                                data.push({
                                    КИ: cleanedLine,
                                    "SSCC 1 (агрегат-мешок)": currentPackage,
                                    "СТАТУС КМ": km,
                                    ВЛАДЕЛЕЦ: owner,
                                    ТОВАР: product,
                                    ТИП: type,
                                    "EAN(джийтин)": gtin,
                                });
                                currentPackageCount++; // Увеличиваем счетчик продуктов
                            }
                        }
                    }
                });
            }

            if (selectedScanner === "scanner2") {
                lines.forEach((line) => {
                    if (line.startsWith("000")) {
                        if (currentPackage && +currentPackageCount !== +numberOfProductInPackage) {
                            mismatches.push(`Package ${currentPackage} contains ${currentPackageCount} products.`);
                        }

                        currentPackageCount = 0;
                        currentPackage = line.trim();
                    } else if (line.startsWith("010")) {
                        const cleanedLine = line.substring(0, 31).trim();
                        const gtin = line.slice(3, 16);
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
                            currentPackageCount++; // Увеличиваем счетчик продуктов
                        }
                    }
                });
            }

            if (+currentPackageCount !== +numberOfProductInPackage) {
                mismatches.push(`Package ${currentPackage} contains ${currentPackageCount} products.`);
            }

            if (mismatches.length > 0) {
                setMismatchMessage(mismatches.join('\n'));
            } else {
                setMismatchMessage('')
            }

            createExcelFile(data);
        };

        reader.readAsText(file);
    };

    const calculateColumnWidths = (data) => {
        if (data.length === 0) return [];
        const columnWidths = {};
        const keys = Object.keys(data[0]);

        keys.forEach((key) => {
            columnWidths[key] = 10;
        });

        data.forEach((item) => {
            keys.forEach((key) => {
                const itemLength = item[key] ? item[key].length : 0;
                if (itemLength > columnWidths[key]) {
                    columnWidths[key] = itemLength + 5;
                }
            });
        });

        return keys.map((key) => ({ width: columnWidths[key] }));
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

        worksheet["!cols"] = colWidths;
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
            {mismatchMessage && (
                <div>
                    <h3>Mismatched Packages</h3>
                    <h4>Expected: {+numberOfProductInPackage} in each package</h4>
                    <pre style={{maxHeight: '150px', overflow: 'auto'}}>{mismatchMessage}</pre>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
