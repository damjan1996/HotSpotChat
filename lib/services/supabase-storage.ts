import { supabase } from '@/lib/auth/supabase-auth';

export class SupabaseStorageService {
  private readonly BUCKET_NAME = 'user-photos';

  /**
   * Ensure the storage bucket exists
   */
  private async ensureBucketExists(): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if bucket exists by trying to list files (more reliable than listBuckets)
      const { data, error: listError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list('', { limit: 1 });
      
      if (listError) {
        // If bucket doesn't exist, we get a specific error
        if (listError.message.includes('Bucket not found') || listError.message.includes('bucket does not exist')) {
          return { 
            success: false, 
            error: `Storage bucket '${this.BUCKET_NAME}' not found. Please create it manually in Supabase Dashboard: Storage > Create bucket > Name: user-photos, Public: Yes`
          };
        }
        
        // Other errors might be permissions-related but bucket exists
        console.warn('Storage list error (bucket might exist):', listError);
      }

      // If we can list files or get a permission error, bucket likely exists
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: `Storage access error: ${error.message}. Please verify the bucket exists in Supabase Dashboard.`
      };
    }
  }

  /**
   * Upload a file to Supabase storage
   */
  async uploadFile(
    file: File, 
    userId: string, 
    fileName?: string
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Ensure bucket exists first
      const bucketCheck = await this.ensureBucketExists();
      if (!bucketCheck.success) {
        return { success: false, error: bucketCheck.error };
      }

      // Generate unique filename if not provided
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const finalFileName = fileName || `${userId}_${timestamp}.${fileExt}`;
      const filePath = finalFileName;

      // Upload file to storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Storage upload error:', {
          message: error.message,
          error: error,
          filePath: filePath,
          fileSize: file.size,
          fileType: file.type
        });
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      return {
        success: true,
        url: publicUrl
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete a file from Supabase storage
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
   * Get file path from URL for deletion
   */
  extractFilePathFromUrl(url: string, userId: string): string {
    // Extract the file path from the public URL
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    return `${userId}/${fileName}`;
  }
}

export const supabaseStorageService = new SupabaseStorageService();