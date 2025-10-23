'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { Heart, X, MapPin, Clock } from 'lucide-react';
import type { User } from '@/types';

interface SwipeCardProps {
  user: User;
  onSwipe: (direction: 'left' | 'right', user: User) => void;
  onCardClick?: (user: User) => void;
  onLike?: () => void;
  onPass?: () => void;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  user,
  onSwipe,
  onCardClick,
  onLike,
  onPass
}) => {
  const [exitX, setExitX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [pendingAnimation, setPendingAnimation] = useState<{type: 'exit' | 'reset', params: any} | null>(null);
  const controls = useAnimation();
  const cardRef = useRef<HTMLDivElement>(null);

  // Helper function to safely execute animations
  const safeAnimationStart = (params: any, onComplete?: () => void) => {
    if (!isMounted || !controls) {
      setPendingAnimation({ 
        type: onComplete ? 'exit' : 'reset', 
        params: onComplete ? { ...params, onComplete } : params 
      });
      return;
    }

    try {
      const animationPromise = controls.start(params);
      if (onComplete && animationPromise) {
        animationPromise.then(onComplete).catch(console.error);
      }
      return animationPromise;
    } catch (error) {
      console.error('Animation error:', error);
      if (onComplete) onComplete();
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Execute pending animations after mount
  useEffect(() => {
    if (isMounted && pendingAnimation && controls) {
      // Small delay to ensure controls are fully initialized
      const timeoutId = setTimeout(() => {
        if (pendingAnimation.type === 'exit') {
          controls.start(pendingAnimation.params).then(() => {
            if (pendingAnimation.params.onComplete) {
              pendingAnimation.params.onComplete();
            }
          }).catch(console.error);
        } else if (pendingAnimation.type === 'reset') {
          controls.start(pendingAnimation.params).catch(console.error);
        }
        setPendingAnimation(null);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [isMounted, pendingAnimation, controls]);

  const handleDragStart = () => {
    console.log('Drag started for:', user.name);
    setIsDragging(true);
  };

  const handleDrag = (event: any, info: PanInfo) => {
    console.log('Dragging:', info.offset.x);
    setDragX(info.offset.x);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    
    const threshold = 75;
    const velocity = info.velocity.x;
    const offset = info.offset.x;
    
    if (Math.abs(velocity) >= 400 || Math.abs(offset) >= threshold) {
      const direction = offset > 0 ? 'right' : 'left';
      setExitX(direction === 'right' ? 1000 : -1000);
      
      const animationParams = {
        x: direction === 'right' ? 400 : -400,
        rotate: direction === 'right' ? 10 : -10,
        opacity: 0,
        transition: { type: 'spring', stiffness: 500, damping: 30, duration: 0.25 }
      };

      safeAnimationStart(animationParams, () => onSwipe(direction, user));
    } else {
      // Snap back to center
      setDragX(0);
      const resetParams = {
        x: 0,
        rotate: 0,
        transition: { type: 'spring', stiffness: 400, damping: 40 }
      };

      safeAnimationStart(resetParams);
    }
  };

  const handleLike = () => {
    console.log('SwipeCard handleLike called');
    if (onLike) {
      onLike();
    } else {
      // Fallback to old behavior
      setExitX(400);
      const animationParams = {
        x: 400,
        rotate: 10,
        opacity: 0,
        transition: { type: 'spring', stiffness: 500, damping: 30, duration: 0.25 }
      };

      safeAnimationStart(animationParams, () => {
        console.log('SwipeCard animation complete, calling onSwipe');
        onSwipe('right', user);
      });
    }
  };

  const handlePass = () => {
    console.log('SwipeCard handlePass called');
    if (onPass) {
      onPass();
    } else {
      // Fallback to old behavior
      setExitX(-400);
      const animationParams = {
        x: -400,
        rotate: -10,
        opacity: 0,
        transition: { type: 'spring', stiffness: 500, damping: 30, duration: 0.25 }
      };

      safeAnimationStart(animationParams, () => {
        console.log('SwipeCard animation complete, calling onSwipe');
        onSwipe('left', user);
      });
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (!isDragging && onCardClick) {
      onCardClick(user);
    }
  };

  const dragOpacity = (offset: number) => {
    return Math.max(0, Math.min(1, Math.abs(offset) / 150));
  };

  const primaryPhoto = user.photos?.[0] || '/placeholder-avatar.jpg';

  return (
    <motion.div
      ref={cardRef}
      className="swipe-card select-none"
      drag="x"
      dragConstraints={{ left: -300, right: 300 }}
      dragElastic={0.2}
      dragMomentum={false}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      animate={controls}
      whileDrag={{
        cursor: 'grabbing',
        rotate: dragX * 0.1,
        transition: { duration: 0 }
      }}
      style={{
        rotate: isDragging ? dragX * 0.1 : 0,
      }}
      onClick={handleCardClick}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${primaryPhoto})`,
          filter: 'brightness(0.9)'
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />


      {/* Online Status Indicator */}
      {user.is_online && (
        <div className="online-indicator" />
      )}

      {/* Profile Progress Bar */}
      <div className="absolute top-4 left-4 right-4 h-1 bg-gray-400/30 rounded-full">
        <div className="h-full bg-white rounded-full" style={{ width: '60%' }} />
      </div>

      {/* Profile Info Top */}
      <div className="absolute top-8 left-4 right-4 text-white">
        <h2 className="text-3xl font-bold">
          {user.name} {user.age}
        </h2>
        <p className="text-sm text-white/80 mt-1">
          Last seen 2 day ago
        </p>
      </div>

      {/* Interest Tags */}
      <div className="absolute bottom-56 left-4 right-4">
        {user.interests && user.interests.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {user.interests.slice(0, 3).map((interest, index) => (
              <span key={index} className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                {interest}
              </span>
            ))}
          </div>
        )}
        
        {user.bio && (
          <p className="text-white text-lg font-medium">
            &ldquo;{user.bio}&rdquo;
          </p>
        )}
      </div>

      {/* Info Button */}
      <div className="absolute bottom-24 right-4">
        <button className="w-12 h-12 bg-gray-600/50 backdrop-blur-sm rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </div>

    </motion.div>
  );
};

// Action Buttons Component for manual like/pass
export const SwipeActions: React.FC<{
  onLike: () => void;
  onPass: () => void;
  disabled?: boolean;
}> = ({ onLike, onPass, disabled = false }) => {
  return (
    <div className="flex justify-center items-center space-x-8 py-6">
      {/* Pass Button */}
      <motion.button
        className="w-16 h-16 bg-white shadow-lg rounded-full flex items-center justify-center text-red-500 border-2 border-red-100"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onPass}
        disabled={disabled}
      >
        <X className="w-8 h-8" />
      </motion.button>

      {/* Like Button */}
      <motion.button
        className="w-20 h-20 bg-primary-500 shadow-xl rounded-full flex items-center justify-center text-white"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onLike}
        disabled={disabled}
      >
        <Heart className="w-10 h-10 fill-current" />
      </motion.button>
    </div>
  );
};