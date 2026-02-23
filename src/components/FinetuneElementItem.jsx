import { useRef, useEffect } from 'react'
import './FinetuneElementItem.css'

const MIN_SIZE = 20

// handle 配置表
const HANDLES = [
  { id: 'nw', cursor: 'nw-resize' },
  { id: 'n',  cursor: 'n-resize'  },
  { id: 'ne', cursor: 'ne-resize' },
  { id: 'e',  cursor: 'e-resize'  },
  { id: 'se', cursor: 'se-resize' },
  { id: 's',  cursor: 's-resize'  },
  { id: 'sw', cursor: 'sw-resize' },
  { id: 'w',  cursor: 'w-resize'  },
]

function FinetuneElementItem({ element, isSelected, onSelect, onChange, zIndex }) {
  const { id, x, y, width, height, rotation, src, cornerRadius } = element
  const dragState = useRef(null)

  const handleMouseDown = (e, actionType) => {
    e.stopPropagation()
    e.preventDefault()

    if (!isSelected) {
      onSelect()
      // allow click-to-select without starting drag
      if (actionType === 'move') return
    }

    dragState.current = {
      type: actionType,
      startMouse: { x: e.clientX, y: e.clientY },
      startEl: { x, y, width, height, rotation },
    }

    const handleMouseMove = (me) => {
      const ds = dragState.current
      if (!ds) return

      const dx = me.clientX - ds.startMouse.x
      const dy = me.clientY - ds.startMouse.y
      const el = ds.startEl
      const θ = (el.rotation || 0) * Math.PI / 180
      const cosθ = Math.cos(θ)
      const sinθ = Math.sin(θ)

      if (ds.type === 'move') {
        onChange({ x: el.x + dx, y: el.y + dy })
        return
      }

      if (ds.type === 'rotate') {
        const cx = el.x + el.width / 2
        const cy = el.y + el.height / 2
        // Get canvas element bounds via the element itself
        const container = document.querySelector('.finetune-canvas')
        const rect = container ? container.getBoundingClientRect() : { left: 0, top: 0 }
        const mouseCanvasX = me.clientX - rect.left
        const mouseCanvasY = me.clientY - rect.top
        // cx/cy are in display CSS pixels, need to scale to canvas pixels
        // The canvas element width in CSS px
        const canvasEl = container
        const canvasW = canvasEl ? canvasEl.offsetWidth : 1
        // x/y/width/height are in canvas-pixel space (same as CSS px since elements use px)
        const newAngle = Math.atan2(mouseCanvasY - cy, mouseCanvasX - cx) * 180 / Math.PI + 90
        onChange({ rotation: newAngle })
        return
      }

      // resize handles
      const handle = ds.type // e.g. 'nw', 'ne', 'se', 'sw', 'n', 's', 'e', 'w'

      const hw = el.width / 2
      const hh = el.height / 2

      // Local coords of drag point and anchor for each handle
      const handleDefs = {
        nw: { drag: [-hw, -hh], anchor: [ hw,  hh], constrainX: false, constrainY: false },
        n:  { drag: [  0, -hh], anchor: [  0,  hh], constrainX: true,  constrainY: false },
        ne: { drag: [ hw, -hh], anchor: [-hw,  hh], constrainX: false, constrainY: false },
        e:  { drag: [ hw,   0], anchor: [-hw,   0], constrainX: false, constrainY: true  },
        se: { drag: [ hw,  hh], anchor: [-hw, -hh], constrainX: false, constrainY: false },
        s:  { drag: [  0,  hh], anchor: [  0, -hh], constrainX: true,  constrainY: false },
        sw: { drag: [-hw,  hh], anchor: [ hw, -hh], constrainX: false, constrainY: false },
        w:  { drag: [-hw,   0], anchor: [ hw,   0], constrainX: false, constrainY: true  },
      }

      const def = handleDefs[handle]
      if (!def) return

      const startCx = el.x + hw
      const startCy = el.y + hh

      // Anchor in canvas coords
      const [alx, aly] = def.anchor
      const anchorCanvasX = startCx + alx * cosθ - aly * sinθ
      const anchorCanvasY = startCy + alx * sinθ + aly * cosθ

      // Current mouse in canvas coords
      let mouseCanvasX = startCx + (def.drag[0] * cosθ - def.drag[1] * sinθ) + dx
      let mouseCanvasY = startCy + (def.drag[0] * sinθ + def.drag[1] * cosθ) + dy

      // For edge handles, project mouse onto the constrained local axis
      if (def.constrainX) {
        // n/s: only move along local Y axis; X stays at anchor X
        // Project mouse onto the local Y axis passing through anchor
        // Local Y axis direction in canvas: (sinθ, -cosθ) wait...
        // Local Y axis direction: (-sinθ, cosθ) — going from top to bottom in local space
        // Actually in CSS y-down: local X dir = (cosθ, sinθ), local Y dir = (-sinθ, cosθ)
        const mdx = mouseCanvasX - anchorCanvasX
        const mdy = mouseCanvasY - anchorCanvasY
        // Project onto local Y direction (-sinθ, cosθ)
        const proj = mdx * (-sinθ) + mdy * cosθ
        mouseCanvasX = anchorCanvasX + proj * (-sinθ)
        mouseCanvasY = anchorCanvasY + proj * cosθ
      } else if (def.constrainY) {
        // e/w: only move along local X axis
        const mdx = mouseCanvasX - anchorCanvasX
        const mdy = mouseCanvasY - anchorCanvasY
        // Project onto local X direction (cosθ, sinθ)
        const proj = mdx * cosθ + mdy * sinθ
        mouseCanvasX = anchorCanvasX + proj * cosθ
        mouseCanvasY = anchorCanvasY + proj * sinθ
      }

      // New center = midpoint of anchor and mouse
      const newCx = (anchorCanvasX + mouseCanvasX) / 2
      const newCy = (anchorCanvasY + mouseCanvasY) / 2

      // Vector from new center to mouse in canvas coords
      const vecX = mouseCanvasX - newCx
      const vecY = mouseCanvasY - newCy

      // Convert to local coords
      const localX = vecX * cosθ + vecY * sinθ
      const localY = -vecX * sinθ + vecY * cosθ

      const newHW = Math.max(MIN_SIZE / 2, Math.abs(localX))
      const newHH = Math.max(MIN_SIZE / 2, Math.abs(localY))

      // For edge handles, keep the perpendicular dimension unchanged
      const finalHW = def.constrainX ? hw : newHW
      const finalHH = def.constrainY ? hh : newHH

      onChange({
        x: newCx - finalHW,
        y: newCy - finalHH,
        width: finalHW * 2,
        height: finalHH * 2,
      })
    }

    const handleMouseUp = () => {
      dragState.current = null
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleElementClick = (e) => {
    e.stopPropagation()
    onSelect()
  }

  const style = {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
    transform: `rotate(${rotation || 0}deg)`,
    zIndex,
    cursor: isSelected ? 'move' : 'pointer',
  }

  return (
    <div
      className={`finetune-element${isSelected ? ' selected' : ''}`}
      style={style}
      onMouseDown={(e) => handleMouseDown(e, 'move')}
      onClick={handleElementClick}
    >
      {src && (
        <img
          src={src}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: `${cornerRadius || 0}px`,
            pointerEvents: 'none',
            display: 'block',
          }}
          draggable={false}
        />
      )}

      {!src && (
        <div
          className="finetune-element-empty"
          style={{ borderRadius: `${cornerRadius || 0}px` }}
        />
      )}

      {isSelected && (
        <>
          {HANDLES.map((h) => (
            <div
              key={h.id}
              className={`resize-handle handle-${h.id}`}
              style={{ cursor: h.cursor }}
              onMouseDown={(e) => handleMouseDown(e, h.id)}
            />
          ))}
          <div
            className="rotate-handle"
            onMouseDown={(e) => handleMouseDown(e, 'rotate')}
          />
        </>
      )}
    </div>
  )
}

export default FinetuneElementItem
