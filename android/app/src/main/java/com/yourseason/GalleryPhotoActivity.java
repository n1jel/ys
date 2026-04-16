package com.yourseason;


import android.app.ActivityManager;
import android.content.BroadcastReceiver;
import android.content.ContentResolver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.database.Cursor;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Log;
import android.view.View;
import android.widget.RemoteViews;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.mobileconnectors.s3.transferutility.TransferListener;
import com.amazonaws.mobileconnectors.s3.transferutility.TransferObserver;
import com.amazonaws.mobileconnectors.s3.transferutility.TransferState;
import com.amazonaws.mobileconnectors.s3.transferutility.TransferUtility;
import com.android.volley.DefaultRetryPolicy;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.gson.Gson;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Queue;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.gson.Gson;

public class GalleryPhotoActivity extends ReactActivity {

    private ArrayList<Photo> imageList = new ArrayList<>();
    private Toolbar toolbar;
    private GalleryPhotoAdapter photoAdapter;
    private RecyclerView recyclerView;
    private SelectDselectImage selectDselectImage;
    private TextView selectedPhotoCount;
    private TextView backButton;
    private TextView uploadButton;
    private List<SelectedPhoto> selectedPhotos = new ArrayList<>();
    private DragSelectTouchListener dragSelectTouchListener;
    private Queue<SelectedPhoto> uploadQueue = new LinkedList<>();
    private ContentResolver resolver;
    String baseurl = "";
    private static final int MY_SOCKET_TIMEOUT_MS = 60000; // 60 seconds
    String token = "";
    String collectionIdValue = "";
    String isFirstChunkValue = "";
    String saveToLibraryValue = "";
    String typeValue = "";
    Boolean isforCreateCollection = false;

