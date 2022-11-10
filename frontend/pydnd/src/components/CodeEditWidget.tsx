import { useState } from "react";

import Editor from "@monaco-editor/react";

const CodeEditorWindow = ({ onChange, code, theme }) => {
  const [value, setValue] = useState(code || "");

  const handleEditorChange = (value) => {
    setValue(value);
    onChange("code", value);
  };

  return (
    <div style={{ borderRadius: '3px', overflow: 'hidden' }}>
      <Editor
        height="30vh"
        width="100%"
        language="python"
        value={value}
        theme="vs-dark"
        defaultValue="# Write your function below"
        onChange={handleEditorChange}
      />
    </div>
  );
};
export default CodeEditorWindow;