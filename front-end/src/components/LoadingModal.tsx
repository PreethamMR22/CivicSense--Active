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
    sm: 'w-20 h-20',      // 5rem x 5rem (80px x 80px)
    md: 'w-28 h-28',      // 7rem x 7rem (112px x 112px)
    lg: 'w-36 h-36'       // 9rem x 9rem (144px x 144px)
  };

  const defaultMessages = {
    submit: 'Submitting your post...',
    categorize: 'Analyzing your post...'
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-xs">
        <div className="p-6 flex flex-col items-center">
          <div className={`${sizeClasses[size]} flex items-center justify-center`}>
            <DotLottieReact
              src={ANIMATIONS[animationType]}
              loop
              autoplay
              className="w-full h-full"
            />
          </div>
          <p className="text-gray-700 font-medium text-center mt-2 text-sm">
            {message || defaultMessages[animationType]}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingModal;
