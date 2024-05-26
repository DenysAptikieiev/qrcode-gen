import React from "react";
import styles from "./Form.module.scss";
import FileUpload from "../FileUpload/FileUpload";

export const FormToSticker = ({
  handleChangeBarcode,
  handleChangeDate,
  handleChangeKM,
  handleChangeOwner,
  handleChangeProduct,
  handleChangeType,
  handleChangeFileName,
  handleChangeSelectScaner,
  fileName,
  isOpenForm,
  km,
  owner,
  product,
  type,
  date,
  barcode,
  selectedScaner
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
          <select onChange={handleChangeSelectScaner} value={selectedScaner}>
            <option value={'scaner1'}>Scaner 1</option>
            <option value={'scaner2'}>Scaner 2</option>
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
          <FileUpload
            fileName={fileName}
            km={km}
            owner={owner}
            product={product}
            type={type}
            selectedScaner={selectedScaner}         
          />
        </form>
      </div>
    </div>
  );
};
