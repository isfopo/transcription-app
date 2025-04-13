import Peaks, { PeaksInstance, PeaksOptions } from "peaks.js";
import { useRef, useState, useCallback } from "react";
import {
  isSubdivision,
  Subdivision,
  SubdivisionPoint,
  SubdivisionPoints,
} from "../helpers/subdivisions";

export interface UsePeaksOptions {
  /** The amount of time that the previous point will go back to the one before. */
  previousPointGap?: number;
  subdivision?: Subdivision;
}

export const usePeaks = ({
  previousPointGap = 0.1,
  subdivision = 1,
}: UsePeaksOptions) => {
  const viewRef = useRef<HTMLDivElement>(null);
  const audioElementRef = useRef<HTMLAudioElement>(null);
  const audioContext = useRef<AudioContext>(new AudioContext());
  const peaksRef = useRef<PeaksInstance>(undefined);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const initialize = useCallback((audioUrl: string) => {
    const options: PeaksOptions = {
      zoomview: {
        container: viewRef.current,
        waveformColor: "#ddd",
        playheadColor: "#fff",
        autoScroll: true,
        enableSegments: false,
        autoScrollOffset: 1,
      },
      mediaElement: audioElementRef.current as Element,
      webAudio: { audioContext: audioContext.current, multiChannel: true },
      keyboard: false,
      logger: console.error.bind(console),
      points: [],
    };

    if (!audioElementRef.current) return;

    audioElementRef.current.src = audioUrl;

    if (peaksRef.current) {
      peaksRef.current.destroy();
      peaksRef.current = undefined;
    }

    Peaks.init(options, (error, peaks) => {
      if (error) {
        console.error("Error initializing Peaks:", error);
        return;
      }

      peaksRef.current = peaks;

      // Add any additional setup or event listeners here
      peaksRef.current?.on("points.add", (event) => console.log(event));
    });
  }, []);

  const playPause = () => {
    if (peaksRef.current) {
      const player = peaksRef.current.player;
      if (isPlaying) {
        player.pause();
        setIsPlaying(false);
      } else {
        player.play();
        setIsPlaying(true);
      }
    }
  };

  const addPoint = ({
    subdivision,
  }: {
    subdivision: keyof typeof SubdivisionPoints;
  }) => {
    if (peaksRef.current) {
      const time = peaksRef.current.player.getCurrentTime();

      peaksRef.current.points.add({
        time: time,
        editable: true,
        id: `${subdivision}-${time}`,
        subdivision: subdivision,
        ...SubdivisionPoints[subdivision],
      });
    }
  };

  const nextPoint = () => {
    if (peaksRef.current) {
      const points = peaksRef.current.points.getPoints() as SubdivisionPoint[];
      const currentTime = peaksRef.current.player.getCurrentTime();
      console.log(points);

      const nextPoint = points.find(
        (point) =>
          isSubdivision(point.subdivision, subdivision) &&
          point.time > currentTime
      );

      if (nextPoint) {
        peaksRef.current.player.seek(nextPoint.time);
      } else {
        // If no next point is found, seek to the end of the audio
        peaksRef.current.player.seek(peaksRef.current.player.getDuration());
      }
    }
  };

  const previousPoint = () => {
    if (peaksRef.current) {
      const points = peaksRef.current.points.getPoints() as SubdivisionPoint[];
      const currentTime = peaksRef.current.player.getCurrentTime();
      const previousPoint = points
        .slice()
        .reverse()
        .find(
          (point) =>
            isSubdivision(point.subdivision, subdivision) &&
            point.time < currentTime - previousPointGap
        );

      if (previousPoint) {
        peaksRef.current.player.seek(previousPoint.time);
      } else {
        // If no previous point is found, seek to the beginning of the audio
        peaksRef.current.player.seek(0);
      }
    }
  };

  return {
    peaksRef,
    viewRef,
    audioElementRef,
    initialize,
    playPause,
    addPoint,
    nextPoint,
    previousPoint,
    isPlaying,
  };
};
