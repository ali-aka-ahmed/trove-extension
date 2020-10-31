import React, { useCallback, useEffect, useState } from "react";

export default function Tooltip() {
  console.log('hi')
  const [isVisible, setIsVisible] = useState(false);

  const onSelectionChange = useCallback(() => {
    console.log('selectionchange')
    const selection = getSelection();
    if (selection?.toString()) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, [onSelectionChange]);

  return (
    <>
      {isVisible && (
        <div className="TbdTooltip"></div>
      )}
    </>
  );
}
