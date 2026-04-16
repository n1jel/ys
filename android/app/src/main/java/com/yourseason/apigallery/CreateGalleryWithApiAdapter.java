package com.yourseason.apigallery;

import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.yourseason.R;

import java.util.List;

public class CreateGalleryWithApiAdapter extends RecyclerView.Adapter<CreateGalleryWithApiAdapter.CreateGalleryViewHolder> {
    final List<CreateGalleryData.Datum> photos;

    private final SelectDselectImageWithApi selseImageEvent;

    public CreateGalleryWithApiAdapter(List<CreateGalleryData.Datum> photos, SelectDselectImageWithApi selseImageEvent) {
        this.photos = photos;
        this.selseImageEvent = selseImageEvent;
    }



    @NonNull
    @Override
    public CreateGalleryViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.create_gallery_photo_item, parent, false);
        return new CreateGalleryViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull CreateGalleryViewHolder holder, int position) {
        //fileurl https://d1ibgiujerad7s.cloudfront.net/
        Glide.with(holder.itemView)
                .load("https://d1ibgiujerad7s.cloudfront.net/"+photos.get(position).getMediaName())
                .into(holder.photoImageView);

        if (photos.get(position).isSelected()) {
            holder.tickImageView.setVisibility(View.VISIBLE);
        } else {
            holder.tickImageView.setVisibility(View.GONE);
        }

        holder.itemView.setOnLongClickListener(v -> {
            Log.d("Long Click", "Long click detected on position: " + position);
            handleSelection(holder, position);
            return true;
        });
    }

    @Override
    public int getItemCount() {
        return photos.size();
    }

    public void handleSelection(CreateGalleryViewHolder holder, int position) {
        photos.get(position).setSelected(!photos.get(position).isSelected());
        if (photos.get(position).isSelected()) {
            selseImageEvent.selectImage(photos.get(position));
        } else {
            Log.w("FROM HERE", "SDF SDF ");
            selseImageEvent.dselectImage(photos.get(position));
        }
        notifyItemChanged(position);
    }


    public static class CreateGalleryViewHolder extends RecyclerView.ViewHolder {
        ImageView photoImageView;
        ImageView tickImageView;

        public CreateGalleryViewHolder(@NonNull View itemView) {
            super(itemView);
            photoImageView = itemView.findViewById(R.id.photoImageView);
            tickImageView = itemView.findViewById(R.id.tickImageView);
        }
    }

}

interface SelectDselectImageWithApi {
    void selectImage(CreateGalleryData.Datum photo);

    void dselectImage(CreateGalleryData.Datum photo);

    void onLongClick(CreateGalleryData.Datum photo, int position);
}
