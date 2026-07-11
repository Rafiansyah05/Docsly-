import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Crop as CropIcon, X, Check } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File | null;
  onConfirm: (croppedBlob: Blob | null, dataUrl: string) => void;
}

export function ImageCropModal({ isOpen, onClose, imageFile, onConfirm }: ImageCropModalProps) {
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<any>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (imageFile) {
      setCrop(undefined);
      const reader = new FileReader();
      reader.onload = (e) => setImgSrc(e.target?.result as string);
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  if (!isOpen || !isMounted) return null;

  const handleConfirm = async () => {
    if (!completedCrop || !completedCrop.width || !completedCrop.height || !imgRef.current) {
      // If no crop, return the original
      onConfirm(imageFile, imgSrc);
      return;
    }

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY
      );
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          onConfirm(blob, reader.result as string);
        };
      } else {
        onConfirm(imageFile, imgSrc);
      }
    }, 'image/jpeg', 0.9);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-3xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <CropIcon className="h-4 w-4 text-[#006EFF]" /> 
            Potong Gambar (Crop)
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 transition-colors p-1">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto bg-slate-100 flex items-center justify-center p-6 relative">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            className="max-h-full max-w-full shadow-lg"
          >
            <img
              ref={imgRef}
              alt="Crop preview"
              src={imgSrc}
              className="max-h-[60vh] object-contain block mx-auto"
              onLoad={(e) => {
                setCrop({ unit: '%', x: 10, y: 10, width: 80, height: 80 });
              }}
            />
          </ReactCrop>
        </div>
        
        <div className="p-4 border-t bg-white flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={handleConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-[#006EFF] hover:bg-[#005AD4] rounded-md transition-colors flex items-center gap-2 shadow-sm"
          >
            <Check className="h-4 w-4" />
            Potong & Sisipkan
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
