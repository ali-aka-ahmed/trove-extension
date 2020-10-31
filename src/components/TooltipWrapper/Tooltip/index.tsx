import React, { useCallback, useEffect, useState } from "react";

export default function Tooltip() {
  const [isVisible, setIsVisible] = useState(false);

  const onSelectionChange = useCallback(() => {
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
        <div className="TbdTooltip" style={{ transform: 'translate3d(0px, 0px, 0px)' }}></div>
      )}
    </>
  );
}
