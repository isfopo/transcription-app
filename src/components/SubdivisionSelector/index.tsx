import { Subdivision } from "../../helpers/subdivisions";
import styles from "./index.module.css";

export interface SubdivisionSelectorProps {
  /** The current subdivision. */
  currentSubdivision: Subdivision;
  /** The available subdivisions. */
  subdivisions: Subdivision[];
  /** The function to call when the subdivision is selected. */
  onSelect: (subdivision: Subdivision) => void;
}

/** The icons for each subdivision. Will need to add SVGs - lucide doesn't have all of them. */
const SubdivisionIcons: Record<Subdivision, React.ReactNode> = {
  1: "1",
  2: "1/2",
  4: "1/4",
  8: "1/8",
  16: "1/16",
  32: "1/32",
  64: "1/64",
} as const;

export const SubdivisionSelector = ({
  currentSubdivision,
  subdivisions,
  onSelect,
}: SubdivisionSelectorProps) => {
  return (
    <div>
      {subdivisions.map((subdivision) => (
        <button
          key={subdivision}
          type="button"
          onClick={() => onSelect(subdivision)}
          className={`${
            currentSubdivision === subdivision ? styles["selected"] : ""
          }`}
        >
          {SubdivisionIcons[subdivision]}
        </button>
      ))}
    </div>
  );
};
