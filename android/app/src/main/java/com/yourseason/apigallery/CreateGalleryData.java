package com.yourseason.apigallery;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

import java.util.List;

public class CreateGalleryData {

    @SerializedName("status")
    @Expose
    private Boolean status;
    @SerializedName("message")
    @Expose
    private String message;
    @SerializedName("data")
    @Expose
    private List<Datum> data;
    @SerializedName("other")
    @Expose
    private Other other;

    public Boolean getStatus() {
        return status;
    }

    public void setStatus(Boolean status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<Datum> getData() {
        return data;
    }

    public void setData(List<Datum> data) {
        this.data = data;
    }

    public Other getOther() {
        return other;
    }

    public void setOther(Other other) {
        this.other = other;
    }


    public class Datum {

        @SerializedName("_id")
        @Expose
        private String id;
        @SerializedName("stylist_id")
        @Expose
        private String stylistId;
        @SerializedName("media_name")
        @Expose
        private String mediaName;
        @SerializedName("media_type")
        @Expose
        private String mediaType;
        @SerializedName("thumbnail")
        @Expose
        private String thumbnail;
        @SerializedName("is_cover_image")
        @Expose
        private Integer isCoverImage;
        @SerializedName("type")
        @Expose
        private String type;
        @SerializedName("saveToLibrary")
        @Expose
        private Integer saveToLibrary;
        @SerializedName("status")
        @Expose
        private Integer status;
        @SerializedName("created_at")
        @Expose
        private String createdAt;
        @SerializedName("updated_at")
        @Expose
        private String updatedAt;

        private boolean isSelected;
        @SerializedName("__v")
        @Expose
        private Integer v;

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getStylistId() {
            return stylistId;
        }

        public void setStylistId(String stylistId) {
            this.stylistId = stylistId;
        }

        public String getMediaName() {
            return mediaName;
        }

        public void setMediaName(String mediaName) {
            this.mediaName = mediaName;
        }

        public String getMediaType() {
            return mediaType;
        }

        public void setMediaType(String mediaType) {
            this.mediaType = mediaType;
        }

        public String getThumbnail() {
            return thumbnail;
        }

        public void setThumbnail(String thumbnail) {
            this.thumbnail = thumbnail;
        }

        public Integer getIsCoverImage() {
            return isCoverImage;
        }

        public void setIsCoverImage(Integer isCoverImage) {
            this.isCoverImage = isCoverImage;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public Integer getSaveToLibrary() {
            return saveToLibrary;
        }

        public void setSaveToLibrary(Integer saveToLibrary) {
            this.saveToLibrary = saveToLibrary;
        }

        public Integer getStatus() {
            return status;
        }

        public void setStatus(Integer status) {
            this.status = status;
        }

        public String getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(String createdAt) {
            this.createdAt = createdAt;
        }

        public String getUpdatedAt() {
            return updatedAt;
        }

        public void setUpdatedAt(String updatedAt) {
            this.updatedAt = updatedAt;
        }

        public Integer getV() {
            return v;
        }

        public void setV(Integer v) {
            this.v = v;
        }

        public boolean isSelected() {
            return isSelected;
        }

        public void setSelected(boolean selected) {
            isSelected = selected;
        }

    }

    public class Other {

        @SerializedName("total_entries")
        @Expose
        private Integer totalEntries;
        @SerializedName("total_page")
        @Expose
        private Integer totalPage;
        @SerializedName("current_page")
        @Expose
        private Integer currentPage;

        public Integer getTotalEntries() {
            return totalEntries;
        }

        public void setTotalEntries(Integer totalEntries) {
            this.totalEntries = totalEntries;
        }

        public Integer getTotalPage() {
            return totalPage;
        }

        public void setTotalPage(Integer totalPage) {
            this.totalPage = totalPage;
        }

        public Integer getCurrentPage() {
            return currentPage;
        }

        public void setCurrentPage(Integer currentPage) {
            this.currentPage = currentPage;
        }

    }
}
