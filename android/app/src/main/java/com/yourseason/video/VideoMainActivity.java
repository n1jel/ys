package com.yourseason.video;

import android.Manifest;
import android.content.ContentResolver;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.os.Build;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Log;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;


import com.yourseason.R;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

public class VideoMainActivity extends AppCompatActivity {
    private static final int PERMISSION_REQUEST_CODE = 100;
    private ContentResolver resolver;
    private VideoFolderAdapter folderAdapter;
    private RecyclerView recyclerView;
    private Toolbar toolbar;
    private TextView backButton;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main_video);
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
        folderAdapter = new VideoFolderAdapter(getApplicationContext(), folderName -> {
            Log.w("CHECK DATA",additionalOptionJson);
            Log.w("CHECK DATA token",token);
            Log.w("CHECK DATA collection",collection);
            Intent i = new Intent(VideoMainActivity.this, GalleryVideoActivity.class);
            i.putExtra("foldername", folderName);
           i.putExtra("additional",additionalOptionJson);
           i.putExtra("token",token);
           i.putExtra("collection",collection);
            startActivity(i);
            finish();
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

    @Override
    protected void onStart() {
        super.onStart();
        //checkPermission();
        if (checkPermission()) {
            List<String> allFolders = loadAllFolders();
            folderAdapter.setFolders(allFolders);
        } else {
            requestPermission();
        }
    }



    private List<String> loadAllFolders() {
        List<String> folders = new ArrayList<>();
        String[] projection = {MediaStore.Video.Media.BUCKET_DISPLAY_NAME};
        String selection = MediaStore.Video.Media.MIME_TYPE + " IN (?, ?, ?)";
        String[] selectionArgs = {"video/mp4", "video/quicktime", "video/mpeg"};

        String sortOrder = MediaStore.Video.Media.BUCKET_DISPLAY_NAME + " ASC";

        Cursor cursor = resolver.query(
                MediaStore.Video.Media.EXTERNAL_CONTENT_URI,
                projection,
                selection,
                selectionArgs,
                sortOrder
        );
        if (cursor != null) {
            int folderNameColumn = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.BUCKET_DISPLAY_NAME);
            while (cursor.moveToNext()) {
                String folderName = cursor.getString(folderNameColumn);
                folders.add(folderName);
            }
            cursor.close();
        }
        return new ArrayList<>(new HashSet<>(folders)); // Remove duplicates
    }
}