import React from 'react'
import Editor from '@monaco-editor/react'

const CodeEditor = ({ defaultValue, onChange }) => {
  const editorOptions = {
    scrollBeyondLastLine: false,
    scrollbar: {
      vertical: 'auto',
      horizontal: 'auto',
    },
    overviewRulerLanes: 0,
    minimap: { enabled: false },
  }

  return (
    <div className="border border-secondary rounded-md overflow-hidden h-full">
      <Editor
        height="90%"
        defaultLanguage="python"
        defaultValue={ defaultValue }
        options={editorOptions}
        onChange={ onChange }
      />
    </div>
  )
}

export default CodeEditor