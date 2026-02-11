import { useState, useEffect, useRef } from 'react'
import ImageCell from './ImageCell'
import Divider from './Divider'
import './GridLayout.css'

// 根据图片数量生成初始布局
const generateLayout = (count) => {
  if (count === 1) return { type: 'single' }
  if (count === 2) return { type: 'horizontal', ratioX: 50 }
  if (count === 3) return { type: 'left-right-1x2', ratioX: 50, ratioY: 50 }
  if (count === 4) return { type: 'grid-2x2', ratioX: 50, ratioY: 50 }
  if (count === 5) return { type: 'left-right-2x2', ratioX: 50, ratioY: 50 } // 左1右4
  if (count === 6) return { type: 'grid-2x3', ratioX: 50, ratioY1: 33.33, ratioY2: 66.67 }
  if (count === 7) return { type: 'left-right-2x3', ratioX: 50, ratioY1: 33.33, ratioY2: 66.67 } // 左1右6
  if (count === 8) return { type: 'left2-right-2x3', ratioX: 50, ratioYLeft: 66.67, ratioY1: 33.33, ratioY2: 66.67 } // 左2右6
  return { type: 'grid-auto', count }
}

function GridLayout({ config, images, onImageUpdate, onLayoutChange }) {
  const [layout, setLayout] = useState(generateLayout(config.gridCount))
  const [aspectRatio, setAspectRatio] = useState(16 / 9)
  const containerRef = useRef(null)

  useEffect(() => {
    const [w, h] = config.aspectRatio.split(':').map(Number)
    setAspectRatio(w / h)
  }, [config.aspectRatio])

  useEffect(() => {
    const newLayout = generateLayout(config.gridCount)
    setLayout(newLayout)
    if (onLayoutChange) {
      onLayoutChange(newLayout)
    }
  }, [config.gridCount])

  const handleDividerDrag = (key, value) => {
    setLayout(prev => {
      const newLayout = { ...prev, [key]: value }
      if (onLayoutChange) {
        setTimeout(() => onLayoutChange(newLayout), 0)
      }
      return newLayout
    })
  }

  // 统一的包装结构：layout-wrapper(padding+bg) > content-wrapper(relative) > grid + dividers
  const wrap = (gridContent, dividers) => {
    const { padding, backgroundColor } = config
    return (
      <div className="layout-wrapper" style={{ backgroundColor, padding: `${padding}px` }}>
        <div className="content-wrapper">
          {gridContent}
          {dividers}
        </div>
      </div>
    )
  }

  const renderLayout = () => {
    const { padding } = config
    const gap = `${padding}px`

    switch (layout.type) {
      case 'single':
        return wrap(
          <div className="grid-container" style={{ gridTemplateColumns: '1fr' }}>
            <ImageCell cellId="cell-0" image={images['cell-0']} onImageUpdate={onImageUpdate} config={config} />
          </div>,
          null
        )

      case 'horizontal':
        return wrap(
          <div className="grid-container" style={{ gridTemplateColumns: `${layout.ratioX}% ${100 - layout.ratioX}%`, gap }}>
            <ImageCell cellId="cell-0" image={images['cell-0']} onImageUpdate={onImageUpdate} config={config} />
            <ImageCell cellId="cell-1" image={images['cell-1']} onImageUpdate={onImageUpdate} config={config} />
          </div>,
          <Divider direction="horizontal" position={layout.ratioX} onDrag={(v) => handleDividerDrag('ratioX', v)} />
        )

      case 'left-right-1x2':
        return wrap(
          <div className="grid-container" style={{ gridTemplateColumns: `${layout.ratioX}% ${100 - layout.ratioX}%`, gridTemplateRows: '100%', gap }}>
            <ImageCell cellId="cell-0" image={images['cell-0']} onImageUpdate={onImageUpdate} config={config} />
            <div className="sub-grid content-wrapper" style={{ gridTemplateRows: `${layout.ratioY}% ${100 - layout.ratioY}%`, gap, position: 'relative' }}>
              <ImageCell cellId="cell-1" image={images['cell-1']} onImageUpdate={onImageUpdate} config={config} />
              <ImageCell cellId="cell-2" image={images['cell-2']} onImageUpdate={onImageUpdate} config={config} />
              <Divider direction="vertical" position={layout.ratioY} onDrag={(v) => handleDividerDrag('ratioY', v)} />
            </div>
          </div>,
          <Divider direction="horizontal" position={layout.ratioX} onDrag={(v) => handleDividerDrag('ratioX', v)} />
        )

      case 'grid-2x2':
        return wrap(
          <div className="grid-container" style={{ gridTemplateColumns: `${layout.ratioX}% ${100 - layout.ratioX}%`, gridTemplateRows: `${layout.ratioY}% ${100 - layout.ratioY}%`, gap }}>
            {[0, 1, 2, 3].map(i => (
              <ImageCell key={i} cellId={`cell-${i}`} image={images[`cell-${i}`]} onImageUpdate={onImageUpdate} config={config} />
            ))}
          </div>,
          <>
            <Divider direction="horizontal" position={layout.ratioX} onDrag={(v) => handleDividerDrag('ratioX', v)} />
            <Divider direction="vertical" position={layout.ratioY} onDrag={(v) => handleDividerDrag('ratioY', v)} />
          </>
        )

      case 'left-right-2x2':
        return wrap(
          <div className="grid-container" style={{ gridTemplateColumns: `${layout.ratioX}% ${100 - layout.ratioX}%`, gridTemplateRows: '100%', gap }}>
            <ImageCell cellId="cell-0" image={images['cell-0']} onImageUpdate={onImageUpdate} config={config} />
            <div className="sub-grid content-wrapper" style={{ gridTemplateColumns: '1fr 1fr', gridTemplateRows: `${layout.ratioY}% ${100 - layout.ratioY}%`, gap, position: 'relative' }}>
              {[1, 2, 3, 4].map(i => (
                <ImageCell key={i} cellId={`cell-${i}`} image={images[`cell-${i}`]} onImageUpdate={onImageUpdate} config={config} />
              ))}
              <Divider direction="vertical" position={layout.ratioY} onDrag={(v) => handleDividerDrag('ratioY', v)} />
            </div>
          </div>,
          <Divider direction="horizontal" position={layout.ratioX} onDrag={(v) => handleDividerDrag('ratioX', v)} />
        )

      case 'grid-2x3':
        return wrap(
          <div className="grid-container" style={{ gridTemplateColumns: `${layout.ratioX}% ${100 - layout.ratioX}%`, gridTemplateRows: `${layout.ratioY1}% ${layout.ratioY2 - layout.ratioY1}% ${100 - layout.ratioY2}%`, gap }}>
            {[0, 1, 2, 3, 4, 5].map(i => (
              <ImageCell key={i} cellId={`cell-${i}`} image={images[`cell-${i}`]} onImageUpdate={onImageUpdate} config={config} />
            ))}
          </div>,
          <>
            <Divider direction="horizontal" position={layout.ratioX} onDrag={(v) => handleDividerDrag('ratioX', v)} />
            <Divider direction="vertical" position={layout.ratioY1} onDrag={(v) => handleDividerDrag('ratioY1', v)} />
            <Divider direction="vertical" position={layout.ratioY2} onDrag={(v) => handleDividerDrag('ratioY2', v)} />
          </>
        )

      case 'left-right-2x3':
        return wrap(
          <div className="grid-container" style={{ gridTemplateColumns: `${layout.ratioX}% ${100 - layout.ratioX}%`, gridTemplateRows: '100%', gap }}>
            <ImageCell cellId="cell-0" image={images['cell-0']} onImageUpdate={onImageUpdate} config={config} />
            <div className="sub-grid content-wrapper" style={{ gridTemplateColumns: '1fr 1fr', gridTemplateRows: `${layout.ratioY1}% ${layout.ratioY2 - layout.ratioY1}% ${100 - layout.ratioY2}%`, gap, position: 'relative' }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <ImageCell key={i} cellId={`cell-${i}`} image={images[`cell-${i}`]} onImageUpdate={onImageUpdate} config={config} />
              ))}
              <Divider direction="vertical" position={layout.ratioY1} onDrag={(v) => handleDividerDrag('ratioY1', v)} />
              <Divider direction="vertical" position={layout.ratioY2} onDrag={(v) => handleDividerDrag('ratioY2', v)} />
            </div>
          </div>,
          <Divider direction="horizontal" position={layout.ratioX} onDrag={(v) => handleDividerDrag('ratioX', v)} />
        )

      case 'left2-right-2x3':
        return wrap(
          <div className="grid-container" style={{ gridTemplateColumns: `${layout.ratioX}% ${100 - layout.ratioX}%`, gridTemplateRows: '100%', gap }}>
            <div className="sub-grid content-wrapper" style={{ gridTemplateRows: `${layout.ratioYLeft}% ${100 - layout.ratioYLeft}%`, gap, position: 'relative' }}>
              <ImageCell cellId="cell-0" image={images['cell-0']} onImageUpdate={onImageUpdate} config={config} />
              <ImageCell cellId="cell-1" image={images['cell-1']} onImageUpdate={onImageUpdate} config={config} />
              <Divider direction="vertical" position={layout.ratioYLeft} onDrag={(v) => handleDividerDrag('ratioYLeft', v)} />
            </div>
            <div className="sub-grid content-wrapper" style={{ gridTemplateColumns: '1fr 1fr', gridTemplateRows: `${layout.ratioY1}% ${layout.ratioY2 - layout.ratioY1}% ${100 - layout.ratioY2}%`, gap, position: 'relative' }}>
              {[2, 3, 4, 5, 6, 7].map(i => (
                <ImageCell key={i} cellId={`cell-${i}`} image={images[`cell-${i}`]} onImageUpdate={onImageUpdate} config={config} />
              ))}
              <Divider direction="vertical" position={layout.ratioY1} onDrag={(v) => handleDividerDrag('ratioY1', v)} />
              <Divider direction="vertical" position={layout.ratioY2} onDrag={(v) => handleDividerDrag('ratioY2', v)} />
            </div>
          </div>,
          <Divider direction="horizontal" position={layout.ratioX} onDrag={(v) => handleDividerDrag('ratioX', v)} />
        )

      case 'grid-auto':
      default:
        const cols = Math.ceil(Math.sqrt(config.gridCount))
        return (
          <div className="grid-container grid-auto" style={{ backgroundColor: config.backgroundColor, padding: `${padding}px`, gap, gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: config.gridCount }).map((_, i) => (
              <ImageCell key={i} cellId={`cell-${i}`} image={images[`cell-${i}`]} onImageUpdate={onImageUpdate} config={config} />
            ))}
          </div>
        )
    }
  }

  return (
    <div className="grid-layout">
      <div
        ref={containerRef}
        className="canvas-wrapper"
        style={{ aspectRatio: `${aspectRatio}` }}
      >
        {renderLayout()}
      </div>
    </div>
  )
}

export default GridLayout
