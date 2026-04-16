package com.yourseason.apigallery;

import android.os.Bundle;
import android.util.Log;
import android.view.View;
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

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class CreateGallerywithApi extends ReactActivity {

    private static final String TAG = "CREATGalleryrequest";
    private RecyclerView recyclerView;
    private SelectDselectImageWithApi selectDselectImage;
    private boolean isLoading = false;
    private boolean isLastPage = false;
    private int currentPage = 1;
    private TextView selectedPhotoCount;
    CreateGalleryWithApiAdapter createGalleryAdapter;

    private CreateGalleryDragSelectTouchListener dragSelectTouchListener;

    RelativeLayout uploadbtn;

    List<CreateGalleryData.Datum> createGalleryData = new ArrayList<CreateGalleryData.Datum>();
    private List<CreateGalleryData.Datum> selectedPhotos = new ArrayList<>();
    private List<String> selectedPhotosids = new ArrayList<>();
    String token = "";
    String name = "";
    String description = "";
    String displayType = "";
    String displayTo = "";
    String baseUrl="";

    ImageView back;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.create_gallery);
        recyclerView = findViewById(R.id.recyclerView);
        selectedPhotoCount = findViewById(R.id.selectedPhotoCount);
        back = findViewById(R.id.back);
        uploadbtn = findViewById(R.id.uploadbtn);
        selectedPhotoCount.setText("Edit Images (0) ");
        String collection = getIntent().getStringExtra("collection");
        token = getIntent().getStringExtra("token");
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
        try {
            JSONObject collectionnOptionJsonObject = new JSONObject(collection);
            //JSONObject nativeMap = collectionnOptionJsonObject.optJSONObject("NativeMap");
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
            }

        } catch (JSONException e) {
            e.printStackTrace();
        }


        uploadbtn.setOnClickListener(v -> {
            if (selectedPhotosids.isEmpty()) {
                Toast.makeText(CreateGallerywithApi.this, "Please select image", Toast.LENGTH_LONG).show();
            } else {
                JSONArray jsonArray = new JSONArray(selectedPhotosids);
                JSONObject requestBody = new JSONObject();
                try {
                    requestBody.put("description", description);
                    requestBody.put("display_type", displayType);
                    requestBody.put("name", name);
                    requestBody.put("mediaArray", jsonArray);

                    if (displayType.equals("private")) {
                        // Parse displayTo string into a JSON array
                        JSONArray displayToArray = new JSONArray(displayTo);
                        requestBody.put("display_to", displayToArray);
                    }
                } catch (JSONException e) {
                    Log.w("IN ERRRRRR", e.getMessage());
                    e.printStackTrace();
                }
                uploadCreateGallery(token, requestBody);
            }
        });

        selectDselectImage = new SelectDselectImageWithApi() {
            @Override
            public void selectImage(CreateGalleryData.Datum photo) {
                selectedPhotos.add(photo);
                selectedPhotosids.add(photo.getId());
                selectedPhotoCount.setText("Edit Images (" + selectedPhotos.size() + ")");
            }

            @Override
            public void dselectImage(CreateGalleryData.Datum photo) {
                int index = -1;
                for (int i = 0; i < selectedPhotos.size(); i++) {
                    CreateGalleryData.Datum selected = selectedPhotos.get(i);
                    if (selected.getId().equals(photo.getId())) {
                        index = i;
                        break;
                    }
                }
                if (index != -1) {
                    System.out.println("YAHA PE AAA RAHA HAI Photo with name " + photo.getId() + " already exists at index " + index);
                    selectedPhotos.remove(index);
                    selectedPhotosids.remove(index);
                    selectedPhotoCount.setText("Edit Images (" + selectedPhotos.size() + ")");
                }
                Log.w("CODE IS RUNNING HERE ", "=====fdsfdsfds=== List Size is " + photo.getId());
            }

            @Override
            public void onLongClick(CreateGalleryData.Datum photo, int position) {
                if (selectedPhotos.contains(photo)) {
                    selectedPhotos.remove(photo);
                    selectedPhotosids.remove(photo.getId());
                    selectedPhotoCount.setText("Edit Images (" + selectedPhotos.size() + ")");
                } else {
                    selectedPhotos.add(photo);
                    selectedPhotosids.add(photo.getId());
                    selectedPhotoCount.setText("Edit Images (" + selectedPhotos.size() + ")");
                }
                createGalleryAdapter.notifyDataSetChanged();
            }
        };

        recyclerView.setLayoutManager(new GridLayoutManager(this, 3));
        createGalleryAdapter = new CreateGalleryWithApiAdapter(createGalleryData, selectDselectImage);
        recyclerView.setAdapter(createGalleryAdapter);
        dragSelectTouchListener = new CreateGalleryDragSelectTouchListener(recyclerView, selectDselectImage, getApplicationContext(), createGalleryData, createGalleryAdapter);
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
                    if ((visibleItemCount + firstVisibleItemPosition) >= totalItemCount && firstVisibleItemPosition >= 0 && totalItemCount >= 10) { // Adjust this number based on your needs
                        loadMoreItems();
                    }
                }
            }
        });
    }

    public void getCreateData(final String bearerToken, final int page) {
        isLoading = true;
        String BASE_URL = baseUrl+"get_my_gallery?page=" + page + "&limit=" + 10;
        RequestQueue requestQueue = Volley.newRequestQueue(getApplicationContext());
        StringRequest stringRequest = new StringRequest(Request.Method.GET, BASE_URL, response -> {
            Log.d(TAG, "Response: " + response);
            CreateGalleryData pojo = new Gson().fromJson(response, CreateGalleryData.class);
            if (pojo.getData().size() == 0) {
                isLastPage = true;
            }
            createGalleryData.addAll(pojo.getData());
            createGalleryAdapter.notifyDataSetChanged();
            isLoading = false;
        }, error -> {
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


    public void uploadCreateGallery(String token, JSONObject requestBody) {
        String url = baseUrl+"create_collection";
        RequestQueue requestQueue = Volley.newRequestQueue(CreateGallerywithApi.this);

        JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(Request.Method.POST, url, requestBody, response -> {
            Log.d(TAG, "Response: " + response);
            try {
                boolean status = response.getBoolean("status");
                String message = response.getString("message");
                Toast.makeText(CreateGallerywithApi.this, " " + message, Toast.LENGTH_LONG).show();
                onBackPressed();
            } catch (Exception ignored) {
            }

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

