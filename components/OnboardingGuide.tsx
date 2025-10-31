import React, { useState, useLayoutEffect, useEffect } from 'react';

interface OnboardingStep {
  title: string;
  content: string;
  targetSelector: string | null;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

const profileSteps: OnboardingStep[] = [
  {
    title: 'Welcome!',
    content: "Let's get you set up with your AI Health Assistant. This short tour will show you the key features.",
    targetSelector: null,
  },
  {
    title: 'Create Your Profile',
    content: 'First, tell us about yourself. This helps the AI provide personalized recommendations just for you.',
    targetSelector: '#profile-form-card',
    placement: 'bottom',
  },
  {
    title: "Generate Your Dashboard",
    content: "Once you're done, click here to create your personal health dashboard.",
    targetSelector: '#submit-profile-btn',
    placement: 'top',
  },
];

const dashboardSteps: OnboardingStep[] = [
  {
    title: 'Your Dashboard is Ready!',
    content: "Great! Let's take a quick look at the tools available to you. Use these tabs to navigate.",
    targetSelector: '#dashboard-tabs',
    placement: 'bottom',
  },
  {
    title: 'Daily Recommendations',
    content: "Find personalized diet, exercise, and wellness tips based on your profile here.",
    targetSelector: '#tab-recommendations',
    placement: 'bottom',
  },
  {
    title: 'AI Food Analyzer',
    content: 'Snap a picture of your meal, and our AI will analyze its nutritional content and suitability for you.',
    targetSelector: '#tab-food',
    placement: 'bottom',
  },
  {
    title: 'Life Impact Score',
    content: 'Track your long-term health outlook. Log your daily habits to see how they affect your predicted score.',
    targetSelector: '#tab-impact',
    placement: 'bottom',
  },
  {
    title: "You're All Set!",
    content: 'Enjoy your journey to better health. You can restart this tour by resetting your profile.',
    targetSelector: null,
  },
];

interface Position {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface OnboardingGuideProps {
  isDashboardVisible: boolean;
  onFinish: () => void;
}

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ isDashboardVisible, onFinish }) => {
  const [step, setStep] = useState(0);
  const [position, setPosition] = useState<Position | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const steps = isDashboardVisible ? dashboardSteps : profileSteps;
  const currentStep = steps[step];

  useLayoutEffect(() => {
    if (!currentStep) return;

    const calculatePosition = () => {
      if (currentStep.targetSelector) {
        const targetElement = document.querySelector(currentStep.targetSelector);
        if (targetElement) {
          const rect = targetElement.getBoundingClientRect();
          setPosition({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          });
          setIsVisible(true);
        } else {
          setIsVisible(false); // Hide if target not found yet
        }
      } else {
        setPosition(null); // For centered modals
        setIsVisible(true);
      }
    };
    
    // The timeout gives the DOM a moment to update, especially during view transitions.
    const timeoutId = setTimeout(calculatePosition, 100);

    window.addEventListener('resize', calculatePosition);
    return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', calculatePosition);
    };
  }, [step, currentStep]);

  useEffect(() => {
    // Reset to the first step of the appropriate guide when the view changes
    setStep(0);
  }, [isDashboardVisible]);
  
  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onFinish();
    }
  };

  const isLastStep = step === steps.length - 1;

  if (!currentStep || !isVisible) {
    return null;
  }

  const tooltipClasses = ['absolute', 'z-[60]', 'bg-white', 'dark:bg-gray-800', 'p-4', 'rounded-lg', 'shadow-2xl', 'w-80', 'transition-all', 'duration-300'];
  const modalClasses = ['fixed', 'top-1/2', 'left-1/2', '-translate-x-1/2', '-translate-y-1/2'];
  
  let tooltipStyle: React.CSSProperties = {};
  if (position) {
    const placement = currentStep.placement || 'bottom';
    switch (placement) {
        case 'top':
            tooltipStyle = { top: position.top - 8, left: position.left + position.width / 2, transform: 'translate(-50%, -100%)' };
            break;
        case 'bottom':
             tooltipStyle = { top: position.top + position.height + 8, left: position.left + position.width / 2, transform: 'translate(-50%, 0)' };
            break;
        case 'left':
            tooltipStyle = { top: position.top + position.height / 2, left: position.left - 8, transform: 'translate(-100%, -50%)' };
            break;
        case 'right':
            tooltipStyle = { top: position.top + position.height / 2, left: position.left + position.width + 8, transform: 'translate(0, -50%)' };
            break;
    }
  }


  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" onClick={isLastStep ? onFinish : handleNext}></div>
      
      {/* Highlight */}
      {position && (
        <div
          className="absolute border-2 border-white border-dashed rounded-lg transition-all duration-300 pointer-events-none"
          style={{ ...position, boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)' }}
        ></div>
      )}

      {/* Tooltip / Modal */}
      <div className={[...tooltipClasses, ...(position ? [] : modalClasses)].join(' ')} style={position ? tooltipStyle : {}}>
        <h3 className="text-lg font-bold text-indigo-500 mb-2">{currentStep.title}</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{currentStep.content}</p>
        <div className="flex justify-between items-center">
            <button onClick={onFinish} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                Skip Tutorial
            </button>
            <button
                onClick={handleNext}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700"
            >
                {isLastStep ? 'Finish' : 'Next'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingGuide;
