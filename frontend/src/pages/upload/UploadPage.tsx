import React, { useRef, useState } from "react";
import { Upload as UploadIcon, Loader, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { uploadService } from "@/api/services";
import { useDataStore } from "@/store";

const UploadPage: React.FC = () => {
  const { tenantId } = useDataStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadService.bulkUpload(formData);
      setUploadedCount(result?.success || 0);
      toast.success(`${result?.success || 0} records imported successfully!`);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      toast.error("Failed to upload file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Bulk Upload</h1>

      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow-md p-12 text-center border-2 border-dashed border-slate-300 hover:border-primary-500 transition-colors cursor-pointer">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.json"
          onChange={handleFileSelect}
          disabled={loading}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="flex flex-col items-center justify-center w-full"
        >
          {loading ? (
            <>
              <Loader
                className="animate-spin text-primary-600 mb-4"
                size={48}
              />
              <p className="text-lg font-semibold text-slate-900">
                Uploading...
              </p>
            </>
          ) : (
            <>
              <UploadIcon className="text-primary-600 mb-4" size={48} />
              <p className="text-lg font-semibold text-slate-900">
                Click to upload
              </p>
              <p className="text-sm text-slate-500 mt-1">or drag and drop</p>
              <p className="text-xs text-slate-400 mt-2">
                CSV, XLSX, XLS, or JSON
              </p>
            </>
          )}
        </button>
      </div>

      {/* Success Message */}
      {uploadedCount > 0 && (
        <div className="bg-success-50 border border-success-200 rounded-lg p-6 flex items-start gap-4">
          <CheckCircle
            className="text-success-600 flex-shrink-0 mt-1"
            size={24}
          />
          <div>
            <h3 className="font-semibold text-success-900">Upload Complete!</h3>
            <p className="text-success-700 mt-1">
              Successfully imported {uploadedCount} records into your inventory.
            </p>
          </div>
        </div>
      )}

      {/* Template Info */}
      <div className="bg-slate-50 rounded-lg p-6 space-y-3">
        <h3 className="font-semibold text-slate-900">Required CSV Format</h3>
        <div className="text-sm text-slate-600 space-y-2">
          <p>Your file should include the following columns:</p>
          <div className="bg-white p-3 rounded border border-slate-200 font-mono text-xs overflow-x-auto">
            productId, qty, minQty, cost
          </div>
          <p className="mt-4">Example:</p>
          <div className="bg-white p-3 rounded border border-slate-200 font-mono text-xs overflow-x-auto">
            <pre>{`PROD-001, 100, 20, 5.50
PROD-002, 50, 10, 3.25
PROD-003, 200, 50, 1.99`}</pre>
          </div>
        </div>
      </div>

      {/* Supported Formats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-2xl font-bold text-primary-600">.CSV</p>
          <p className="text-xs text-slate-600 mt-2">Comma Separated</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-2xl font-bold text-primary-600">.XLSX</p>
          <p className="text-xs text-slate-600 mt-2">Excel 2007+</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-2xl font-bold text-primary-600">.XLS</p>
          <p className="text-xs text-slate-600 mt-2">Excel 97-2003</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 text-center">
          <p className="text-2xl font-bold text-primary-600">.JSON</p>
          <p className="text-xs text-slate-600 mt-2">JSON Array</p>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">
          Tips for bulk upload:
        </h3>
        <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
          <li>Ensure all required columns are present</li>
          <li>Use correct data types (numbers for qty, cost, etc.)</li>
          <li>Check that productId values are unique</li>
          <li>
            Remove any header rows before uploading (first row should be data)
          </li>
          <li>Maximum file size: 10MB</li>
        </ul>
      </div>
    </div>
  );
};

export default UploadPage;
