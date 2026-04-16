package com.yourseason;

import java.io.Serializable;

public class SelectedPhoto implements Serializable {
    private String name;
  private String uri;
    private String originalUri;
    private String type;

    public SelectedPhoto(String name, String uri, String originalUri, String type) {
        this.name = name;
       this.uri = uri;
        this.originalUri = originalUri;
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

   public String getUri() {
       return uri;
   }

   public void setUri(String uri) {
       this.uri = uri;
   }

    public String getPath() {
        return originalUri;
    }

    public void setPath(String path) {
        this.originalUri = path;
    }

    public String getMimetype() {
        return type;
    }

    public void setMimetype(String mimetype) {
        this.type = mimetype;
    }
}