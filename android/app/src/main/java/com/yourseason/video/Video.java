package com.yourseason.video;

import android.graphics.Bitmap;

class Video {
    private String uri;
    private String name;
    private String path;
    private boolean isSelected;

    private Bitmap thumbnail;

    public Video(String uri, String name, String path,Bitmap thumbnail) {
        this.uri = uri;
        this.name = name;
        this.path = path;
        this.isSelected = false;
        this.thumbnail=thumbnail;
    }

    public Bitmap getThumbnail() {
        return thumbnail;
    }

    public void setThumbnail(Bitmap thumbnail) {
        this.thumbnail = thumbnail;
    }

    public String getUri() {
        return uri;
    }

    public void setUri(String uri) {
        this.uri = uri;
    }


    public String getName() {
        int lastDotIndex = name.lastIndexOf('.');
        if (lastDotIndex != -1) {
            return name.substring(0, lastDotIndex);
        } else {
            return name;
        }
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public boolean isSelected() {
        return isSelected;
    }

    public void setSelected(boolean selected) {
        isSelected = selected;
    }
}