    String name = "";
    String description = "";
    String displayType = "";
    String  displayTo="";
    Boolean isCollectionIdFromReactNative = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_gallery_photo);
        Log.w("III ii ii ", "IN GALLERY ACTIVITY=====");
        recyclerView = findViewById(R.id.recyclerView);
        toolbar = findViewById(R.id.toolbar);
        backButton = findViewById(R.id.backButton);
        uploadButton = findViewById(R.id.uploadButton);
        backButton = findViewById(R.id.backButton);
        selectedPhotoCount = findViewById(R.id.selectedPhotoCount);
        resolver = this.getApplicationContext().getContentResolver();
        setSupportActionBar(toolbar);
        getSupportActionBar().setDisplayShowTitleEnabled(false);
        //IntentFilter intentFilter = new IntentFilter("UPLOAD_STATUS");
        //registerReceiver(uploadStatusReceiver, intentFilter);
        Bundle extras = getIntent().getExtras();
        if (extras != null) {
            String foldername = extras.getString("foldername");
            selectDselectImage = new SelectDselectImage() {
                @Override
                public void selectImage(SelectedPhoto photo) {
                    selectedPhotos.add(photo);
                    selectedPhotoCount.setText(String.valueOf(selectedPhotos.size()));
                }

                @Override
                public void dselectImage(SelectedPhoto photo) {
                    int index = -1;
                    for (int i = 0; i < selectedPhotos.size(); i++) {
                        SelectedPhoto selected = selectedPhotos.get(i);
                        if (selected.getName().equals(photo.getName())) {
                            index = i;
                            break;
                        }
                    }
                    if (index != -1) {
                        System.out.println("YAHA PE AAA RAHA HAI Photo with name " + photo.getName() + " already exists at index " + index);
                        selectedPhotos.remove(index);
                        selectedPhotoCount.setText(String.valueOf(selectedPhotos.size()));
                    }


                    Log.w("CODE IS RUNNING HERE ", "=====fdsfdsfds=== List Size is " + photo.getName());
                }

                @Override
                public void onLongClick(SelectedPhoto photo, int position) {
                    if (selectedPhotos.contains(photo)) {
                        selectedPhotos.remove(photo);
                        selectedPhotoCount.setText(String.valueOf(selectedPhotos.size()));
                    } else {
                        selectedPhotos.add(photo);
                        selectedPhotoCount.setText(String.valueOf(selectedPhotos.size()));
                    }
                    photoAdapter.notifyDataSetChanged();
                }
            };

            String additionalOptionJson = getIntent().getStringExtra("additional");


            token = getIntent().getStringExtra("token");


//            { NativeMap: {} }
            /*collection*/
            String collection = getIntent().getStringExtra("collection");
            Log.w("CHECK CHECK","=====================================\n\n");
Log.w("additionalOptionJson",additionalOptionJson);
Log.w("collection",collection);
            Log.w("CHECK CHECK","=====================================\n\n");
            try {
                JSONObject collectionnOptionJsonObject = new JSONObject(collection);
                // JSONObject nativeMap = collectionnOptionJsonObject.optJSONObject("NativeMap");

                if (collectionnOptionJsonObject != null && collectionnOptionJsonObject.length() > 0) {
                    Log.w("collectionnOptionJs", "DATA COMMINGGGGG");
//                    { NativeMap: {"name":"tgg","description":"yy","display_type":"public"} }
                    name = collectionnOptionJsonObject.optString("name");
                    description = collectionnOptionJsonObject.optString("description");
                    displayType = collectionnOptionJsonObject.optString("display_type");
                    if (displayType.equals("private")){
                        displayTo = collectionnOptionJsonObject.optString("display_to");
                        Log.w("dissplayTo dissplayTo" , displayTo);
                    }else{
                        displayTo = "";
                    }
                    Log.w("SDF SDF =", name + "  " + description + " " + displayType);
                    isforCreateCollection = true;
                    isCollectionIdFromReactNative = false;
                    // Use the extracted data as needed
                } else {

                    isCollectionIdFromReactNative = false;
                    isforCreateCollection = false;
                    Log.w("collectionnOptionJs", "NativeMap is empty");
                }

            } catch (JSONException e) {
                e.printStackTrace();
            }

            /*additionalOptionJson*/
            try {
                Log.w("additionalOptionJson", additionalOptionJson);
                JSONObject additionalOptionJsonObject = new JSONObject(additionalOptionJson);
                isFirstChunkValue = additionalOptionJsonObject.getString("is_first_chunk");
                saveToLibraryValue = additionalOptionJsonObject.getString("saveToLibrary");
                typeValue = additionalOptionJsonObject.getString("type");
                if (additionalOptionJsonObject.optString("collectionType").equals("Brands")) {
                    baseurl = "https://api.yourseasonapp.com/api/v1/brand/";
                } else {
                    baseurl = "https://api.yourseasonapp.com/api/v1/stylist/";
                }
                String co = additionalOptionJsonObject.getString("collection_id");
                if (co.isEmpty()) {
                    //"CO IS EMPTY"
                    collectionIdValue = additionalOptionJsonObject.getString("collection_id");
                    isCollectionIdFromReactNative = false;
                } else {
                    collectionIdValue = additionalOptionJsonObject.getString("collection_id");
                    isCollectionIdFromReactNative = true;
                }
                Log.w("COCHECK COCHECK COCHECK", co);
            } catch (JSONException e) {
                e.printStackTrace();
            }

            imageList.addAll(loadPhotosForFolder(foldername));
            photoAdapter = new GalleryPhotoAdapter(imageList, selectDselectImage);
            recyclerView.setLayoutManager(new GridLayoutManager(this, 3));
            recyclerView.setAdapter(photoAdapter);

            dragSelectTouchListener = new DragSelectTouchListener(recyclerView, selectDselectImage, getApplicationContext(), imageList, photoAdapter);
            recyclerView.addOnItemTouchListener(dragSelectTouchListener);
        }

        backButton.setOnClickListener(v -> onBackPressed());

        uploadButton.setOnClickListener(v -> {
            //uploadQueue.addAll(selectedPhotos);

            /*agr collection id backend se aaya to */
            if (isCollectionIdFromReactNative) {

                startServiceForUpdateCollection();
            } else {
                /*agr collection ka object empty nahi hai to  */
                if (isforCreateCollection) {
                    /*this is for create collection*/
                    hitapiCreateCollection();
                } else {
                    /*this is for gallery*/

                    /*agr collection ka object empty hai to  */
                    startUploadService();
                }
            }

        });
    }

    @Override
    public void onBackPressed() {
        super.onBackPressed();
        ReactInstanceManager reactInstanceManager = getReactInstanceManager();
        ReactContext reactContext = reactInstanceManager.getCurrentReactContext();
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("sendDataToJS", "[]");
        finish();
    }


    private List<Photo> loadPhotosForFolder(String folderName) {
        List<Photo> photos = new ArrayList<>();
        String[] projection = {MediaStore.Images.Media._ID, MediaStore.Images.Media.DISPLAY_NAME, MediaStore.Images.Media.DATA};
        String selection = MediaStore.Images.Media.BUCKET_DISPLAY_NAME + " = ? AND (" + MediaStore.Images.Media.MIME_TYPE + " = ? OR " + MediaStore.Images.Media.MIME_TYPE + " = ?)";
        String[] selectionArgs = {folderName, "image/jpeg", "image/png"};
        String sortOrder = MediaStore.Images.Media.DATE_ADDED + " DESC";

        Cursor cursor = resolver.query(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, projection, selection, selectionArgs, sortOrder);
        if (cursor != null) {
            int idColumn = cursor.getColumnIndexOrThrow(MediaStore.Images.Media._ID);
            int nameColumn = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DISPLAY_NAME);
            int pathColumn = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATA);

            while (cursor.moveToNext()) {
                long id = cursor.getLong(idColumn);
                String name = cursor.getString(nameColumn);
                String path = cursor.getString(pathColumn);

                Uri uri = Uri.withAppendedPath(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, String.valueOf(id));
                photos.add(new Photo(uri.toString(), name, path));
            }
            cursor.close();
        }
        return photos;
    }


    public void hitapiGallery(List<String> list) {
        JSONObject requestBody = new JSONObject();
        try {
            requestBody.put("saveToLibrary", saveToLibraryValue);
            requestBody.put("collection_id", collectionIdValue);
            requestBody.put("type", typeValue);
            requestBody.put("data", new JSONArray(list).toString()); // Convert list to JSONArray
            requestBody.put("is_first_chunk", isFirstChunkValue);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(Request.Method.POST, baseurl + "update_gallery_media", requestBody, response -> {
            Log.d("Gallery API Response", response.toString());
            JSONObject jsonResponse = null;
            try {
                jsonResponse = new JSONObject(response.toString());
                boolean status = jsonResponse.optBoolean("status");
                String message = jsonResponse.optString("message");
                if (status) {
                    Toast.makeText(getApplicationContext(), message, Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(getApplicationContext(), "API Call Failed: " + message, Toast.LENGTH_SHORT).show();
                }
            } catch (JSONException e) {
                throw new RuntimeException(e);
            }

        }, error -> {
            Log.e("API Error", error.toString());
            Toast.makeText(getApplicationContext(), "API Call Failed", Toast.LENGTH_SHORT).show();
        }) {
            @Override
            public Map<String, String> getHeaders() {
                Map<String, String> headers = new HashMap<>();
                headers.put("Authorization", "Bearer " + token);
                return headers;
            }
        };

        RequestQueue queue = Volley.newRequestQueue(getApplicationContext());
        queue.add(jsonObjectRequest);
    }

    public void hitapiCreateCollection() {
        JSONObject requestBody = new JSONObject();
        try {
//             NativeMap: {"name":"ty","description":"rf","display_type":"public"} }
            requestBody.put("name", name);
            requestBody.put("description", description);
            requestBody.put("display_type", displayType);



            if (displayType.equals("private")) {
                // Parse displayTo string into a JSON array
                JSONArray displayToArray = new JSONArray(displayTo);
                requestBody.put("display_to", displayToArray);
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
Log.w("Sending data is ", requestBody.toString());
        JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(Request.Method.POST, baseurl + "create_collection", requestBody, response -> {
            Log.w("API Response collection", response.toString());
            JSONObject jsonResponse = null;
            try {
                jsonResponse = new JSONObject(response.toString());
                boolean status = jsonResponse.optBoolean("status");
                String message = jsonResponse.optString("message");

                //,"_id":"65e048bebac26d48bfff2da8",
                /*{"status":true,"message":"Collection added successfully","data":{"stylist_id":"64f9bbc048f75ff97b421291",
                "name":"hhh","description":"hhh","display_type":"public","display_to":[],"status":1,"_id":"65e048bebac26d48bfff2da8",
                "created_at":"2024-02-29T09:05:02.111Z","updated_at":"2024-02-29T09:05:02.111Z","__v":0}}*/
                // Assuming jsonString is the string containing the JSON response

                if (status) {
                    Toast.makeText(getApplicationContext(), message, Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(getApplicationContext(), "API Call Failed: " + message, Toast.LENGTH_SHORT).show();
                }
                // Extract the data object
                JSONObject data = jsonResponse.optJSONObject("data");
                if (data != null) {
                    // get the _id field here ===SDF DSF DSF SDF
                    String id = data.optString("_id");
                    Log.w("collectionidhere", id);
                    startServiceForCreateCollection(id);
                    Log.d("ID", id);
                } else {
                    Log.e("Error", "No data object found");
                    Toast.makeText(getApplicationContext(), "Something goes wrong", Toast.LENGTH_SHORT).show();
                }

            } catch (JSONException e) {
                throw new RuntimeException(e);
            }

        }, error -> {
            Log.e("API Error", error.toString());
            Toast.makeText(getApplicationContext(), "API Call Failed", Toast.LENGTH_SHORT).show();
        }) {
            @Override
            public Map<String, String> getHeaders() {
                Map<String, String> headers = new HashMap<>();
                headers.put("Authorization", "Bearer " + token);
                return headers;
            }
        };

        RequestQueue queue = Volley.newRequestQueue(getApplicationContext());
        queue.add(jsonObjectRequest);
    }

    private void startUploadService() {

        try {
            Intent serviceIntent = new Intent(this, UploadService.class);
            ArrayList<SelectedPhoto> uploadList = new ArrayList<>(selectedPhotos);
            serviceIntent.putExtra("queue", uploadList);
            serviceIntent.putExtra("saveToLibrary", saveToLibraryValue);
            serviceIntent.putExtra("baseUrl", baseurl);
            serviceIntent.putExtra("collection_id", collectionIdValue);
            serviceIntent.putExtra("type", typeValue);
            serviceIntent.putExtra("is_first_chunk", isFirstChunkValue);
            serviceIntent.putExtra("token", token);
            serviceIntent.putExtra("isCollectionIdFromReactNative", false);
            Log.w("startUploadService", "startUploadService=====code =========code====");
            startService(serviceIntent);

            ReactInstanceManager reactInstanceManager = getReactInstanceManager();

            // Get the ReactContext
            ReactContext reactContext = reactInstanceManager.getCurrentReactContext();

            sendCloseEvent(reactContext, "sendDataToJS");
            selectedPhotos.clear();
            finish();
        } catch (Exception e) {
        }

    }

    private void startServiceForCreateCollection(String collection_id) {
        try {
            Intent serviceIntent = new Intent(this, UploadService.class);
            ArrayList<SelectedPhoto> uploadList = new ArrayList<>(selectedPhotos);
            serviceIntent.putExtra("queue", uploadList);
            serviceIntent.putExtra("saveToLibrary", saveToLibraryValue);
            serviceIntent.putExtra("baseUrl", baseurl);
            serviceIntent.putExtra("collection_id", collection_id);
            serviceIntent.putExtra("type", typeValue);
            serviceIntent.putExtra("is_first_chunk", isFirstChunkValue);
            serviceIntent.putExtra("token", token);
            serviceIntent.putExtra("isCollectionIdFromReactNative", false);
            Log.w("startUploadService", "startUploadService=====code =========code====");
            startService(serviceIntent);

            ReactInstanceManager reactInstanceManager = getReactInstanceManager();

            // Get the ReactContext
            ReactContext reactContext = reactInstanceManager.getCurrentReactContext();

            sendCloseEvent(reactContext, "sendDataToJS");
            selectedPhotos.clear();
            finish();
        } catch (Exception e) {
        }
    }

    private void startServiceForUpdateCollection() {

        try {
            Intent serviceIntent = new Intent(this, UploadService.class);
            ArrayList<SelectedPhoto> uploadList = new ArrayList<>(selectedPhotos);
            serviceIntent.putExtra("queue", uploadList);
            serviceIntent.putExtra("saveToLibrary", saveToLibraryValue);
            serviceIntent.putExtra("collection_id", collectionIdValue);
            serviceIntent.putExtra("baseUrl", baseurl);
            serviceIntent.putExtra("type", typeValue);
            serviceIntent.putExtra("is_first_chunk", isFirstChunkValue);
            serviceIntent.putExtra("token", token);
            serviceIntent.putExtra("isCollectionIdFromReactNative", true);
            Log.w("startUploadService", "startUploadService=====code =========code====");
            startService(serviceIntent);

            ReactInstanceManager reactInstanceManager = getReactInstanceManager();

            // Get the ReactContext
            ReactContext reactContext = reactInstanceManager.getCurrentReactContext();

            sendCloseEvent(reactContext, "sendDataToJS");
            selectedPhotos.clear();
            finish();
        } catch (Exception e) {
        }

    }


    public static boolean isServiceRunning(Context context, Class<?> serviceClass) {
        ActivityManager manager = (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
        for (ActivityManager.RunningServiceInfo service : manager.getRunningServices(Integer.MAX_VALUE)) {
            if (serviceClass.getName().equals(service.service.getClassName())) {
                return true;
            }
        }
        return false;
    }

    private void sendCloseEvent(ReactContext reactContext, String eventName) {


        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, "[]");
    }

    private BroadcastReceiver uploadStatusReceiver = new BroadcastReceiver() {

        @Override
        public void onReceive(Context context, Intent intent) {
            int pendingCount = intent.getIntExtra("pendingCount", 0);
            int uploadedCount = intent.getIntExtra("uploadedCount", 0);
            int totalImageforUpload = intent.getIntExtra("totalImageforUpload", 0);
            String[] pathArray = intent.getStringArrayExtra("pathlist");
            List<String> pathList = Arrays.asList(pathArray);
            hitapiGallery(pathList);
            Log.w("NOtification data", "pending " + pendingCount + " uploadedcount " + uploadedCount + " totalcount " + totalImageforUpload);
        }

    };

    public static void stopUploadService(ReactApplicationContext context) {
        try {
            if (isServiceRunning(context, UploadService.class)) {
                Log.w("isServiceRunning", "YES RUNNING");
                UploadService.stopService(context);
                Intent serviceIntent = new Intent(context, UploadService.class);
                context.stopService(serviceIntent);
                WritableMap map = Arguments.createMap();
                map.putString("name", "Uploading");
                map.putInt("total", 0);
                map.putInt("completed", 0);
                map.putInt("remaining", 0);
                Log.w("MAP DATA", map.toString());
                context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("status", map);
            } else {
                Log.w("isServiceRunning", "NO RUNNING");
            }


        } catch (Exception e) {
            Log.w("Exception CLOSE ", e.getMessage());
        }
    }

}