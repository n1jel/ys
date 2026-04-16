package com.yourseason.updatecollection;

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

public class UpdateCollectionAdapter extends RecyclerView.Adapter<UpdateCollectionAdapter.CreateGalleryViewHolder> {
    final List<UpdateCollectionData.UpdateCollectionDatum> photos;

    private final UpdateCollectionSelectDselectImage selseImageEvent;

    public UpdateCollectionAdapter(List<UpdateCollectionData.UpdateCollectionDatum> photos, UpdateCollectionSelectDselectImage selseImageEvent) {
        this.photos = photos;
        this.selseImageEvent = selseImageEvent;
    }


    @NonNull
    @Override
    public CreateGalleryViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.update_collection_photo_item, parent, false);
        return new CreateGalleryViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull CreateGalleryViewHolder holder, int position) {
        //fileurl https://d1ibgiujerad7s.cloudfront.net/
        Glide.with(holder.itemView)
                .load("https://d1ibgiujerad7s.cloudfront.net/" + photos.get(position).getMediaName())
                .into(holder.photoImageView);

        if (photos.get(position).isSelected()) {
            holder.tickImageView.setVisibility(View.VISIBLE);
        } else {
            holder.tickImageView.setVisibility(View.GONE);
        }

        /*todo--ye already selected ke liye hai*/
        if (photos.get(position).getalreadyIsSelected() == 1) {
            holder.alreadySelectedImageView.setVisibility(View.VISIBLE);
        } else {
            holder.alreadySelectedImageView.setVisibility(View.GONE);
        }


        if (photos.get(position).getalreadyIsSelected() == 0) {
            holder.itemView.setOnLongClickListener(v -> {
                Log.d("Long Click", "Long click detected on position: " + position);
                if (photos.get(position).getalreadyIsSelected() == 0) {
                    handleSelection(holder, position);
                }
                return true;
            });
        }

    }

    @Override
    public int getItemCount() {
        return photos.size();
    }

    public void handleSelection(CreateGalleryViewHolder holder, int position) {
        if (photos.get(position).getalreadyIsSelected() == 0) {
            photos.get(position).setSelected(!photos.get(position).isSelected());
            if (photos.get(position).isSelected()) {
                selseImageEvent.selectImage(photos.get(position));
            } else {
                Log.w("FROM HERE", "SDF SDF ");
                selseImageEvent.dselectImage(photos.get(position));
            }
        }

        notifyItemChanged(position);
    }


    public static class CreateGalleryViewHolder extends RecyclerView.ViewHolder {
        ImageView photoImageView;
        ImageView tickImageView, alreadySelectedImageView;

        public CreateGalleryViewHolder(@NonNull View itemView) {
            super(itemView);
            photoImageView = itemView.findViewById(R.id.photoImageView);
            tickImageView = itemView.findViewById(R.id.tickImageView);
            alreadySelectedImageView = itemView.findViewById(R.id.selectImageView);
        }
    }

}

interface UpdateCollectionSelectDselectImage {
    void selectImage(UpdateCollectionData.UpdateCollectionDatum photo);

    void dselectImage(UpdateCollectionData.UpdateCollectionDatum photo);

    void onLongClick(UpdateCollectionData.UpdateCollectionDatum photo, int position);
}
