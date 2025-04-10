import Peaks, { PeaksInstance, PeaksOptions } from "peaks.js";
import { useRef, useEffect, useMemo, useState } from "react";
import { WaveformView } from "../components/WaveformView";
import { Subdivision, SubdivisionPoints } from "../helpers/subdivisions";

export interface UsePeaksOptions {
  audioUrl: string;
  audioContentType: string;
  /** The amount of time that the previous point will go back to the one before. */
  previousPointGap?: number;
  subdivision?: Subdivision;
}

export const usePeaks = ({
  audioUrl,
  audioContentType,
  previousPointGap = 0.1,
  subdivision = "whole",
}: UsePeaksOptions) => {
  const viewRef = useRef<HTMLDivElement>(null);
  const audioElementRef = useRef<HTMLAudioElement>(null);
  const audioContext = useRef<AudioContext>(new AudioContext());
  const peaksRef = useRef<PeaksInstance>(undefined);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
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
    });
  }, [audioUrl]);

  const waveformElement = useMemo<React.ReactElement>(() => {
    return (
      <>
        <WaveformView viewRef={viewRef} />
        <audio ref={audioElementRef}>
          <source src={audioUrl} type={audioContentType} />
          Your browser does not support the audio element.
        </audio>
      </>
    );
  }, [audioContentType, audioUrl]);

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
        id: subdivision + time,
        ...SubdivisionPoints[subdivision],
      });
    }
  };

  const nextPoint = () => {
    if (peaksRef.current) {
      const points = peaksRef.current.points.getPoints();
      const currentTime = peaksRef.current.player.getCurrentTime();

      const nextPoint = points.find(
        (point) => point.id?.includes(subdivision) && point.time > currentTime
      );

      if (nextPoint) {
        peaksRef.current.player.seek(nextPoint.time);
      }
    }
  };

  const previousPoint = () => {
    if (peaksRef.current) {
      const points = peaksRef.current.points.getPoints();
      const currentTime = peaksRef.current.player.getCurrentTime();
      const previousPoint = points
        .slice()
        .reverse()
        .find(
          (point) =>
            point.id?.includes(subdivision) &&
            point.time < currentTime - previousPointGap
        );

      if (previousPoint) {
        peaksRef.current.player.seek(previousPoint.time);
      }
    }
  };

  return {
    peaksRef,
    waveformElement,
    playPause,
    addPoint,
    nextPoint,
    previousPoint,
    isPlaying,
  };
};
