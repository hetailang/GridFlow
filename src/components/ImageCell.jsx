import { useRef, useEffect, useState } from 'react'
import './ImageCell.css'

function ImageCell({ cellId, image, onImageUpdate, config }) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          onImageUpdate(cellId, {
            src: e.target.result,
            width: img.width,
            height: img.height,
            file: file
          })
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    }
  }

  const handleClick = () => {
    if (!image) {
      fileInputRef.current?.click()
    }
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    onImageUpdate(cellId, null)
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // 支持剪贴板粘贴
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (let item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            handleFileSelect(file)
          }
        }
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [cellId])

  const cellStyle = {
    borderRadius: `${config.cornerRadius}px`,
    backgroundImage: image ? `url(${image.src})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }

  return (
    <div
      className={`image-cell ${isDragging ? 'dragging' : ''} ${image ? 'has-image' : ''}`}
      style={cellStyle}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      {!image && (
        <div className="placeholder">
          <div className="icon">📷</div>
          <p>拖放图片到这里</p>
          <p className="hint">或点击选择文件</p>
          <p className="hint">或使用 Ctrl+V 粘贴</p>
        </div>
      )}
      {image && (
        <button className="delete-button" onClick={handleDelete} title="删除图片">
          ✕
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />
    </div>
  )
}

export default ImageCell
