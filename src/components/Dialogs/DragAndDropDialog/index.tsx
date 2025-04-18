import { FileDropArea } from "../../FileDropArea";

export interface DragAndDropDialogProps {
  /**
   * Ref to the dialog element.
   * This is used to control the dialog element (open, close, etc.).
   */
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  /**
   * Array of allowed file types for the drop area.
   * If not provided, all file types are allowed.
   */
  allowedFileTypes?: string[];
  /**
   * Maximum number of files that can be dropped.
   * If not provided, there is no limit on the number of files.
   */
  maxCount?: number;
  /**
   * Callback function to be called when files are dropped.
   * @param files - Array of File objects representing the dropped files.
   */
  onDrop?: (files: File[]) => void;
  /**
   * Callback function to be called when a drag event occurs.
   * @param event - The drag event.
   */
  onDragOver?: (event: DragEvent) => void;
  /**
   * Callback function to be called when a drag event leaves the drop area.
   * @param event - The drag event.
   */
  onDragLeave?: (event: DragEvent) => void;
  /**
   * Callback function to be called when a drag event enters the drop area.
   * @param event - The drag event.
   */
  onDragEnter?: (event: DragEvent) => void;
  /**
   * Callback function to be called when there are errors during the drop.
   * @param errors - Array of Error objects representing the errors.
   */
  onDropError?: (errors: Error[]) => void;
}

/**
 * DragAndDropDialog component that renders a dialog with a file drop area.
 * It allows users to drag and drop files into the dialog.
 * It also provides callbacks for drag and drop events.
 */
export const DragAndDropDialog = ({
  dialogRef,
  onDrop,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDropError,
  allowedFileTypes,
  maxCount,
}: DragAndDropDialogProps) => {
  return (
    <dialog
      ref={dialogRef}
      className="file-drop-dialog"
      onClick={() => dialogRef.current?.close()}
    >
      <FileDropArea
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDragEnter={onDragEnter}
        allowedFileTypes={allowedFileTypes}
        maxCount={maxCount}
        onDropError={onDropError}
      >
        <h2>Drop a song here</h2>
      </FileDropArea>
    </dialog>
  );
};
