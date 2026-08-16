import { useState, useRef } from 'react';
import { useRequestUploadUrl } from '@workspace/api-client-react';
import { Image as ImageIcon, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string | null;
  onChange: (path: string | null) => void;
  className?: string;
  label?: string;
}

export function ImageUpload({ value, onChange, className, label = "Upload Image" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: requestUploadUrl } = useRequestUploadUrl();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      const { uploadURL, objectPath } = await requestUploadUrl({
        data: {
          contentType: file.type,
          name: file.name,
          size: file.size,
        }
      });

      // Upload directly to GCS
      const res = await fetch(uploadURL, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!res.ok) {
        throw new Error('Failed to upload file to storage');
      }

      onChange(objectPath);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-medium text-stage-dark/70 font-sans">{label}</label>
      
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-[#DCD6CC] bg-white group aspect-video max-w-sm">
          <img 
            src={`/api/storage/public-objects/${value}`} 
            alt="Uploaded" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={() => onChange(null)}
              className="bg-white text-red-500 rounded-full p-2 hover:scale-110 transition-transform shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full max-w-sm aspect-video border-2 border-dashed border-[#DCD6CC] rounded-xl flex flex-col items-center justify-center text-stage-dark/50 hover:bg-[#EBE7DF] hover:border-stage-mint/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white"
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-stage-mint" />
          ) : (
            <ImageIcon className="w-8 h-8 mb-2" />
          )}
          <span className="font-sans text-sm font-medium">
            {isUploading ? 'Uploading...' : 'Click to upload'}
          </span>
        </button>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
