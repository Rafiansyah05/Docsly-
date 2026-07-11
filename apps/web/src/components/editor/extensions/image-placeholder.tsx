import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Crop as CropIcon, X, Check } from 'lucide-react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ImagePlaceholderComponent = (props: any) => {
  const { node, editor, getPos } = props;
  const { caption } = node.attrs;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCrop(undefined); // Reset crop
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setImgSrc(result);
          setShowModal(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getCroppedImg = async (image: HTMLImageElement, crop: any): Promise<string> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    // We only crop if the crop box actually has width/height, otherwise return original
    if (!crop || !crop.width || !crop.height) {
      return imgSrc;
    }

    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY
      );
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return resolve(imgSrc);
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => resolve(reader.result as string);
      }, 'image/jpeg', 0.9);
    });
  };

  const handleConfirmCrop = async () => {
    let finalSrc = imgSrc;
    
    if (completedCrop && imgRef.current) {
      finalSrc = await getCroppedImg(imgRef.current, completedCrop);
    }

    const pos = getPos();
    
    // Hitung urutan gambar otomatis (Bab.Gambar)
    let chapterIndex = 0;
    let figureIndex = 0;
    
    editor.state.doc.nodesBetween(0, pos, (n: any) => {
      if (n.type.name === 'heading' && n.attrs.level === 1) {
        chapterIndex++;
        figureIndex = 0;
      } else if (n.type.name === 'image' || n.type.name === 'imagePlaceholder') {
        figureIndex++;
      }
    });

    if (chapterIndex === 0) chapterIndex = 1;
    
    let cleanCaption = caption || 'Penjelasan gambar';
    cleanCaption = cleanCaption.replace(/^Gambar\s*\d*(?:\.\d+)*\s*[:\-]?\s*/i, '');
    
    editor.chain().focus()
      .setNodeSelection(pos)
      .deleteSelection()
      .insertContentAt(pos, `
        <img src="${finalSrc}" style="display: block; width: fit-content; height: fit-content; margin: 0 auto; padding: 0;" />
        <p style="text-align: center; margin-top: 4px; margin-bottom: 1em; padding: 0; font-size: 0.9em; color: #475569; line-height: 1.4;">
          <strong>Gambar ${chapterIndex}.${figureIndex + 1}:</strong> ${cleanCaption}
        </p>
        <p></p>
      `)
      .run();
      
    setShowModal(false);
  };

  return (
    <>
      <NodeViewWrapper 
        className="image-placeholder group my-6 border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors rounded-lg flex flex-col items-center justify-center p-8 cursor-pointer text-slate-500"
        onClick={() => fileInputRef.current?.click()}
      >
        <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handleFileChange} />
        <ImageIcon className="h-10 w-10 mb-3 opacity-50" />
        <div className="font-medium text-sm mb-1">Area Gambar</div>
        <div className="text-xs text-slate-400 max-w-sm text-center">
          {caption || "Klik untuk mengunggah gambar"}
        </div>
        <div className="mt-4 text-xs font-semibold bg-white px-3 py-1 rounded border border-slate-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <CropIcon className="h-3 w-3" /> Ganti & Potong Gambar
        </div>
      </NodeViewWrapper>

      {showModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-3xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <CropIcon className="h-4 w-4 text-[#006EFF]" /> 
                Potong Gambar (Crop)
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-900 transition-colors p-1">
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
                    const { width, height } = e.currentTarget;
                    setCrop({
                      unit: '%',
                      x: 10,
                      y: 10,
                      width: 80,
                      height: 80
                    });
                  }}
                />
              </ReactCrop>
            </div>
            
            <div className="p-4 border-t bg-white flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleConfirmCrop}
                className="px-4 py-2 text-sm font-medium text-white bg-[#006EFF] hover:bg-[#005AD4] rounded-md transition-colors flex items-center gap-2 shadow-sm"
              >
                <Check className="h-4 w-4" />
                Potong & Sisipkan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const ImagePlaceholder = Node.create({
  name: 'imagePlaceholder',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      caption: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-image-placeholder]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-image-placeholder': '' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImagePlaceholderComponent) as any;
  },
});
