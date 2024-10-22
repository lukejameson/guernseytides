// components/WaveSpinner.tsx
import { JSX } from "preact";

interface WaveSpinnerProps {
  size?: number;
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
}

export default function WaveSpinner({
  size = 50,
  primaryColor = "#3498db",
  secondaryColor = "#2980b9",
  tertiaryColor = "#1f618d",
}: WaveSpinnerProps): JSX.Element {
  const styles = `
    .wave-spinner {
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      position: relative;
      margin: ${size}px;
    }

    .wave {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: ${Math.max(2, size / 12)}px solid transparent;
      animation: waveFlow 1.5s linear infinite;
    }

    .wave:nth-child(1) {
      border-top-color: ${primaryColor};
    }

    .wave:nth-child(2) {
      border-top-color: ${secondaryColor};
      animation-delay: 0.2s;
    }

    .wave:nth-child(3) {
      border-top-color: ${tertiaryColor};
      animation-delay: 0.4s;
    }

    @keyframes waveFlow {
      0% {
        transform: rotate(0deg) scale(1);
        opacity: 1;
      }
      50% {
        transform: rotate(180deg) scale(1.2);
        opacity: 0.5;
      }
      100% {
        transform: rotate(360deg) scale(1);
        opacity: 1;
      }
    }
  `;

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div class="wave-spinner">
        <div class="wave"></div>
        <div class="wave"></div>
        <div class="wave"></div>
      </div>
    </div>
  );
}
