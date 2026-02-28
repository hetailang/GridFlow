import { useRef, useEffect, useState } from 'react'
import './ImageCell.css'

function ImageCell({ cellId, image, onImageUpdate, onImageSwap, config }) {
  const [isDragging, setIsDragging] = useState(false)    // 外部文件拖入悬浮
  const [isDragSource, setIsDragSource] = useState(false) // 本格正被拖拽
  const [isDragTarget, setIsDragTarget] = useState(false) // 内部拖拽悬浮在本格
  const [isHovered, setIsHovered] = useState(false)
  const fileInputRef = useRef(null)

  // 判断当前拖拽是否为内部单元格拖拽
  const isInternalDrag = (e) => e.dataTransfer.types.includes('application/gridflow-cell')

  const handleDragStart = (e) => {
    if (!image) { e.preventDefault(); return }
    e.dataTransfer.setData('application/gridflow-cell', cellId)
    e.dataTransfer.effectAllowed = 'move'
    setIsDragSource(true)
  }

  const handleDragEnd = () => {
    setIsDragSource(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isInternalDrag(e)) {
      e.dataTransfer.dropEffect = 'move'
      setIsDragTarget(true)
    } else {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setIsDragTarget(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setIsDragTarget(false)

    const sourceCellId = e.dataTransfer.getData('application/gridflow-cell')
    if (sourceCellId) {
      // 内部拖拽：交换两个格子的图片
      if (sourceCellId !== cellId && onImageSwap) {
        onImageSwap(sourceCellId, cellId)
      }
      return
    }

    // 外部文件拖入
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

  // 支持剪贴板粘贴 - 仅在鼠标悬停的网格中生效
  useEffect(() => {
    const handlePaste = (e) => {
      if (!isHovered) return

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
  }, [cellId, isHovered])

  const cellStyle = {
    borderRadius: `${config.cornerRadius}px`,
    backgroundImage: image ? `url(${image.src})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }

  const classNames = [
    'image-cell',
    isDragging ? 'dragging' : '',
    image ? 'has-image' : '',
    isDragSource ? 'drag-source' : '',
    isDragTarget ? 'drag-target' : '',
  ].filter(Boolean).join(' ')

  return (
    <div
      className={classNames}
      style={cellStyle}
      draggable={!!image}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
