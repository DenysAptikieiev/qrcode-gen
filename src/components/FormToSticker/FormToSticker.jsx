import React, {useState} from "react";
import styles from "./Form.module.scss";
import FileUpload from "../FileUpload/FileUpload";
import {MissingProducts} from "../MissingProducts/MissingProducts";
import * as XLSX from "xlsx";
import {saveAs} from 'file-saver';

export const FormToSticker = ({
                                  handleChangeBarcode,
                                  handleChangeDate,
                                  handleChangeKM,
                                  handleChangeOwner,
                                  handleChangeProduct,
                                  handleChangeType,
                                  handleChangeFileName,
                                  handleChangeSelectScanner,
                                  handleChangeNumberOfProductInPackage,
                                  setMismatchMessage,
                                  mismatchMessage,
                                  numberOfProductInPackage,
                                  fileName,
                                  isOpenForm,
                                  km,
                                  owner,
                                  product,
                                  type,
                                  date,
                                  barcode,
                                  selectedScanner
                              }) => {
    const [file1, setFile1] = useState(null);
    const [file2, setFile2] = useState(null);

    const readExcel = async (file) => {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {header: 1});
    };

    const extractFirstFileProductNumbers = (rows) => {
        return new Set(rows.slice(1).map(row => row[1])); // Извлечение из второго столбца
    };

    const extractSecondFileProductNumbers = (rows) => {
        const boxData = {};
        let currentBox = null;

        rows.forEach(row => {
            if (/^\d+$/.test(row[1])) { // Проверка, что строка состоит только из цифр (номер коробки)
                currentBox = row[1]; // Присваиваем номер коробки
                boxData[currentBox] = []; // Инициализируем массив для продуктов
            } else if (currentBox && row[1]) {
                // Если у нас есть текущая коробка и строка содержит код продукта
                const productCode = row[1]
                    .replace(/\(01\)/, '01')  // Убираем скобки вокруг (01)
                    .replace(/\(21\)/, '21')  // Убираем скобки вокруг (21)
                    .split('91EE')[0];       // Убираем все после '91EE'
                boxData[currentBox].push(productCode);
            }
        });

        return boxData;
    };

    const createExcelFile = (data, name) => {
        const rows = data.map((row, index) => ({
            "№": index + 1,
            ...row
        }));
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        const colWidths = calculateColumnWidths(rows);
        worksheet["!cols"] = colWidths;
        const excelBuffer = XLSX.write(workbook, {bookType: "xlsx", type: "array"});
        const blob = new Blob([excelBuffer], {type: "application/octet-stream"});
        saveAs(blob, `${name}.xlsx`);
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

        return keys.map((key) => ({width: columnWidths[key]}));
    };

    const handleCompare = async () => {
        if (!file1 || !file2) {
            alert('Please upload both files.');
            return;
        }

        const [firstData, secondData] = await Promise.all([readExcel(file1), readExcel(file2)]);

        const firstProductNumbers = extractFirstFileProductNumbers(firstData);
        const secondProductNumbers = extractSecondFileProductNumbers(secondData);
        const finalData = [];
        const boxCountData = [];
        const invalidBoxes = [];
        for (const [box, products] of Object.entries(secondProductNumbers)) {
            const validProducts = products.filter(product => firstProductNumbers.has(product));
            const invalidProducts = products.filter(product => !firstProductNumbers.has(product));
            // Финальный файл
            validProducts.forEach(prod => {
                finalData.push({
                    КИ: prod,
                    "SSCC 1 (агрегат-мешок)": box,
                    "СТАТУС КМ": km,
                    ВЛАДЕЛЕЦ: owner,
                    ТОВАР: product,
                    ТИП: type,
                    "EAN(джийтин)": prod.slice(3, 16) // Assuming EAN not provided in input, leave blank
                });
            });

            // Набор коробок с количеством товара
            boxCountData.push({
                "№": boxCountData.length + 1,
                "Номер коробки": box,
                "Количество товаров": validProducts.length,
                "Маркировка": +validProducts.length >= +numberOfProductInPackage ? "Valid" : "INVALID"
            });

            // Список коробок с неправильными кодами
            if (invalidProducts.length > 0) {
                invalidBoxes.push([box]);
                invalidProducts.forEach(product => {
                    invalidBoxes.push([product]);
                })
            }
        }

        createExcelFile(finalData, `${fileName}_Final`);
        createExcelFile(boxCountData, `${fileName}_BoxCount`);
        createExcelFile(invalidBoxes, `${fileName}_InvalidBoxes`);
    };

    const handleFileChange = (e, setFile) => {
        setFile(e.target.files[0]);
    };

    return (
        <div className={`${styles.wrapper} ${!isOpenForm ? styles.hide : ""}`}>
            <div className={styles.appHeader}>
                <p>Scrolling popup</p>
                <form className={styles.formToSticker}>
                    <fieldset>
                        <legend>Sticker generator:</legend>
                        <label>
                            Barcode:
                            <input
                                type="number"
                                onChange={handleChangeBarcode}
                                value={barcode}
                            />
                        </label>
                        <label>
                            Date of made:
                            <input type="date" onChange={handleChangeDate} value={date}/>
                        </label>
                        <label htmlFor="fileInput" className={styles.fileUpload}>
                            Upload File
                            <input
                                style={{display: "none"}}
                                id="fileInput"
                                type="file"
                                accept="application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                disabled={!date || !barcode}
                            />
                            {!date || !barcode ? (
                                <span className={styles.errorMessage}>
                                Please enter date and barcode
                            </span>
                            ) : null}
                        </label>
                    </fieldset>
                </form>
                <form className={styles.formToPackages}>
                    <fieldset>
                        <legend>Compare Order vs Final:</legend>
                        <MissingProducts/>
                    </fieldset>
                </form>
                <form className={styles.formToPackages}>
                    <fieldset>
                        <legend>Final file generator:</legend>
                        <label>
                            Выберите сканер:
                            <select onChange={handleChangeSelectScanner} value={selectedScanner}>
                                <option value={'scanner1'}>Scanner 1</option>
                                <option value={'scanner2'}>Scanner 2</option>
                            </select>
                        </label>
                        <label>
                            Имя файла:
                            <input type="text" onChange={handleChangeFileName} value={fileName}/>
                        </label>
                        <label>
                            СТАТУС КМ:
                            <input type="text" onChange={handleChangeKM} value={km}/>
                        </label>
                        <label>
                            ВЛАДЕЛЕЦ:
                            <input type="text" onChange={handleChangeOwner} value={owner}/>
                        </label>
                        <label>
                            ТОВАР:
                            <input type="text" onChange={handleChangeProduct} value={product}/>
                        </label>
                        <label>
                            ТИП:
                            <input type="text" onChange={handleChangeType} value={type}/>
                        </label>
                        <label>
                            Количество товара в упаковке:
                            <input type="number" onChange={handleChangeNumberOfProductInPackage}
                                   value={numberOfProductInPackage}/>
                        </label>
                        <FileUpload
                            fileName={fileName}
                            km={km}
                            owner={owner}
                            product={product}
                            type={type}
                            selectedScanner={selectedScanner}
                            numberOfProductInPackage={numberOfProductInPackage}
                            setMismatchMessage={setMismatchMessage}
                            mismatchMessage={mismatchMessage}
                        />
                    </fieldset>
                </form>

                <form>
                    <fieldset>
                        <legend>Compare & Final file generator:</legend>
                        <label>
                            Имя файла:
                            <input type="text" onChange={handleChangeFileName} value={fileName}/>
                        </label>
                        <label>
                            СТАТУС КМ:
                            <input type="text" onChange={handleChangeKM} value={km}/>
                        </label>
                        <label>
                            ВЛАДЕЛЕЦ:
                            <input type="text" onChange={handleChangeOwner} value={owner}/>
                        </label>
                        <label>
                            ТОВАР:
                            <input type="text" onChange={handleChangeProduct} value={product}/>
                        </label>
                        <label>
                            ТИП:
                            <input type="text" onChange={handleChangeType} value={type}/>
                        </label>
                        <label>
                            Количество товара в упаковке:
                            <input type="number" onChange={handleChangeNumberOfProductInPackage}
                                   value={numberOfProductInPackage}/>
                        </label>
                        <div>
                            <label>
                                First File (Order):
                                <input type="file" onChange={(e) => handleFileChange(e, setFile1)}/>
                            </label>
                        </div>
                        <div>
                            <label>
                                Second File (Scan Result):
                                <input type="file" onChange={(e) => handleFileChange(e, setFile2)}/>
                            </label>
                        </div>
                        <button type='button' onClick={handleCompare}>Compare Files</button>
                    </fieldset>
                </form>
            </div>
        </div>
    );
};
