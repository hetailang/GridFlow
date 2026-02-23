import FinetuneElementItem from './FinetuneElementItem'
import './FinetuneCanvas.css'

function FinetuneCanvas({ elements, config, selectedId, onSelect, onElementChange, onDeselect, canvasDisplaySize }) {
  const [w, h] = config.aspectRatio.split(':').map(Number)
  const aspectRatio = w / h

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onDeselect()
    }
  }

  return (
    <div className="finetune-canvas-outer">
      <div
        className="finetune-canvas"
        style={{
          aspectRatio: `${aspectRatio}`,
          backgroundColor: config.backgroundColor,
        }}
        onClick={handleBackgroundClick}
      >
        {elements.map((el, index) => (
          <FinetuneElementItem
            key={el.id}
            element={el}
            isSelected={selectedId === el.id}
            onSelect={() => onSelect(el.id)}
            onChange={(updates) => onElementChange(el.id, updates)}
            zIndex={index + 1}
          />
        ))}
      </div>
    </div>
  )
}

export default FinetuneCanvas
