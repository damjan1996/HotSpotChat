'use client';

import React, { useState, useRef } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { Heart, X, MapPin, Clock } from 'lucide-react';
import type { User } from '@/types';

interface SwipeCardProps {
  user: User;
  onSwipe: (direction: 'left' | 'right', user: User) => void;
  onCardClick?: (user: User) => void;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  user,
  onSwipe,
  onCardClick
}) => {
  const [exitX, setExitX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const controls = useAnimation();
  const cardRef = useRef<HTMLDivElement>(null);

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
      
      // Animate out instantly
      controls.start({
        x: direction === 'right' ? 1000 : -1000,
        rotate: direction === 'right' ? 15 : -15,
        opacity: 0,
        transition: { type: 'spring', stiffness: 800, damping: 40, duration: 0.15 }
      }).then(() => {
        onSwipe(direction, user);
      });
    } else {
      // Snap back to center
      setDragX(0);
      controls.start({
        x: 0,
        rotate: 0,
        transition: { type: 'spring', stiffness: 400, damping: 40 }
      });
    }
  };

  const handleLike = () => {
    setExitX(1000);
    controls.start({
      x: 1000,
      rotate: 15,
      opacity: 0,
      transition: { type: 'spring', stiffness: 800, damping: 40, duration: 0.15 }
    }).then(() => {
      onSwipe('right', user);
    });
  };

  const handlePass = () => {
    setExitX(-1000);
    controls.start({
      x: -1000,
      rotate: -15,
      opacity: 0,
      transition: { type: 'spring', stiffness: 800, damping: 40, duration: 0.15 }
    }).then(() => {
      onSwipe('left', user);
    });
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
        scale: 1.05,
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
        className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-2xl"
        style={{ 
          backgroundImage: `url(${primaryPhoto})`,
          filter: 'brightness(0.9)'
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent rounded-2xl" />

      {/* Like Indicator */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-2xl"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: isDragging && dragX > 0 ? dragOpacity(dragX) : 0,
          scale: isDragging && dragX > 0 ? 1 : 0.5
        }}
      >
        <Heart className="w-10 h-10 text-white fill-current" />
      </motion.div>

      {/* Pass Indicator */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-2xl"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: isDragging && dragX < 0 ? dragOpacity(dragX) : 0,
          scale: isDragging && dragX < 0 ? 1 : 0.5
        }}
      >
        <X className="w-10 h-10 text-white" />
      </motion.div>

      {/* Online Status Indicator */}
      {user.is_online && (
        <div className="online-indicator" />
      )}

      {/* Card Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-1">
            {user.name}, {user.age}
          </h2>
          
          {user.bio && (
            <p className="text-sm text-white/80 mb-2 line-clamp-2">
              {user.bio}
            </p>
          )}
          
          <div className="flex items-center text-sm text-white/70 mb-4">
            <MapPin className="w-4 h-4 mr-1" />
            <span>U lokalu</span>
          </div>
          
          {/* Action Buttons on Card */}
          <div className="flex items-center justify-center space-x-6 mt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePass();
              }}
              className="w-14 h-14 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200"
            >
              <X className="w-7 h-7 text-white" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
              className="w-16 h-16 bg-pink-500/80 backdrop-blur-sm border-2 border-white/30 rounded-full flex items-center justify-center hover:bg-pink-500 transition-all duration-200"
            >
              <Heart className="w-8 h-8 text-white fill-current" />
            </button>
          </div>
        </div>
      </div>

      {/* Photo Indicators */}
      {user.photos && user.photos.length > 1 && (
        <div className="absolute top-4 left-4 right-4 flex space-x-1">
          {user.photos.map((_, index) => (
            <div
              key={index}
              className={`flex-1 h-1 rounded-full ${
                index === 0 ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      )}
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