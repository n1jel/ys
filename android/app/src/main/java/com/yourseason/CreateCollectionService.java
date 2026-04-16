package com.yourseason;


import android.annotation.SuppressLint;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.IBinder;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.Nullable;

import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.mobileconnectors.s3.transferutility.TransferListener;
import com.amazonaws.mobileconnectors.s3.transferutility.TransferObserver;
import com.amazonaws.mobileconnectors.s3.transferutility.TransferState;
import com.amazonaws.mobileconnectors.s3.transferutility.TransferUtility;
import com.amazonaws.services.s3.AmazonS3Client;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

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

public class CreateCollectionService extends Service {
    private List<SelectedPhoto> selectedPhotos = new ArrayList<>();
    private List<SelectedPhoto> selectedPhotosss = new ArrayList<>();
    private static final String ACCESS_ID = "AKIAUCPUVPRTTACOV3ZR";
    private static final String SECRET_KEY = "s9Z2+UXIS6R25oWMbcEVZCjrZSBXfL3xKV6XjCsB";
    private static final String BUCKET_NAME = "yourseason";
    private BasicAWSCredentials creds = new BasicAWSCredentials(ACCESS_ID, SECRET_KEY);
    private AmazonS3Client s3Client = new AmazonS3Client(creds);

    private Queue<SelectedPhoto> uploadQueue = new LinkedList<>();
    private boolean isUploading = false;
    private int uploadedPhotos = 0;
    private int failedPhotos = 0;
    private List<String> getPathfromserver = new ArrayList<>();
    int totalImageforUpload = 0;
    private Queue<SelectedPhoto> uploadQueueee = new LinkedList<>();

    String token = "";
    String collectionIdValue = "";
    String isFirstChunkValue = "";
    String saveToLibraryValue = "";
    String typeValue = "";
    private static boolean shouldContinue = true;

