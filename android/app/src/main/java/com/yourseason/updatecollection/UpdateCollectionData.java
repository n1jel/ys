package com.yourseason.updatecollection;

import com.google.gson.annotations.Expose;
import com.google.gson.annotations.SerializedName;

import java.util.List;

public class UpdateCollectionData {

    @SerializedName("status")
    @Expose
    private Boolean status;
    @SerializedName("message")
    @Expose
    private String message;
    @SerializedName("data")
    @Expose
    private List<UpdateCollectionDatum> data;
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

    public List<UpdateCollectionDatum> getData() {
        return data;
    }

    public void setData(List<UpdateCollectionDatum> data) {
        this.data = data;
    }

    public Other getOther() {
        return other;
    }

    public void setOther(Other other) {
        this.other = other;
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

    public class UpdateCollectionDatum {

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
        @SerializedName("is_selected")
        @Expose
        private Integer isalreadySelected;

        private boolean isSelected;

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

        public Integer getalreadyIsSelected() {
            return isalreadySelected;
        }

        public void setalreadyIsSelected(Integer isSelected) {
            this.isalreadySelected = isSelected;
        }

        public boolean isSelected() {
            return isSelected;
        }

        public void setSelected(boolean selected) {
            isSelected = selected;
        }

    }
}