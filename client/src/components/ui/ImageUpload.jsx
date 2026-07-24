import React, { useRef, useState } from 'react';

const ImageUpload = ({ onUpload, multiple = false, label = "Upload Image" }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave" || e.type === "drop") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
      // reset input value so same files can be chosen again if needed
      e.target.value = null; 
    }
  };

  return (
    <div 
      className={`image-upload card flex flex-col items-center justify-center transition-colors cursor-pointer`}
      style={{
        padding: '30px', 
        border: '2px dashed ' + (dragActive ? 'var(--primary-color)' : 'var(--md-sys-color-outline-variant)'),
        backgroundColor: dragActive ? 'var(--md-sys-color-surface-variant)' : 'var(--surface-color)',
        minHeight: '120px'
      }}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept="image/*"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      <div className="text-center flex flex-col items-center gap-xs">
        <span style={{ fontSize: '28px', color: 'var(--text-muted)' }}>📁</span>
        <p className="font-medium text-sm mt-2">{label}</p>
        <p className="text-xs text-muted-color">Drag & drop or click to select</p>
      </div>
    </div>
  );
};

export default ImageUpload;
