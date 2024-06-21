import React from "react";
import styles from "./Form.module.scss";
import FileUpload from "../FileUpload/FileUpload";
import {MissingProducts} from "../MissingProducts/MissingProducts";

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
    return (
        <div className={`${styles.wrapper} ${!isOpenForm ? styles.hide : ""}`}>
            <div className={styles.appHeader}>
                <form className={styles.formToSticker}>
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
                        <input type="date" onChange={handleChangeDate} value={date} />
                    </label>
                    <label htmlFor="fileInput" className={styles.fileUpload}>
                        Upload File
                        <input
                            style={{ display: "none" }}
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
                </form>
                <form className={styles.formToPackages}>
                    <label>
                        Выберите сканер:
                        <select onChange={handleChangeSelectScanner} value={selectedScanner}>
                            <option value={'scanner1'}>Scanner 1</option>
                            <option value={'scanner2'}>Scanner 2</option>
                        </select>
                    </label>
                    <label>
                        Имя файла:
                        <input type="text" onChange={handleChangeFileName} value={fileName} />
                    </label>
                    <label>
                        СТАТУС КМ:
                        <input type="text" onChange={handleChangeKM} value={km} />
                    </label>
                    <label>
                        ВЛАДЕЛЕЦ:
                        <input type="text" onChange={handleChangeOwner} value={owner} />
                    </label>
                    <label>
                        ТОВАР:
                        <input type="text" onChange={handleChangeProduct} value={product} />
                    </label>
                    <label>
                        ТИП:
                        <input type="text" onChange={handleChangeType} value={type} />
                    </label>
                    <label>
                        Количество товара в упаковке:
                        <input type="number" onChange={handleChangeNumberOfProductInPackage}
                               value={numberOfProductInPackage} />
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
                </form>
                <form>
                    <MissingProducts/>
                </form>
            </div>
        </div>
    );
};
