package com.yourseason;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

public class ImageUtils {

    public static String compressImage(Context context, Uri imageUri) {
        InputStream input = null;
        Bitmap bitmap = null;
        String compressedImagePath = null;
        try {
            input = context.getContentResolver().openInputStream(imageUri);
            BitmapFactory.Options options = new BitmapFactory.Options();
            options.inJustDecodeBounds = true;
            BitmapFactory.decodeStream(input, null, options);
            input.close();

            int width = options.outWidth;
            int height = options.outHeight;
            float maxImageSize = 512f;
            float ratio = Math.min(width / maxImageSize, height / maxImageSize);

            options.inJustDecodeBounds = false;
            options.inSampleSize = (int) ratio;

            input = context.getContentResolver().openInputStream(imageUri);
            bitmap = BitmapFactory.decodeStream(input, null, options);

            File cacheDir = context.getCacheDir();
            File compressedImageFile = new File(cacheDir, "compressed_image.jpg");
            FileOutputStream out = new FileOutputStream(compressedImageFile);
            bitmap.compress(Bitmap.CompressFormat.JPEG, 100, out);
            out.flush();
            out.close();

            compressedImagePath = compressedImageFile.getAbsolutePath();
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                if (input != null) {
                    input.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return compressedImagePath;
    }
}

