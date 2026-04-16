//
//  VideoAlbumManager.swift
//  YourSeason
//
//  Created by John on 20/03/24.
//

import Foundation
import Photos

@objc class VideoAlbumManager: NSObject {
    @objc static let shared = VideoAlbumManager()
  private let listenerAccessQueue = DispatchQueue(label: "com.yourapp.videoAlbumManager.listenerAccess")
  @objc  var isFetching = false
  var albumCount = 0{
    didSet {
        notifyProgressListeners()
    }
}
  var currentAlbumProcessing = 0{
    didSet {
        notifyProgressListeners()
    }
}
    // Ensure all properties and methods you want to access from Objective-C are marked with @objc
     private(set) var albums: [(collection: PHAssetCollection, assetsCount: Int,fetchAsset:PHFetchResult<PHAsset>?)] = [] {
        didSet {
            notifyListeners()
        }
    }
  private var progressListeners: [String: (Int, Int) -> Void] = [:]
  
    private var listeners: [String: () -> Void] = [:]
  
    @objc func fetchPhotoAlbums() {
      self.albumCount = 0
      self.currentAlbumProcessing = 0
      print(self.isFetching ,"self.isFetching ")
      if (!self.isFetching) {
        self.isFetching  = true
        print("is Fetching")
        DispatchQueue.global(qos: .userInitiated).async {
          let fetchOptions = PHFetchOptions()
          let albumTypes: [(PHAssetCollectionType, PHAssetCollectionSubtype)] = [
            (.album, .any),
            (.smartAlbum, .smartAlbumUserLibrary),
            (.smartAlbum, .smartAlbumFavorites),
            (.smartAlbum, .smartAlbumSelfPortraits),
          ]
          
          let videoSmartAlbums = PHAssetCollection.fetchAssetCollections(with: .smartAlbum, subtype: .smartAlbumVideos, options: fetchOptions)
          
          let dispatchGroup = DispatchGroup()
          var temporaryAlbums: [String: (collection: PHAssetCollection, assetsCount: Int?,fetchAsset:PHFetchResult<PHAsset>?)] = [:]
          albumTypes.forEach { type, subtype in
            let collections = PHAssetCollection.fetchAssetCollections(with: type, subtype: subtype, options: fetchOptions)
            self.albumCount += collections.count
            collections.enumerateObjects { (collection, _, _) in
              dispatchGroup.enter()
              DispatchQueue.global(qos: .userInitiated).async {
                let estimatedCount = collection.estimatedAssetCount
//                if estimatedCount != NSNotFound {
//                  DispatchQueue.main.async {
//                    temporaryAlbums[collection.localIdentifier] = (collection: collection, assetsCount: estimatedCount,fetchAsset:nil)
//                    self.currentAlbumProcessing = self.currentAlbumProcessing + 1
//                    dispatchGroup.leave()
//                  }
//                } else {
                let fetchOptions = PHFetchOptions()
                fetchOptions.predicate = NSPredicate(format: "mediaType == %d", PHAssetMediaType.video.rawValue)
                  var fetchAsset = PHAsset.fetchAssets(in: collection, options:fetchOptions)
                  let assetsCount = fetchAsset.count
                  DispatchQueue.main.async {
                    temporaryAlbums[collection.localIdentifier] = (collection: collection, assetsCount: assetsCount,fetchAsset:fetchAsset)
                    self.currentAlbumProcessing = self.currentAlbumProcessing + 1
                    dispatchGroup.leave()
//                  }
                }
              }
            }
          }
          
          dispatchGroup.notify(queue: .main) {
            self.albums = temporaryAlbums.values.compactMap { (collection, assetsCount,fetchAsset) -> (collection: PHAssetCollection, assetsCount: Int,fetchAsset: PHFetchResult<PHAsset>?)? in
              guard let count = assetsCount, count > 0 else { return nil }
              return (collection: collection, assetsCount: count, fetchAsset: fetchAsset)
            }
            self.albums.sort(by: { ($0.assetsCount ) > ($1.assetsCount ) })
            self.isFetching  = false
            self.currentAlbumProcessing = -1
          }
        }
      }
    }

    @objc func addListener(_ identifier: String, listener: @escaping () -> Void) {
      listenerAccessQueue.async {
        self.listeners[identifier] = listener
        if !self.albums.isEmpty {
            listener()
        }
      }
       
    }

    @objc func removeListener(_ identifier: String) {
      listenerAccessQueue.async {
        self.listeners.removeValue(forKey: identifier)
      }
    }

    private func notifyListeners() {
      listenerAccessQueue.async {
        self.listeners.forEach { $0.value() }
      }
    }
  
  @objc func addProgressListener(_ identifier: String, listener: @escaping (Int, Int) -> Void) {
    listenerAccessQueue.async {
      self.progressListeners[identifier] = listener
    }
     }
  @objc func removeProgressListener(_ identifier: String) {
    listenerAccessQueue.async {
      self.progressListeners.removeValue(forKey: identifier)
      
    }
    }
  
  private func notifyProgressListeners() {
    listenerAccessQueue.async {
      self.progressListeners.forEach { $0.value(self.albumCount, self.currentAlbumProcessing) }
    }
      }
  
}
