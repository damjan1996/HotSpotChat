'use client';

import React, { useState, useRef } from 'react';
import { Camera, X, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { supabaseStorageService } from '@/lib/services/supabase-storage';
import { manualStorageService } from '@/lib/services/manual-storage';

interface PhotoUploadProps {
  userId: string;
  currentPhotos: string[];
  onPhotosUpdated: (photos: string[]) => void;
  maxPhotos?: number;
}

export function PhotoUpload({ 
  userId, 
  currentPhotos, 
  onPhotosUpdated, 
  maxPhotos = 6 
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Molim te izaberi sliku (JPG, PNG, GIF)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Slika je prevelika. Maksimalna veličina je 5MB.');
      return;
    }

    // Check if we can add more photos
    if (currentPhotos.length >= maxPhotos) {
      alert(`Možeš dodati maksimalno ${maxPhotos} slika`);
      return;
    }

    setUploading(true);
    setUploadingIndex(currentPhotos.length);

    try {
      // Direct upload attempt (skip bucket checking for now)
      const { supabase } = await import('@/lib/auth/supabase-auth');
      
      if (!supabase) {
        throw new Error('Supabase client not available');
      }
      
      // Generate unique filename
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const finalFileName = `${userId}_${timestamp}.${fileExt}`;
      const filePath = `${userId}/${finalFileName}`;

      console.log('Direct upload attempt to:', filePath);

      // Direct upload to storage
      const { data, error } = await supabase.storage
        .from('user-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Direct upload error:', error);
        
        if (error.message.includes('Bucket not found') || error.message.includes('bucket does not exist')) {
          alert(`Storage Bucket Problem!\n\nDas Bucket 'user-photos' wurde nicht gefunden.\nBitte überprüfe in Supabase Dashboard > Storage ob das Bucket existiert.\n\nFalls es existiert, versuche die Seite zu aktualisieren (F5).`);
        } else if (error.message.includes('row-level security policy')) {
          alert(`RLS Policy Problem!\n\nDer Upload wurde von Row Level Security blockiert.\nGehe zu Supabase Dashboard > Storage > user-photos > Policies\nund stelle sicher, dass Upload-Policies korrekt sind.`);
        } else {
          alert('Upload Fehler: ' + error.message);
        }
        return;
      }

      console.log('Direct upload successful:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-photos')
        .getPublicUrl(filePath);

      console.log('Public URL generated:', publicUrl);

      // Update database
      const newPhotos = [...currentPhotos, publicUrl];
      const updateResult = await manualStorageService.updateUserPhotos(userId, newPhotos);
      
      if (updateResult.success) {
        onPhotosUpdated(newPhotos);
        console.log('Photo successfully added to profile!');
      } else {
        alert('Greška pri ažuriranju profila: ' + updateResult.error);
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Greška pri upload-u slike: ' + error);
    } finally {
      setUploading(false);
      setUploadingIndex(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = async (index: number) => {
    const photoUrl = currentPhotos[index];
    
    try {
      // Extract file path and delete from storage
      const filePath = manualStorageService.extractFilePathFromUrl(photoUrl, userId);
      await manualStorageService.deleteFile(filePath);
      
      // Update photos array
      const newPhotos = currentPhotos.filter((_, i) => i !== index);
      
      // Update database
      const updateResult = await manualStorageService.updateUserPhotos(userId, newPhotos);
      
      if (updateResult.success) {
        onPhotosUpdated(newPhotos);
      } else {
        alert('Greška pri uklanjanju slike: ' + updateResult.error);
      }
    } catch (error) {
      console.error('Remove photo error:', error);
      alert('Greška pri uklanjanju slike');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Slike ({currentPhotos.length}/{maxPhotos})
        </h3>
        
        {currentPhotos.length < maxPhotos && (
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            size="sm"
            className="flex items-center"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Dodaj sliku
          </Button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Photo grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {currentPhotos.map((photo, index) => (
          <div key={index} className="relative group">
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={photo}
                alt={`Slika ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Remove button */}
              <button
                onClick={() => handleRemovePhoto(index)}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Upload placeholder - show when uploading */}
        {uploading && uploadingIndex !== null && (
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500">Upload...</p>
            </div>
          </div>
        )}

        {/* Empty slots */}
        {!uploading && currentPhotos.length < maxPhotos && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-100 transition-colors"
          >
            <div className="text-center">
              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Dodaj sliku</p>
            </div>
          </button>
        )}
      </div>

      <p className="text-sm text-gray-500">
        Dodaj do {maxPhotos} slika. Maksimalna veličina fajla je 5MB.
      </p>
    </div>
  );
}