import { useState, useCallback, useRef } from 'react'
import GridLayout from './components/GridLayout'
import FinetuneCanvas from './components/FinetuneCanvas'
import ControlPanel from './components/ControlPanel'
import './App.css'

function App() {
  const [config, setConfig] = useState({
    gridCount: 3,
    aspectRatio: '16:9',
    padding: 10,
    cornerRadius: 15,
    backgroundColor: '#ffffff'
  })

  const [images, setImages] = useState({})
  const [layout, setLayout] = useState(null)
  const [phase, setPhase] = useState('layout') // 'layout' | 'finetune'
  const [elements, setElements] = useState([])
  const [canvasDisplaySize, setCanvasDisplaySize] = useState({ width: 0, height: 0 })
  const [selectedId, setSelectedId] = useState(null)

  const gridCanvasRef = useRef(null)

  const handleConfigChange = useCallback((key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleImageUpdate = useCallback((cellId, imageData) => {
    setImages(prev => ({ ...prev, [cellId]: imageData }))
  }, [])

  const handleImageSwap = useCallback((sourceId, targetId) => {
    setImages(prev => {
      const next = { ...prev }
      const temp = next[sourceId]
      next[sourceId] = next[targetId]
      next[targetId] = temp
      return next
    })
  }, [])

  const handleLayoutChange = useCallback((newLayout) => {
    setLayout(newLayout)
  }, [])

  const handleCanvasRef = useCallback((el) => {
    gridCanvasRef.current = el
  }, [])

  const handleEnterFinetune = useCallback(() => {
    const canvasEl = gridCanvasRef.current
    if (!canvasEl) return

    const canvasRect = canvasEl.getBoundingClientRect()
    const displayWidth = canvasRect.width
    const displayHeight = canvasRect.height

    // 直接从 DOM 读取每个格子的实际渲染位置和尺寸
    // 避免 calculateLayout 与 CSS Grid 百分比列宽计算的精度差异
    const cellEls = canvasEl.querySelectorAll('.image-cell')
    const newElements = Array.from(cellEls).map((cellEl, i) => {
      const cellRect = cellEl.getBoundingClientRect()
      const imgData = images[`cell-${i}`]
      return {
        id: `cell-${i}`,
        x: cellRect.left - canvasRect.left,
        y: cellRect.top - canvasRect.top,
        width: cellRect.width,
        height: cellRect.height,
        rotation: 0,
        src: imgData?.src || null,
        naturalWidth: imgData?.width || null,
        naturalHeight: imgData?.height || null,
        cornerRadius: config.cornerRadius,
        cropOffsetX: 0,
        cropOffsetY: 0,
        cropZoom: 1,
      }
    })

    setElements(newElements)
    setCanvasDisplaySize({ width: displayWidth, height: displayHeight })
    setSelectedId(null)
    setPhase('finetune')
  }, [config, images])

  const handleReturnToLayout = useCallback(() => {
    setPhase('layout')
    setSelectedId(null)
  }, [])

  const handleElementChange = useCallback((id, updates) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el))
  }, [])

  const handleLayerChange = useCallback((id, action) => {
    setElements(prev => {
      const idx = prev.findIndex(el => el.id === id)
      if (idx === -1) return prev
      const next = [...prev]
      const [item] = next.splice(idx, 1)
      if (action === 'up') next.splice(Math.min(idx + 1, next.length), 0, item)
      else if (action === 'down') next.splice(Math.max(idx - 1, 0), 0, item)
      else if (action === 'top') next.push(item)
      else if (action === 'bottom') next.unshift(item)
      return next
    })
  }, [])

  const selectedElement = elements.find(el => el.id === selectedId) || null

  return (
    <div className="app">
      <header className="app-header">
        <h1>GridFlow</h1>
        <p>动态拼图生成器</p>
      </header>

      <div className="app-content">
        <div className="main-area">
          {phase === 'layout' ? (
            <GridLayout
              config={config}
              images={images}
              onImageUpdate={handleImageUpdate}
              onImageSwap={handleImageSwap}
              onLayoutChange={handleLayoutChange}
              onCanvasRef={handleCanvasRef}
            />
          ) : (
            <FinetuneCanvas
              elements={elements}
              config={config}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onElementChange={handleElementChange}
              onDeselect={() => setSelectedId(null)}
              canvasDisplaySize={canvasDisplaySize}
            />
          )}
        </div>

        <div className="sidebar">
          <ControlPanel
            config={config}
            onConfigChange={handleConfigChange}
            images={images}
            layout={layout}
            phase={phase}
            onEnterFinetune={handleEnterFinetune}
            onReturnToLayout={handleReturnToLayout}
            selectedElement={selectedElement}
            onElementChange={handleElementChange}
            onLayerChange={handleLayerChange}
            elements={elements}
            canvasDisplaySize={canvasDisplaySize}
          />
        </div>
      </div>
    </div>
  )
}

export default App