    public CreateCollectionService() {
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {

        selectedPhotos = (ArrayList<SelectedPhoto>) intent.getSerializableExtra("queue");
        selectedPhotosss = (ArrayList<SelectedPhoto>) intent.getSerializableExtra("queue");
        saveToLibraryValue = intent.getStringExtra("saveToLibrary");
        collectionIdValue = intent.getStringExtra("collection_id");
        typeValue = intent.getStringExtra("type");
        isFirstChunkValue = intent.getStringExtra("is_first_chunk");
        token = intent.getStringExtra("token");
        Log.w("IN UPLOAD SERVICE", saveToLibraryValue + "\n" + collectionIdValue + "\n" + typeValue + "\n" + isFirstChunkValue + "\n" + token);
        uploadQueue.addAll(selectedPhotos);
        totalImageforUpload = selectedPhotosss.size();
        Log.w("selectedPhotoss ", selectedPhotos.size() + "");
        if (uploadQueue != null && !uploadQueue.isEmpty()) {
            uploadNextImage();
        } else {
            Toast.makeText(getApplicationContext(), "No images to upload", Toast.LENGTH_SHORT).show();
        }

        if (!shouldContinue) {
            stopSelf();
            return START_NOT_STICKY;
        }

        return START_STICKY;
    }

    public static void stopService(Context context) {
        Log.w("stopService", "====running stopService");
        shouldContinue = false; // Set the flag to false to stop the service
        Intent serviceIntent = new Intent(context, UploadService.class);
        context.stopService(serviceIntent);
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }


    //    private void uploadNextImage() {
//        if (!uploadQueue.isEmpty() && !isUploading) {
//            SelectedPhoto photo = uploadQueue.poll();
//            if (photo != null) {
//                isUploading = true;
//                String fileName = "gallery/test/" + System.currentTimeMillis() + photo.getName();
//                uploadImage(photo.getPath(), fileName);
//
//            }
//        }
//    }
    private void uploadNextImage() {
        if (shouldContinue) {
            if (!uploadQueue.isEmpty() && !isUploading) {
                SelectedPhoto photo = uploadQueue.poll();
                if (photo != null) {
                    isUploading = true;
                    String fileName = "gallery/test/" + System.currentTimeMillis() + photo.getName();
                    String compressedImagePath = ImageUtils.compressImage(this, Uri.parse(photo.getUri()));
                    if (compressedImagePath != null) {
                        uploadImage(compressedImagePath, fileName);
                    }
                }
            }
        }
    }

    private void uploadImage(String filePath, String fileName) {

        TransferUtility transferUtility = TransferUtility.builder()
                .context(getApplicationContext())
                .s3Client(s3Client)
                .build();

        TransferObserver observer = transferUtility.upload(BUCKET_NAME, fileName, new File(filePath));
        observer.setTransferListener(new TransferListener() {
            @SuppressLint("LongLogTag")
            @Override
            public void onStateChanged(int id, TransferState state) {
                if (state == TransferState.COMPLETED) {
                    uploadedPhotos++;
                    getPathfromserver.add(fileName);
                    Log.d("RUNNINGN HERE onStateChanged", "success");
                    isUploading = false;
                    uploadNextImage();
                    getStausOfUploadedAndPendingimages(uploadQueue.size(), uploadedPhotos);
                    //  sendBroadcast(new Intent("UPLOAD_STATUS"));
                } else if (state == TransferState.FAILED) {
                    failedPhotos++;
                    isUploading = false;
                    Log.d("RUNNINGN HERE FAILED", "fail");
                    uploadNextImage();
                    getStausOfUploadedAndPendingimages(uploadQueue.size(), uploadedPhotos);
                    //  sendBroadcast(new Intent("UPLOAD_STATUS"));
                }
            }

            @Override
            public void onProgressChanged(int id, long bytesCurrent, long bytesTotal) {


            }

            @Override
            public void onError(int id, Exception ex) {
                isUploading = false;
                uploadNextImage();
                // sendBroadcast(new Intent("UPLOAD_STATUS"));
                getStausOfUploadedAndPendingimages(uploadQueue.size(), uploadedPhotos);

            }
        });


    }

    private void getStausOfUploadedAndPendingimages(int pendingCount, int uploadedCount) {

        Log.w("shouldContinue--",shouldContinue+" =======");
        if (shouldContinue) {
            Log.w("Uploading status", "\n");
            Log.w("Notification data", "pending " + pendingCount + "uploadedcount " + uploadedCount + " totalcount " + totalImageforUpload);
            Log.w("====", "\n");
            if (uploadedCount + failedPhotos == totalImageforUpload) {
                String[] pathArray = getPathfromserver.toArray(new String[0]);
                //   Toast.makeText(getApplicationContext(),"Image uploadation complete",Toast.LENGTH_LONG).show();
                Log.d("UPLOADED DATA is ", getPathfromserver.toString());
                List<String> pathList = Arrays.asList(pathArray);
                hitapiGallery(pathList);
            }

            ReactInstanceManager reactInstanceManager = getReactInstanceManager();

            // Get the ReactContext
            ReactContext reactContext = reactInstanceManager.getCurrentReactContext();

            WritableMap map = Arguments.createMap();
            map.putString("name", "Uploading");
            map.putInt("total", totalImageforUpload);
            map.putInt("completed", uploadedCount);
            map.putInt("remaining", pendingCount);
            Log.w("MAP DATA", map.toString());
            reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("status", map);

        }
    }


    private ReactInstanceManager getReactInstanceManager() {
        if (getApplication() instanceof ReactApplication) {
            ReactNativeHost reactNativeHost = ((ReactApplication) getApplication()).getReactNativeHost();
            return reactNativeHost.getReactInstanceManager();
        }
        return null;
    }


    private void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
    }

    private void sendCloseEvent(ReactContext reactContext, String eventName) {
        Object[] intArray = new Object[0];

        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, intArray);
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

        JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(Request.Method.POST, "https://api.yourseasonapp.com/api/v1/stylist/update_gallery_media", requestBody, response -> {
            Log.d("API Response", response.toString());
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
                getPathfromserver = new ArrayList<>();
                uploadedPhotos = 0;
                failedPhotos = 0;
                totalImageforUpload = 0;
                selectedPhotos = new ArrayList<>();
                selectedPhotosss = new ArrayList<>();
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

}