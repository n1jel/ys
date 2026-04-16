package com.yourseason.video;

import android.content.ContentResolver;
import android.content.Context;
import android.database.Cursor;
import android.graphics.Bitmap;
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
import com.yourseason.R;

import java.util.ArrayList;
import java.util.List;

public class VideoFolderAdapter extends RecyclerView.Adapter<VideoFolderAdapter.FolderViewHolder> {
    private Context context;
    private List<String> folders = new ArrayList<>();
    private final OnItemClick onItemClick;

    public interface OnItemClick {
        void onItemClick(String folderName);
    }

    public VideoFolderAdapter(Context context, OnItemClick onItemClick) {
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
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.folder_item_video, parent, false);
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
            List<Video> alldata = loadVideosForFolder(folderName, context);

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

    private List<Video> loadVideosForFolder(String folderName, Context context) {
        ContentResolver resolver = context.getContentResolver();
        List<Video> videos = new ArrayList<>();
        String[] projection = {
                MediaStore.Video.Media._ID,
                MediaStore.Video.Media.DISPLAY_NAME,
                MediaStore.Video.Media.DATA
        };
        String selection =
                MediaStore.Video.Media.BUCKET_DISPLAY_NAME + " = ? AND ("
                        + MediaStore.Video.Media.MIME_TYPE + " = ? OR "
                        + MediaStore.Video.Media.MIME_TYPE + " = ? OR "
                        + MediaStore.Video.Media.MIME_TYPE + " = ?)";
        String[] selectionArgs = {folderName, "video/mp4", "video/quicktime", "video/mpeg"};
        String sortOrder = MediaStore.Video.Media.DATE_ADDED + " DESC";

        try (Cursor cursor = resolver.query(
                MediaStore.Video.Media.EXTERNAL_CONTENT_URI,
                projection,
                selection,
                selectionArgs,
                sortOrder
        )) {
            if (cursor != null) {
                int idColumn = cursor.getColumnIndexOrThrow(MediaStore.Video.Media._ID);
                int nameColumn = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.DISPLAY_NAME);
                int pathColumn = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.DATA);
                while (cursor.moveToNext()) {
                    long id = cursor.getLong(idColumn);
                    String name = cursor.getString(nameColumn);
                    String path = cursor.getString(pathColumn);
                    String uri = Uri.withAppendedPath(MediaStore.Video.Media.EXTERNAL_CONTENT_URI, String.valueOf(id)).toString();

                    // Fetch thumbnail
                    Bitmap thumbnail = MediaStore.Video.Thumbnails.getThumbnail(
                            resolver,
                            id,
                            MediaStore.Video.Thumbnails.MINI_KIND,
                            null
                    );

                    videos.add(new Video(uri, name, path, thumbnail));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return videos;
    }
}
