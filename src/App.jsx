import { useState, useCallback, useRef } from 'react'
import GridLayout from './components/GridLayout'
import FinetuneCanvas from './components/FinetuneCanvas'
import ControlPanel from './components/ControlPanel'
import { calculateLayout } from './utils/exportCanvas'
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

  const handleLayoutChange = useCallback((newLayout) => {
    setLayout(newLayout)
  }, [])

  const handleCanvasRef = useCallback((el) => {
    gridCanvasRef.current = el
  }, [])

  const handleEnterFinetune = useCallback(() => {
    const canvasEl = gridCanvasRef.current
    if (!canvasEl) return

    const rect = canvasEl.getBoundingClientRect()
    const displayWidth = rect.width
    const displayHeight = rect.height

    const cells = calculateLayout(config.gridCount, displayWidth, displayHeight, config.padding, layout)

    const newElements = cells.map((cell, i) => ({
      id: `cell-${i}`,
      x: cell.x,
      y: cell.y,
      width: cell.width,
      height: cell.height,
      rotation: 0,
      src: images[`cell-${i}`]?.src || null,
      cornerRadius: config.cornerRadius,
    }))

    setElements(newElements)
    setCanvasDisplaySize({ width: displayWidth, height: displayHeight })
    setSelectedId(null)
    setPhase('finetune')
  }, [config, images, layout])

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
