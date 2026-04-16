package com.yourseason.updatecollection;

import android.annotation.SuppressLint;
import android.os.Bundle;
import android.util.Log;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.android.volley.AuthFailureError;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.gson.Gson;
import com.yourseason.R;
import com.yourseason.apigallery.CreateGallerywithApi;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class UpdateCollectionActivity extends ReactActivity {
    private static final String TAG = "UpdatenActivityyrequest";
    private RecyclerView recyclerView;
    private UpdateCollectionSelectDselectImage selectDselectImage;
    private boolean isLoading = false;
    private boolean isLastPage = false;
    private int currentPage = 1;
    private TextView selectedPhotoCount;
    String baseUrl="";
    UpdateCollectionAdapter createGalleryAdapter;

    private UpdateCollectionDragSelectTouchListener dragSelectTouchListener;

    RelativeLayout uploadbtn;

    List<UpdateCollectionData.UpdateCollectionDatum> createGalleryData = new ArrayList<UpdateCollectionData.UpdateCollectionDatum>();
    private List<UpdateCollectionData.UpdateCollectionDatum> selectedPhotos = new ArrayList<>();
    private List<String> selectedPhotosids = new ArrayList<>();

    String token = "";

    String collectionId="";
    ImageView back;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_updatecollection);

        recyclerView = findViewById(R.id.recyclerView);
        selectedPhotoCount = findViewById(R.id.selectedPhotoCount);
        selectedPhotoCount.setText("Edit Images (0) ");
        back = findViewById(R.id.back);
        uploadbtn = findViewById(R.id.uploadbtn);
         collectionId = getIntent().getStringExtra("collection");
         token=getIntent().getStringExtra("token");
        back.setOnClickListener(v -> {
            onBackPressed();
        });
        String  data=  getIntent().getStringExtra("data");

        Log.w("XCV XCV XCV XCV XCV ",data);
        if (data != null && !data.isEmpty() && !data.equals("{}")) {
            // Handle the data
            Log.w("XCV XCV XCV ", "Received data: " + data);
            try {
                JSONObject jsonData = new JSONObject(data);
                if (jsonData.has("collectionType")) {
                    String collectionType = jsonData.getString("collectionType");
                    Log.w("XCV XCV XCV ", "collectionType: " + collectionType);
                    if(collectionType.equals("Brands")){
                        baseUrl="https://api.yourseasonapp.com/api/v1/brand/";
                    }else {
                        baseUrl="https://api.yourseasonapp.com/api/v1/stylist/";
                    }
                    // Further processing of the collectionType as needed
                } else {
                    baseUrl="https://api.yourseasonapp.com/api/v1/stylist/";
                    Log.w("XCV XCV XCV ", "collectionType not found in data");
                }
            } catch (JSONException e) {
                Log.e("XCV XCV XCV ", "Failed to parse data JSON", e);
            }
            // Further processing of the data as needed
        } else {
            baseUrl="https://api.yourseasonapp.com/api/v1/stylist/";
            Log.w("XCV XCV XCV", "Received empty or null data");
        }
        uploadbtn.setOnClickListener(v -> {
            JSONArray jsonArray = new JSONArray(selectedPhotosids);

            JSONObject requestBody = new JSONObject();
            try {
                requestBody.put("collection_id", collectionId);
                requestBody.put("mediaArray", jsonArray);
            } catch (JSONException e) {
                Log.w("IN ERRRRRR", e.getMessage());
                e.printStackTrace();
            }

            uploadCreateGallery(token,requestBody);


        });

        selectDselectImage = new UpdateCollectionSelectDselectImage() {
            @Override
            public void selectImage(UpdateCollectionData.UpdateCollectionDatum photo) {
                selectedPhotos.add(photo);
                selectedPhotosids.add(photo.getId());
                selectedPhotoCount.setText("Edit Images (" + String.valueOf(selectedPhotos.size()) + ")");
            }

            @Override
            public void dselectImage(UpdateCollectionData.UpdateCollectionDatum photo) {


                int index = -1;
                for (int i = 0; i < selectedPhotos.size(); i++) {
                    UpdateCollectionData.UpdateCollectionDatum selected = selectedPhotos.get(i);
                    if (selected.getId().equals(photo.getId())) {
                        index = i;
                        break;
                    }
                }
                if (index != -1) {
                    System.out.println("YAHA PE AAA RAHA HAI Photo with name " + photo.getId() + " already exists at index " + index);
                    selectedPhotos.remove(index);
                    selectedPhotosids.remove(index);
                    selectedPhotoCount.setText("Edit Images (" + String.valueOf(selectedPhotos.size()) + ")");
                }


                Log.w("CODE IS RUNNING HERE ", "=====fdsfdsfds=== List Size is " + photo.getId());

            }

            @Override
            public void onLongClick(UpdateCollectionData.UpdateCollectionDatum photo, int position) {
                if (selectedPhotos.contains(photo)) {
                    selectedPhotos.remove(photo);
                    selectedPhotosids.remove(photo.getId());
                    selectedPhotoCount.setText("Edit Images (" + String.valueOf(selectedPhotos.size()) + ")");
                } else {
                    selectedPhotos.add(photo);
                    selectedPhotosids.add(photo.getId());
                    selectedPhotoCount.setText("Edit Images (" + String.valueOf(selectedPhotos.size()) + ")");
                }
                createGalleryAdapter.notifyDataSetChanged();
            }
        };

        recyclerView.setLayoutManager(new GridLayoutManager(this, 3));
        createGalleryAdapter = new UpdateCollectionAdapter(createGalleryData, selectDselectImage);
        recyclerView.setAdapter(createGalleryAdapter);
         dragSelectTouchListener = new UpdateCollectionDragSelectTouchListener(recyclerView, selectDselectImage, getApplicationContext(), createGalleryData, createGalleryAdapter);
        recyclerView.addOnItemTouchListener(dragSelectTouchListener);
        recyclerviewPagination();

        loadFirstPage();
    }

    @Override
    public void onBackPressed() {
        super.onBackPressed();
        ReactInstanceManager reactInstanceManager = getReactInstanceManager();
        ReactContext reactContext = reactInstanceManager.getCurrentReactContext();
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("sendDataToJS", "[]");
        finish();
    }

    private void loadFirstPage() {
        currentPage = 1;
        getCreateData(token, currentPage);
    }

    private void loadMoreItems() {
        currentPage++;
        getCreateData(token, currentPage);
    }

    public void recyclerviewPagination() {
        recyclerView.addOnScrollListener(new RecyclerView.OnScrollListener() {
            @Override
            public void onScrolled(RecyclerView recyclerView, int dx, int dy) {
                super.onScrolled(recyclerView, dx, dy);
                GridLayoutManager layoutManager = (GridLayoutManager) recyclerView.getLayoutManager();
                int visibleItemCount = layoutManager.getChildCount();
                int totalItemCount = layoutManager.getItemCount();
                int firstVisibleItemPosition = layoutManager.findFirstVisibleItemPosition();

                if (!isLoading && !isLastPage) {
                    if ((visibleItemCount + firstVisibleItemPosition) >= totalItemCount
                            && firstVisibleItemPosition >= 0
                            && totalItemCount >= 10) { // Adjust this number based on your needs
                        loadMoreItems();
                    }
                }
            }
        });
    }

    public void getCreateData(final String bearerToken, final int page) {
       // String collectionId = "66275d6dde52c24b0a2fc94d";
        isLoading = true;
        String BASE_URL = baseUrl+"get_my_gallery?page=" + page + "&limit=10&collection_id=" + collectionId;
        RequestQueue requestQueue = Volley.newRequestQueue(getApplicationContext());
        @SuppressLint("LongLogTag") StringRequest stringRequest = new StringRequest(Request.Method.GET, BASE_URL,
                response -> {
                    Log.d(TAG, "Response: " + response);
                    UpdateCollectionData pojo = new Gson().fromJson(response, UpdateCollectionData.class);
                    if (pojo.getData().size() == 0) {
                        isLastPage = true;
                    }
                    createGalleryData.addAll(pojo.getData());
                    createGalleryAdapter.notifyDataSetChanged();
                    isLoading = false;
                },
                error -> {
                    Log.e(TAG, "Error: " + error.toString());
                    isLoading = false;
                }) {
            @Override
            public Map<String, String> getHeaders() throws AuthFailureError {
                Map<String, String> headers = new HashMap<>();
                headers.put("Authorization", "Bearer " + bearerToken);
                return headers;
            }
        };

        requestQueue.add(stringRequest);
    }

    /*{"status":true,"data":{"_id":"661fd1b11e7ba90c06c1a721","stylist_id":"64f9bbc048f75ff97b421291","name":"hh","description":"hh","display_type":"public","display_to":[],"status":1,"created_at":"2024-04-17T13:42:09.365Z","updated_at":"2024-04-23T09:10:00.212Z","__v":0}}*/

    public  void uploadCreateGallery( String token, JSONObject requestBody) {
        String url=baseUrl+"update_collection";
        RequestQueue requestQueue = Volley.newRequestQueue(UpdateCollectionActivity.this);

        JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(Request.Method.POST, url, requestBody,
                response -> {
                    Log.d(TAG, "Response: " + response);
                    try {

                        //boolean status = response.getBoolean("status");
                        //String message = response.getString("message");
                        //Toast.makeText(UpdateCollectionActivity.this, " " + message, Toast.LENGTH_LONG).show();
                        onBackPressed();
                    }catch (Exception e){}

                },

                error -> Log.e(TAG, "Error: " + error.toString())) {
            @Override
            public Map<String, String> getHeaders() {
                Map<String, String> headers = new HashMap<>();
                headers.put("Authorization", "Bearer " + token);
                headers.put("Content-Type", "application/json");
                return headers;
            }
        };

        // Add the request to the RequestQueue
        requestQueue.add(jsonObjectRequest);
    }
}