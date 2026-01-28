import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, X } from 'lucide-react';

const FileUpload = ({ onFileSelect }) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const inputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        if (file.type.includes('sheet') || file.type.includes('excel') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            setSelectedFile(file);
            onFileSelect(file);
        } else {
            alert("Please upload an Excel file (.xlsx, .xls)");
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        onFileSelect(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div className="w-full">
            <div
                className={`relative flex min-h-[150px] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all 
          ${dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-white/20 hover:border-white/40 hover:bg-white/5'}
          ${selectedFile ? 'border-green-500/50 bg-green-500/5' : ''}
        `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !selectedFile && inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept=".xlsx, .xls"
                    onChange={handleChange}
                />

                {selectedFile ? (
                    <div className="flex flex-col items-center gap-2">
                        <FileSpreadsheet size={40} className="text-green-400" />
                        <p className="font-medium text-white">{selectedFile.name}</p>
                        <p className="text-sm text-gray-400">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                        <button
                            onClick={(e) => { e.stopPropagation(); clearFile(); }}
                            className="mt-2 flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-400 hover:bg-red-500/20"
                        >
                            <X size={12} /> Remove
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-center">
                        <Upload size={40} className="text-blue-400 mb-2" />
                        <p className="font-medium text-white">Click or drag Excel file here</p>
                        <p className="text-sm text-gray-400">Supports .xlsx, .xls</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUpload;
