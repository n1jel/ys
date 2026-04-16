package com.yourseason;

class Photo {
    private String uri;
    private String name;
    private String path;
    private boolean isSelected;

    public Photo(String uri, String name, String path) {
        this.uri = uri;
        this.name = name;
        this.path = path;
        this.isSelected = false;
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
