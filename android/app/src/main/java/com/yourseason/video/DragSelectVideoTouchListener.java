package com.yourseason.video;

import android.content.Context;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.recyclerview.widget.RecyclerView;

import java.util.List;
import java.util.Objects;


public class DragSelectVideoTouchListener implements RecyclerView.OnItemTouchListener {
    private static final long LONG_PRESS_THRESHOLD = 2000; // 2 seconds
    private long touchStartTime = 0;
    private boolean isLongPressDetected = false;

    public static final int AUTO_SCROLL_TRIGGER_ZONE_SIZE = 300; // Adjust this value as needed
    public static final long AUTO_SCROLL_DELAY = 5; // Delay between auto-scroll steps
    public static final int AUTO_SCROLL_SPEED = 250; // Speed of auto-scroll in pixels
    public static final int AUTO_SCROLL_EDGE_THRESHOLD = 150; // Threshold from RecyclerView edge to trigger auto-scroll

    private final RecyclerView recyclerView;
    private final SelectDselectVideo selectDselectImage;
    private final Context context;
    private final List<Video> photos;
    private final GalleryVideoAdapter adapter;
    private final Handler autoScrollHandler = new Handler();
    private boolean isDragging = false;
    private int initialPosition = RecyclerView.NO_POSITION;
    private int lastSelectedPosition = RecyclerView.NO_POSITION;

    public DragSelectVideoTouchListener(RecyclerView recyclerView, SelectDselectVideo selectDselectImage, Context context, List<Video> photos, GalleryVideoAdapter adapter) {
        this.recyclerView = recyclerView;
        this.selectDselectImage = selectDselectImage;
        this.context = context;
        this.photos = photos;
        this.adapter = adapter;
    }


    @RequiresApi(api = Build.VERSION_CODES.N)
    @Override
    public boolean onInterceptTouchEvent(@NonNull RecyclerView rv, @NonNull MotionEvent e) {
//        switch (e.getAction()) {
//            case MotionEvent.ACTION_DOWN:
//                touchStartTime = System.currentTimeMillis();
//                isLongPressDetected = false; // Reset flag for new touch
//                break;
//            case MotionEvent.ACTION_MOVE:
//                if (!isLongPressDetected && System.currentTimeMillis() - touchStartTime > LONG_PRESS_THRESHOLD) {
//                    handleActionMove(e);
//                    // Set a flag indicating that long press has been detected
//                    isLongPressDetected = true;
//                    startAutoScroll();
//                }
//                break;
//            case MotionEvent.ACTION_UP:
//                if (!isLongPressDetected && System.currentTimeMillis() - touchStartTime > LONG_PRESS_THRESHOLD) {
//                    handleActionUp();
//                    // Set a flag indicating that long press has been detected
//                    isLongPressDetected = true;
//                    stopAutoScroll();
//                }
//                break;
//        }
//
//        // Call handleActionDown(e) only if it's a long press
//        if (!isLongPressDetected && System.currentTimeMillis() - touchStartTime > LONG_PRESS_THRESHOLD) {
//            handleActionDown(e);
//        }

//todo---this code is working but here is threshold issue

        switch (e.getAction()) {
            case MotionEvent.ACTION_DOWN:
                    handleActionDown(e);
                break;
            case MotionEvent.ACTION_MOVE:
                handleActionMove(e);
                break;
            case MotionEvent.ACTION_UP:
                    handleActionUp();
                break;
        }
        return false;
    }

    @RequiresApi(api = Build.VERSION_CODES.N)
    private void handleActionDown(MotionEvent e) {
        initialPosition = getItemPositionUnder(e.getX(), e.getY());
        isDragging = true;
        handleDragSelection(initialPosition);
        if (e.getY() > recyclerView.getHeight() - AUTO_SCROLL_TRIGGER_ZONE_SIZE) {
            startAutoScroll();
        }
//        if (e.getY() > recyclerView.getHeight() - AUTO_SCROLL_TRIGGER_ZONE_SIZE && e.getEventTime() - e.getDownTime() > LONG_PRESS_THRESHOLD) {
//            startAutoScroll();
//        }
    }

