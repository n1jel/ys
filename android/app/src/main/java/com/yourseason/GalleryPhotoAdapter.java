package com.yourseason;

import android.annotation.SuppressLint;
import android.content.ContentResolver;
import android.content.Context;
import android.net.Uri;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.MimeTypeMap;
import android.widget.ImageView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;

import java.util.List;
import java.util.Locale;

public class GalleryPhotoAdapter extends RecyclerView.Adapter<GalleryPhotoAdapter.PhotoViewHolder> {

    final List<Photo> photos;
    private final SelectDselectImage selseImageEvent;

    public GalleryPhotoAdapter(List<Photo> photos, SelectDselectImage selseImageEvent) {
        this.photos = photos;
        this.selseImageEvent = selseImageEvent;
    }

    public static class PhotoViewHolder extends RecyclerView.ViewHolder {
        ImageView photoImageView;
        ImageView tickImageView;

        public PhotoViewHolder(@NonNull View itemView) {
            super(itemView);
            photoImageView = itemView.findViewById(R.id.photoImageView);
            tickImageView = itemView.findViewById(R.id.tickImageView);
        }
    }

    @NonNull
    @Override
    public PhotoViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.photo_item, parent, false);
        return new PhotoViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull PhotoViewHolder holder, @SuppressLint("RecyclerView") int position) {
        Glide.with(holder.itemView)
                .load(Uri.parse(photos.get(position).getUri()))
                .into(holder.photoImageView);

//        holder.itemView.setOnLongClickListener(new View.OnLongClickListener() {
//            @Override
//            public boolean onLongClick(View v) {
//                Log.w("CODE IS WO","CODELFJDKLFJKLDFJKLDFKLDSKLF");
//                handleSelection(holder, position);
//                return true;
//            }
//        });
        holder.itemView.setOnLongClickListener(v -> {
            Log.d("Long Click", "Long click detected on position: " + position);
            handleSelection(holder, position);
            return true;
        });

        if (photos.get(position).isSelected()) {
            holder.tickImageView.setVisibility(View.VISIBLE);
        } else {
            holder.tickImageView.setVisibility(View.GONE);
        }
    }

    public void handleSelection(PhotoViewHolder holder, int position) {
        photos.get(position).setSelected(!photos.get(position).isSelected());
        SelectedPhoto photo = new SelectedPhoto(
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

interface SelectDselectImage {
    void selectImage(SelectedPhoto photo);

    void dselectImage(SelectedPhoto photo);

    void onLongClick(SelectedPhoto photo, int position);
}

