package com.yourseason;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.yourseason.apigallery.CreateGallerywithApi;
import com.yourseason.updatecollection.UpdateCollectionActivity;
import com.yourseason.video.VideoMainActivity;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;
import android.util.Log;
import android.widget.Toast;

import org.json.JSONObject;

import java.util.HashMap;

public class NativeToken extends ReactContextBaseJavaModule {
    //constructor
    public NativeToken(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    //Mandatory function getName that specifies the module name
    @Override
    public String getName() {
        return "Photopicker";
    }

    //Custom function that we are going to export to JS
    @ReactMethod
    public void openPicker(ReadableMap collection, String token, ReadableMap additionalOption) {

        ReactApplicationContext context = getReactApplicationContext();
        Intent intent = new Intent(context, PhotoMainActivity.class);
        intent.putExtra("additional", additionalOption.toString());
        intent.putExtra("token",token);
        intent.putExtra("collection",collection.toString());
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent);
    }
    @ReactMethod
    public void openCreateLibrary(ReadableMap collection, String token, ReadableMap additionalOption) {
Log.w("WT WT WT WT WT WT ",additionalOption.toString());
        ReactApplicationContext context = getReactApplicationContext();
        Intent intent = new Intent(context, CreateGallerywithApi.class);
        intent.putExtra("token",token);
        intent.putExtra("collection",collection.toString());

        intent.putExtra("data", additionalOption.toString());  // Put the data map as an extra

        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent);
    }


    @ReactMethod
    public void editCollectionGallery(String collection, String token, ReadableMap data) {
        Log.w("WT WT WT WT WT WT ",data.toString());
        ReactApplicationContext context = getReactApplicationContext();
        Intent intent = new Intent(context, UpdateCollectionActivity.class);
        intent.putExtra("token",token);
        intent.putExtra("collection",collection.toString());
        intent.putExtra("data", data.toString());

        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent);
    }

    @ReactMethod
    public void openVideoPicker(ReadableMap collection, String token, ReadableMap additionalOption) {

        ReactApplicationContext context = getReactApplicationContext();
        Intent intent = new Intent(context, VideoMainActivity.class);
        intent.putExtra("additional", additionalOption.toString());
        intent.putExtra("token",token);
        intent.putExtra("collection",collection.toString());
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent);
    }

    @ReactMethod
    public void cancelUploading(){
   try {
       Log.w("CODE IS RUNNING","SDF SDF SDF ");
       ReactApplicationContext context = getReactApplicationContext();
       GalleryPhotoActivity.stopUploadService(getReactApplicationContext());
   }catch (Exception ignored){}
    }

}