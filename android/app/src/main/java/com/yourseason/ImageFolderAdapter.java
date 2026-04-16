package com.yourseason;

import android.content.ContentResolver;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.provider.MediaStore;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;

import java.util.ArrayList;
import java.util.List;

public class ImageFolderAdapter extends RecyclerView.Adapter<ImageFolderAdapter.FolderViewHolder> {
    private Context context;
    private List<String> folders = new ArrayList<>();
    private final OnItemClick onItemClick;

    public interface OnItemClick {
        void onItemClick(String folderName);
    }

    public ImageFolderAdapter(Context context, OnItemClick onItemClick) {
        this.context = context;
        this.onItemClick = onItemClick;
    }

    public void setFolders(List<String> folders) {
        this.folders = folders;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public FolderViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.folder_item, parent, false);
        return new FolderViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull FolderViewHolder holder, int position) {
        String folderName = folders.get(position);
        holder.bind(folderName);
    }

    @Override
    public int getItemCount() {
        return folders.size();
    }

    public class FolderViewHolder extends RecyclerView.ViewHolder {
        private TextView folderNameTextView;
        private TextView imageCountTextView;
        private ImageView firstImageOfFolder;

        public FolderViewHolder(View itemView) {
            super(itemView);
            folderNameTextView = itemView.findViewById(R.id.folderNameTextView);
            imageCountTextView = itemView.findViewById(R.id.imageCountTextView);
            firstImageOfFolder = itemView.findViewById(R.id.firstImageView);
        }

        public void bind(final String folderName) {
            folderNameTextView.setText(folderName);
            List<Photo> alldata = loadPhotosForFolder(folderName, context);

            itemView.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    onItemClick.onItemClick(folderName);
                }
            });

            if (!alldata.isEmpty()) {
                imageCountTextView.setText(String.valueOf(alldata.size()));
                Glide.with(itemView)
                        .load(Uri.parse(alldata.get(0).getUri()))
                        // Or any other transformations you want
                        .into(firstImageOfFolder);
            }
        }
    }

    private List<Photo> loadPhotosForFolder(String folderName, Context context) {
        ContentResolver resolver = context.getContentResolver();
        List<Photo> photos = new ArrayList<>();
        String[] projection = {
                MediaStore.Images.Media._ID,
                MediaStore.Images.Media.DISPLAY_NAME,
                MediaStore.Images.Media.DATA
        };
        String selection =
                MediaStore.Images.Media.BUCKET_DISPLAY_NAME + " = ? AND ("
                        + MediaStore.Images.Media.MIME_TYPE + " = ? OR "
                        + MediaStore.Images.Media.MIME_TYPE + " = ?)";
        String[] selectionArgs = {folderName, "image/jpeg", "image/png"};
        String sortOrder = MediaStore.Images.Media.DATE_ADDED + " DESC";

        try (Cursor cursor = resolver.query(
                MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                projection,
                selection,
                selectionArgs,
                sortOrder
        )) {
            if (cursor != null) {
                int idColumn = cursor.getColumnIndexOrThrow(MediaStore.Images.Media._ID);
                int nameColumn = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DISPLAY_NAME);
                int pathColumn = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATA);
                while (cursor.moveToNext()) {
                    long id = cursor.getLong(idColumn);
                    String name = cursor.getString(nameColumn);
                    String path = cursor.getString(pathColumn);
                    String uri = Uri.withAppendedPath(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, String.valueOf(id)).toString();
                    photos.add(new Photo(uri, name, path));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return photos;
    }
}


// class Photo {
//    private String uri;
//    private String name;
//    private String path;
//    private boolean isSelected;
//
//    public Photo(String uri, String name, String path) {
//        this.uri = uri;
//        this.name = name;
//        this.path = path;
//        this.isSelected = false;
//    }
//
//    public String getUri() {
//        return uri;
//    }
//
//    public void setUri(String uri) {
//        this.uri = uri;
//    }
//
//    public String getName() {
//        return name;
//    }
//
//    public void setName(String name) {
//        this.name = name;
//    }
//
//    public String getPath() {
//        return path;
//    }
//
//    public void setPath(String path) {
//        this.path = path;
//    }
//
//    public boolean isSelected() {
//        return isSelected;
//    }
//
//    public void setSelected(boolean selected) {
//        isSelected = selected;
//    }
//}

// class SelectedPhoto {
//    private String name;
//    private String uri;
//    private String path;
//    private String mimetype;
//
//    public SelectedPhoto(String name, String uri, String path, String mimetype) {
//        this.name = name;
//        this.uri = uri;
//        this.path = path;
//        this.mimetype = mimetype;
//    }
//
//    public String getName() {
//        return name;
//    }
//
//    public void setName(String name) {
//        this.name = name;
//    }
//
//    public String getUri() {
//        return uri;
//    }
//
//    public void setUri(String uri) {
//        this.uri = uri;
//    }
//
//    public String getPath() {
//        return path;
//    }
//
//    public void setPath(String path) {
//        this.path = path;
//    }
//
//    public String getMimetype() {
//        return mimetype;
//    }
//
//    public void setMimetype(String mimetype) {
//        this.mimetype = mimetype;
//    }
//}
