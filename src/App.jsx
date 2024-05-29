import React, { useEffect, useState } from "react";
import "./assets/style.css";
import { FormToSticker } from "./components/FormToSticker/FormToSticker";
import { QRCodeList } from "./components/QrCode/QRCodeList";
import { handleFileUpload } from "./helpers/file.helper";

export default function App() {
    const [stickerData, setStickerData] = useState([]);
    const [barcode, setBarcode] = useState('');
    const [km, setKm] = useState('');
    const [owner, setOwner] = useState('');
    const [product, setProduct] = useState('');
    const [type, setType] = useState('');
    const [date, setDate] = useState('');
    const [fileName, setFileName] = useState('');
    const [expectedNumberOfProducts, setExpectedNumberOfProducts] = useState(16);
    const [mismatchMessage, setMismatchMessage] = useState('');
    const [selectedScanner, setSelectedScanner] = useState('scanner1');
    const [loading, setLoading] = useState(false);

    const handleNumberOfProductsChange = (e) => {
        setExpectedNumberOfProducts(e.target.value);
    };
    const handleChangeSelectScanner = (e) => {
        setSelectedScanner(e.target.value);
    };
    const handleChangeFileName = (e) => {
        setFileName(e.target.value);
    };
    const handleChangeBarcode = (e) => {
        setBarcode(e.target.value);
    };
    const handleChangeDate = (e) => {
        setDate(e.target.value);
    };
    const handleChangeKM = (e) => {
        setKm(e.target.value);
    };
    const handleChangeOwner = (e) => {
        setOwner(e.target.value);
    };
    const handleChangeProduct = (e) => {
        setProduct(e.target.value);
    };
    const handleChangeType = (e) => {
        setType(e.target.value);
    };

    useEffect(() => {
        document.getElementById('fileInput').addEventListener('change', (event) => handleFileUpload(event, setLoading, setStickerData));
        return () => {
            document.getElementById('fileInput').removeEventListener('change', (event) => handleFileUpload(event, setLoading, setStickerData));
        };
    }, []);

    return (
        <div className="App">
            <FormToSticker
                handleChangeDate={handleChangeDate}
                handleChangeBarcode={handleChangeBarcode}
                handleChangeKM={handleChangeKM}
                handleChangeOwner={handleChangeOwner}
                handleChangeProduct={handleChangeProduct}
                handleChangeType={handleChangeType}
                handleChangeFileName={handleChangeFileName}
                handleChangeSelectScanner={handleChangeSelectScanner}
                handleChangeNumberOfProductInPackage={handleNumberOfProductsChange}
                numberOfProductInPackage={expectedNumberOfProducts}
                setMismatchMessage={setMismatchMessage}
                mismatchMessage={mismatchMessage}
                isOpenForm={!stickerData.length}
                fileName={fileName}
                barcode={barcode}
                date={date}
                km={km}
                owner={owner}
                product={product}
                type={type}
                selectedScanner={selectedScanner}
            />

            {loading ? (
                <div style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1
                }}>LOADING.....</div>
            ) : (
                <QRCodeList
                    stickerData={stickerData}
                    barcode={barcode}
                    date={date}
                />
            )}
        </div>
    );
}
