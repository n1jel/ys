package com.yourseason.video;

import android.annotation.SuppressLint;
import android.net.Uri;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.VideoView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.yourseason.R;

import java.util.List;


public class GalleryVideoAdapter extends RecyclerView.Adapter<GalleryVideoAdapter.PhotoViewHolder> {
    private int lastSelectedPosition = -1; // Track the last selected position
    private static final long DOUBLE_CLICK_TIME_DELTA = 200; // Maximum time difference in milliseconds between two clicks to be considered a double-click

    final List<Video> photos;
    private final SelectDselectVideo selseImageEvent;
    private long lastClickTime = 0; // Timestamp of the last click
    public GalleryVideoAdapter(List<Video> photos, SelectDselectVideo selseImageEvent) {
        this.photos = photos;
        this.selseImageEvent = selseImageEvent;
    }

    public static class PhotoViewHolder extends RecyclerView.ViewHolder {
        ImageView photoImageView;
        ImageView tickImageView;
        VideoView VideoView;

        public PhotoViewHolder(@NonNull View itemView) {
            super(itemView);
            photoImageView = itemView.findViewById(R.id.photoImageView);
            tickImageView = itemView.findViewById(R.id.tickImageView);
            VideoView=itemView.findViewById(R.id.VideoView);
        }
    }

    @NonNull
    @Override
    public PhotoViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.video_item, parent, false);
        return new PhotoViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull PhotoViewHolder holder, @SuppressLint("RecyclerView") int position) {
        Glide.with(holder.itemView)
                .load(Uri.parse(photos.get(position).getUri()))
                .into(holder.photoImageView);



        holder.itemView.setOnLongClickListener(v -> {
            Log.d("Long Click", "Long click detected on position: " + position);
           handleSelection(holder, position);
            return true;
        });

        holder.itemView.setOnClickListener(v -> {

            long clickTime = System.currentTimeMillis();
            if (clickTime - lastClickTime < DOUBLE_CLICK_TIME_DELTA) {

                if(lastSelectedPosition==position){
                    holder.VideoView.setVisibility(View.GONE);
                    holder.photoImageView.setVisibility(View.VISIBLE);
                    holder.VideoView.stopPlayback();
                }else{
                    lastSelectedPosition=position;
                }


                notifyDataSetChanged();
            }
            lastClickTime = clickTime;
        });


        if (photos.get(position).isSelected()) {
            holder.tickImageView.setVisibility(View.VISIBLE);
        } else {
            holder.tickImageView.setVisibility(View.GONE);
        }
        // Check if this item is the last selected one
//        if (position == lastSelectedPosition) {
//            holder.VideoView.setVisibility(View.VISIBLE);
//            holder.photoImageView.setVisibility(View.GONE);
//            holder.VideoView.setVideoPath(photos.get(position).getPath());
//            holder.VideoView.start();
//            // Start playing video here if needed
//        } else {
//            holder.VideoView.setVisibility(View.GONE);
//            holder.photoImageView.setVisibility(View.VISIBLE);
//            holder.VideoView.stopPlayback();
//        }
        if (position == lastSelectedPosition) {
            // If the current item is the last selected one
            if (holder.VideoView.getVisibility() != View.VISIBLE) {
                // If VideoView is not visible, make it visible with animation
                holder.photoImageView.animate().alpha(0f).setDuration(300).withEndAction(() -> {
                    holder.photoImageView.setVisibility(View.GONE);
                    holder.VideoView.setVisibility(View.VISIBLE);
                    holder.VideoView.setAlpha(0f);
                    holder.VideoView.animate().alpha(1f).setDuration(100).start();
                }).start();
            } else {
                // If VideoView is already visible, do nothing
            }
            holder.VideoView.setVideoPath(photos.get(position).getPath());
            holder.VideoView.start();
        } else {
            // If the current item is not the last selected one
            if (holder.photoImageView.getVisibility() != View.VISIBLE) {
                // If photoImageView is not visible, make it visible with animation
                holder.VideoView.animate().alpha(0f).setDuration(300).withEndAction(() -> {
                    holder.VideoView.setVisibility(View.GONE);
                    holder.photoImageView.setVisibility(View.VISIBLE);
                    holder.photoImageView.setAlpha(0f);
                    holder.photoImageView.animate().alpha(1f).setDuration(100).start();
                }).start();
            } else {
                // If photoImageView is already visible, do nothing
            }
            holder.VideoView.stopPlayback();
        }
    }


    public void handleSelection(PhotoViewHolder holder, int position) {
        photos.get(position).setSelected(!photos.get(position).isSelected());
        SelectedVideo photo = new SelectedVideo(
                photos.get(position).getName(),
                photos.get(position).getUri(),
                photos.get(position).getPath(),
                Utils.getMimeType(
                        holder.itemView.getContext(), Uri.parse(photos.get(position).getUri())

                )
        );
        if (photos.get(position).isSelected()) {
            selseImageEvent.selectImage(photo);
        } else {
            Log.w("FROM HERE", "SDF SDF ");
            selseImageEvent.dselectImage(photo);
        }
        notifyItemChanged(position);
    }

    @Override
    public int getItemCount() {
        return photos.size();
    }
}

interface SelectDselectVideo {
    void selectImage(SelectedVideo photo);

    void dselectImage(SelectedVideo photo);

    void onLongClick(SelectedVideo photo, int position);
}
