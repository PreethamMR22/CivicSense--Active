import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

type AnimationType = 'submit' | 'categorize';

interface LoadingModalProps {
  isOpen: boolean;
  message?: string;
  animationType?: AnimationType;
  size?: 'sm' | 'md' | 'lg';
}

const ANIMATIONS = {
  submit: 'https://lottie.host/90b39b01-27f5-474f-a818-5ad312a88eee/uTzznEE9Is.lottie',
  categorize: 'https://lottie.host/08b6f1be-bcd1-4383-bfff-ab3184b3289e/NSzGU7wg24.lottie'
};

export const LoadingModal: React.FC<LoadingModalProps> = ({ 
  isOpen, 
  message,
  animationType = 'submit',
  size = 'lg'
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-48 h-48'
  };

  const defaultMessages = {
    submit: 'Submitting your post...',
    categorize: 'Analyzing your post...'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 flex flex-col items-center">
        <div className={`${sizeClasses[size]} -mt-8 -mb-4`}>
          <DotLottieReact
            src={ANIMATIONS[animationType]}
            loop
            autoplay
          />
        </div>
        <p className="text-gray-700 font-medium text-center">
          {message || defaultMessages[animationType]}
        </p>
      </div>
    </div>
  );
};

export default LoadingModal;
