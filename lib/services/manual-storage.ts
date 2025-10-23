import { supabase } from '@/lib/auth/supabase-auth';

export class ManualStorageService {
  private readonly BUCKET_NAME = 'user-photos';

  /**
   * Upload a file directly (assumes bucket exists)
   */
  async uploadFile(
    file: File, 
    userId: string, 
    fileName?: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // First check if bucket is accessible
      const bucketTest = await this.testBucket();
      if (!bucketTest.success && bucketTest.bucketExists === false) {
        return bucketTest;
      }

      // Generate unique filename if not provided
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const finalFileName = fileName || `${userId}_${timestamp}.${fileExt}`;
      const filePath = `${userId}/${finalFileName}`;

      console.log('Attempting upload to:', filePath);

      // Upload file to storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Upload error:', error);
        
        // If bucket doesn't exist, provide helpful message
        if (error.message.includes('Bucket not found') || error.message.includes('bucket does not exist')) {
          return {
            success: false,
            error: `Bucket '${this.BUCKET_NAME}' not found. The bucket should exist now. Try refreshing the page or check Supabase Dashboard.`
          };
        }
        
        throw error;
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      return {
        success: true,
        url: publicUrl
      };
    } catch (error: any) {
      console.error('Manual upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update user profile photos in database
   */
  async updateUserPhotos(
    userId: string, 
    photoUrls: string[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          photos: photoUrls,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Extract file path from URL for deletion
   */
  extractFilePathFromUrl(url: string, userId: string): string {
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    return `${userId}/${fileName}`;
  }

  /**
   * Test if bucket exists and is accessible
   */
  async testBucket(): Promise<{ success: boolean; error?: string; bucketExists?: boolean }> {
    try {
      // Try to list files in the bucket
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list('', { limit: 1 });

      if (error) {
        if (error.message.includes('Bucket not found')) {
          return {
            success: false,
            bucketExists: false,
            error: 'Bucket does not exist. Please create it manually.'
          };
        }
        throw error;
      }

      return {
        success: true,
        bucketExists: true
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const manualStorageService = new ManualStorageService();