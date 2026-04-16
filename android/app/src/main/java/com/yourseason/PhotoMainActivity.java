package com.yourseason;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.Manifest;
import android.content.ContentResolver;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.os.Build;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Log;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;


import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;


public class PhotoMainActivity extends AppCompatActivity {
    private static final int PERMISSION_REQUEST_CODE = 100;
    private ContentResolver resolver;
    private ImageFolderAdapter folderAdapter;
    private RecyclerView recyclerView;
    private Toolbar toolbar;
    private TextView backButton;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_photo_main);
        resolver = getApplicationContext().getContentResolver();
        toolbar = findViewById(R.id.toolbar);
        backButton = findViewById(R.id.backButton);
        setSupportActionBar(toolbar);
        getSupportActionBar().setDisplayShowTitleEnabled(false);
        backButton.setOnClickListener(v -> onBackPressed());
        String additionalOptionJson = getIntent().getStringExtra("additional");
        String token = getIntent().getStringExtra("token");
        String collection = getIntent().getStringExtra("collection");

        recyclerView = findViewById(R.id.recyclerView);
        recyclerView.setLayoutManager(new GridLayoutManager(this, 1));
        folderAdapter = new ImageFolderAdapter(getApplicationContext(), folderName -> {
            try {
                Log.w("IN EXCEPTIONNNN","======SDF ====  SDF =======SDF ========+SDF =sdfl;dsfl;dslmfsdklm");
                ReactInstanceManager reactInstanceManager = getReactInstanceManager();

                // Get the ReactContext
                ReactContext reactContext = reactInstanceManager.getCurrentReactContext();
                Intent i = new Intent(reactContext, GalleryPhotoActivity.class);
                i.putExtra("foldername", folderName);
                i.putExtra("additional",additionalOptionJson);
                i.putExtra("token",token);
                i.putExtra("collection",collection);
                startActivity(i);
                finish();
            }catch (Exception e){
                Log.w("IN EXCEPTIONNNN",e.getMessage());
            }
        });
        recyclerView.setAdapter(folderAdapter);
        if (checkPermission()) {

            List<String> allFolders = loadAllFolders();
            folderAdapter.setFolders(allFolders);
        } else {
            requestPermission();
        }
        List<String> allFolders = loadAllFolders();
        folderAdapter.setFolders(allFolders);
    }

    private void requestPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ActivityCompat.requestPermissions(this, new String[]{
                    Manifest.permission.READ_MEDIA_IMAGES,
                    Manifest.permission.READ_MEDIA_VIDEO
            }, PERMISSION_REQUEST_CODE);
        } else {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.READ_EXTERNAL_STORAGE}, PERMISSION_REQUEST_CODE);
        }
    }

    private boolean checkPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            boolean readMediaImagesPermission = ContextCompat.checkSelfPermission(this, Manifest.permission.READ_MEDIA_IMAGES) == PackageManager.PERMISSION_GRANTED;
            boolean readMediaVideoPermission = ContextCompat.checkSelfPermission(this, Manifest.permission.READ_MEDIA_VIDEO) == PackageManager.PERMISSION_GRANTED;
            return readMediaImagesPermission && readMediaVideoPermission;
        } else {
            return ContextCompat.checkSelfPermission(this, Manifest.permission.READ_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED;
        }
    }
    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // Permission granted, load all folders
                List<String> allFolders = loadAllFolders();
                folderAdapter.setFolders(allFolders);
            } else {
                // Permission denied, handle accordingly (e.g., show a message)
                Toast.makeText(this, "Permission denied", Toast.LENGTH_SHORT).show();
            }
        }
    }

    private List<String> loadAllFolders() {
        List<String> folders = new ArrayList<>();
        String[] projection = {MediaStore.Images.Media.BUCKET_DISPLAY_NAME};
        String selection = MediaStore.Images.Media.MIME_TYPE + " IN (?, ?)";
        String[] selectionArgs = {"image/jpeg", "image/png"};
        String sortOrder = MediaStore.Images.Media.BUCKET_DISPLAY_NAME + " ASC";

        Cursor cursor = resolver.query(
                MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                projection,
                selection,
                selectionArgs,
                sortOrder
        );
        if (cursor != null) {
            int folderNameColumn = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.BUCKET_DISPLAY_NAME);
            while (cursor.moveToNext()) {
                String folderName = cursor.getString(folderNameColumn);
                folders.add(folderName);
            }
            cursor.close();
        }
        return new ArrayList<>(new HashSet<>(folders)); // Remove duplicates
    }

    @Override
    public void onBackPressed() {
        super.onBackPressed();
        ReactInstanceManager reactInstanceManager = getReactInstanceManager();

        // Get the ReactContext
        ReactContext reactContext = reactInstanceManager.getCurrentReactContext();
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("sendDataToJS", "[]");
        finish();
    }
    private ReactInstanceManager getReactInstanceManager() {
        if (getApplication() instanceof ReactApplication) {
            ReactNativeHost reactNativeHost = ((ReactApplication) getApplication()).getReactNativeHost();
            return reactNativeHost.getReactInstanceManager();
        }
        return null;
    }
}

