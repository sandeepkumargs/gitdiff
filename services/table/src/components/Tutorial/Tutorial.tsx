// Tutorial.tsx
import React, { useState, useEffect } from 'react';
import Joyride, { BeaconRenderProps } from 'react-joyride';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

// Keyframe animation for the beacon pulse
const pulse = keyframes`
  0% {
    transform: scale(1);
  }

  55% {
    background-color: rgba(30, 58, 138, 0.9);
    transform: scale(1.6);
  }
`;

// Styled component for the custom beacon
const Beacon = styled.span`
  animation: ${pulse} 2s ease-in-out infinite;
      background-color: rgba(30, 58, 138, 0.9);
  border-radius: 50%;
  display: inline-block;
  height: 3rem;
  width: 3rem;
  position: relative;
  text-align: center;
  line-height: 3rem; /* Vertically center the text */
  font-size: 0.9rem;
  font-weight: bold;
  color: white;
`;

// The custom beacon component
const BeaconComponent = React.forwardRef<HTMLButtonElement, BeaconRenderProps>((props, ref) => {
  return (
    <Beacon ref={ref} {...props}>
      Click
    </Beacon>
  );
});

interface TutorialProps {
  steps: any[]; // You can replace 'any' with the correct type for steps
  run: boolean;
  onFinish: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ steps, run, onFinish }) => {
  const [tutorialRun, setTutorialRun] = useState(run);

  useEffect(() => {
    setTutorialRun(run); // Ensure the tutorial starts with the 'run' prop
  }, [run]);

  return (
    <Joyride
      steps={steps}
      run={tutorialRun} // Start tutorial automatically based on the 'run' prop
      continuous
      scrollToFirstStep
      showProgress
      showSkipButton
      beaconComponent={BeaconComponent} // Custom beacon
      styles={{
        options: {
          zIndex: 10000,
        },
      }}
      callback={(data) => {
        const { status } = data;
        if (status === 'finished' || status === 'skipped') {
          setTutorialRun(false); // End the tutorial once finished or skipped
          onFinish(); // Notify parent component that tutorial is finished
        }
      }}
    />
  );
};

export default Tutorial;