    @RequiresApi(api = Build.VERSION_CODES.N)
    private void handleActionMove(MotionEvent e) {
        if (isDragging) {
            int position = getItemPositionUnder(e.getX(), e.getY());
            handleDragSelection(position);
            checkAutoScroll(e.getRawY());
        }
    }

    private void handleActionUp() {
        isDragging = false;
        lastSelectedPosition = RecyclerView.NO_POSITION;
        initialPosition = RecyclerView.NO_POSITION;
        stopAutoScroll();
    }

    @Override
    public void onTouchEvent(@NonNull RecyclerView rv, @NonNull MotionEvent e) {
        // Not needed for now
    }

    @Override
    public void onRequestDisallowInterceptTouchEvent(boolean disallowIntercept) {
        // Not needed for now
    }

    @RequiresApi(api = Build.VERSION_CODES.N)
    private void handleDragSelection(int position) {

        /*ye  check krne ke liye lgya hu ki koi image selected hai ya nahi*/
        boolean isOneSelected = adapter.photos.stream().anyMatch(Video::isSelected);

        if(isOneSelected){
            try {

                if (position != RecyclerView.NO_POSITION && position != lastSelectedPosition) {
                    int start = Math.min(initialPosition, position);
                    int end = Math.max(initialPosition, position);
                    for (int i = start; i <= end; i++) {
                        boolean shouldBeSelected = (i >= start && i <= end);
                        Video photo = photos.get(i);
                        if (photo != null && photo.isSelected() != shouldBeSelected) {
                            photo.setSelected(shouldBeSelected);
                            SelectedVideo selectedPhoto = new SelectedVideo(
                                    photo.getName(),
                                    photo.getUri(),
                                    photo.getPath(),
                                    Utils.getMimeType(context, Uri.parse(photo.getUri()))
                            );
                            if (shouldBeSelected) {
                                selectDselectImage.selectImage(selectedPhoto);
                            } else {
                                selectDselectImage.dselectImage(selectedPhoto);
                            }
                            adapter.notifyItemChanged(i);
                        }
                    }
                    lastSelectedPosition = position;
                }
            }catch (Exception e){
                Log.w("RUNNING IN CATCH", Objects.requireNonNull(e.getMessage()));
            }
        }

    }

    private void startAutoScroll() {
        autoScrollHandler.postDelayed(autoScrollRunnable, AUTO_SCROLL_DELAY);
    }

    private void stopAutoScroll() {
        autoScrollHandler.removeCallbacks(autoScrollRunnable);
    }

    private void checkAutoScroll(float rawY) {
        int scrollOffset = calculateAutoScrollOffset(rawY);
        recyclerView.scrollBy(0, scrollOffset);
    }

    private int calculateAutoScrollOffset(float rawY) {
        int recyclerViewHeight = recyclerView.getHeight();
        int triggerZoneSize = AUTO_SCROLL_EDGE_THRESHOLD;
        int scrollZoneSize = AUTO_SCROLL_EDGE_THRESHOLD * 2;
        int scrollSpeed = AUTO_SCROLL_SPEED;

        if (rawY < triggerZoneSize) {
            return -scrollSpeed;
        } else if (rawY > recyclerViewHeight - triggerZoneSize) {
            return scrollSpeed;
        } else if (rawY < scrollZoneSize) {
            return (int) (-scrollSpeed * (scrollZoneSize - rawY) / scrollZoneSize);
        } else if (rawY > recyclerViewHeight - scrollZoneSize) {
            return (int) (scrollSpeed * (rawY - (recyclerViewHeight - scrollZoneSize)) / scrollZoneSize);
        } else {
            return 0;
        }
    }

    private int getItemPositionUnder(float x, float y) {
        View child = recyclerView.findChildViewUnder(x, y);
        return child != null ? recyclerView.getChildAdapterPosition(child) : RecyclerView.NO_POSITION;
    }

    private final Runnable autoScrollRunnable = new Runnable() {
        @Override
        public void run() {
            recyclerView.scrollBy(0, AUTO_SCROLL_SPEED);
            autoScrollHandler.postDelayed(this, AUTO_SCROLL_DELAY);
        }
    };
}

