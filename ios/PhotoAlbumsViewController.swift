////
////  PhotoAlbumsViewController.swift
////  customGalleryDemo
////
////  Created by John on 30/01/24.
////
//
//import UIKit
//import Photos
//class PhotoAlbumsViewController: UIViewController, UITableViewDataSource, UITableViewDelegate {
//
//    @IBOutlet weak var albumsTableView: UITableView!
//
//    var albums: [PHAssetCollection] = []
//
//    override func viewDidLoad() {
//        super.viewDidLoad()
//
//        albumsTableView.dataSource = self
//        albumsTableView.delegate = self
//
//        fetchPhotoAlbums()
//    }
//
//  @IBAction func actionBack(_ sender: UIButton) {
//    NotificationCenter.default.post(name: NSNotification.Name("ImagesUpdated"), object: self, userInfo: ["originalImages": [],"smallImages":[]])
//    self.dismiss(animated: true)
//  }
//  // MARK: - Fetching Photo Albums
//
//    func fetchPhotoAlbums() {
//        let fetchOptions = PHFetchOptions()
//        let userAlbums = PHAssetCollection.fetchAssetCollections(with: .album, subtype: .any, options: fetchOptions)
//        let userAlbums2 = PHAssetCollection.fetchAssetCollections(with: .smartAlbum, subtype: .smartAlbumUserLibrary, options: fetchOptions)
//      let userAlbums3 = PHAssetCollection.fetchAssetCollections(with: .smartAlbum, subtype: .smartAlbumSelfPortraits, options: fetchOptions)
//
//      let favourites = PHAssetCollection.fetchAssetCollections(with: .smartAlbum, subtype: .smartAlbumFavorites, options: fetchOptions)
//        print("album3",userAlbums.count)
//
//
//
//
//      [userAlbums2,userAlbums,favourites,userAlbums3].forEach { collections in
//
//        if collections == userAlbums{
//          let fetchOptions = PHFetchOptions()
//          let userAlbums = PHAssetCollection.fetchAssetCollections(with: .album, subtype: .any, options: fetchOptions)
//
//          var albumsAndLatestAssetDates: [(album: PHAssetCollection, latestAssetDate: Date)] = []
//
//          userAlbums.enumerateObjects { (collection, _, _) in
//            let assetsFetchOptions = PHFetchOptions()
//            assetsFetchOptions.predicate = NSPredicate(format: "mediaType == %d", PHAssetMediaType.image.rawValue)
//            assetsFetchOptions.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
//            let assets = PHAsset.fetchAssets(in: collection, options: assetsFetchOptions)
//            if let latestAsset = assets.firstObject, let creationDate = latestAsset.creationDate {
//              // Store the album along with the date of the latest asset
//              albumsAndLatestAssetDates.append((album: collection, latestAssetDate: creationDate))
//            }
//          }
//
//          // Sort the albums by the date of the latest asset
//          let sortedAlbums = albumsAndLatestAssetDates.sorted { $0.latestAssetDate > $1.latestAssetDate }.map { $0.album }
//
//          // Append the sorted albums to self.albums
//          sortedAlbums.forEach { sortedAlbum in
//            self.albums.append(sortedAlbum)
//          }
//        }
//
//        else{
//
//          collections.enumerateObjects { (collection, index, stop) in
//            // Fetch assets from the current collection
//            let assetsFetchOptions = PHFetchOptions()
//            assetsFetchOptions.predicate = NSPredicate(format: "mediaType == %d", PHAssetMediaType.image.rawValue)
//            //               assetsFetchOptions.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: true)]
//            let assets = PHAsset.fetchAssets(in: collection, options: assetsFetchOptions)
//            // Check if the collection contains any photos
//            if assets.count > 0 {
//              // Append the album since it contains photos
//              print(collection.localizedTitle ?? "Unknown album")
//              self.albums.append(collection)
//            }
//          }
//        }
//      }
////        userAlbums.enumerateObjects { (album, index, _) in
////            print(album)
////            self.albums.append(album)
////        }
////        userAlbums2.enumerateObjects { (album, index, _) in
////            print(album)
////            self.albums.append(album)
////        }
//
//        albumsTableView.reloadData()
//    }
//
//
//
//    // MARK: - UITableViewDataSource
//
//    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
//        return albums.count
//    }
//
//    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
//        let cell = tableView.dequeueReusableCell(withIdentifier: "AlbumCell", for: indexPath) as! AlbumCell
//        let album = albums[indexPath.row]
//
//        if let coverPhoto = fetchCoverPhotoForAlbum(album) {
//            cell.imageView1.image = coverPhoto
//               }
//
//        if let title = album.localizedTitle{
//            cell.lblTExt?.text = "\(title)"
//        }
//
//        cell.lblCount.text = String(fetchAssetCountInAlbum(album))
//
//
//        return cell
//    }
//
//    // MARK: - UITableViewDelegate
//
//    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
//        let selectedAlbum = albums[indexPath.row]
////        let vc = self.storyboard?.instantiateViewController(withIdentifier: "CollectionViewController") as! CollectionViewController
////
////        vc.modalPresentationStyle = .fullScreen
////        vc.modalTransitionStyle = .coverVertical
////        vc.selectedAlbum = selectedAlbum
////        self.present(vc, animated: true)
//
//        self.dismiss(animated: true) {
//            if let keyWindowScene = UIApplication.shared.connectedScenes
//                .filter({ $0.activationState == .foregroundActive })
//                .compactMap({ $0 as? UIWindowScene })
//                .first {
//
//
//
//
//                let storyboard = UIStoryboard(name: "Main2", bundle: nil)
//
//
//
//
//                if let firstViewController = storyboard.instantiateViewController(withIdentifier: "CollectionViewController") as? CollectionViewController {
//                    firstViewController.modalPresentationStyle = .fullScreen // Set full
//                           firstViewController.modalTransitionStyle = .coverVertical //
//                    firstViewController.selectedAlbum = selectedAlbum
//                    let rootViewController = keyWindowScene.windows.first?.rootViewController
//
//                    rootViewController?.present(firstViewController, animated: true, completion: nil)
//                }
//            }
//        }
//
//
//
//
//
//    }
//
//
//    func fetchAssetCountInAlbum(_ album: PHAssetCollection) -> Int {
//           let albumAssets = PHAsset.fetchAssets(in: album, options: nil)
//      var assetsTemp:[PHAsset] = []
//      albumAssets.enumerateObjects { (asset,index , _) in
//        assetsTemp.append(asset)
//      }
//      return assetsTemp.filter{$0.mediaType != .video}.count
//       }
//
//    func fetchCoverPhotoForAlbum(_ album: PHAssetCollection) -> UIImage? {
//
//      let fetchOptions = PHFetchOptions()
//         fetchOptions.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
//
//
//        let albumAssets = PHAsset.fetchAssets(in: album, options: fetchOptions)
//
//        guard let firstAsset = albumAssets.firstObject else {
//            return nil
//        }
//
//        let imageManager = PHImageManager.default()
//        var coverPhoto: UIImage?
//
//        let requestOptions = PHImageRequestOptions()
//        requestOptions.isSynchronous = true
//      requestOptions.deliveryMode = .highQualityFormat
//        imageManager.requestImage(for: firstAsset, targetSize: CGSize(width: 70, height: 70), contentMode: .aspectFill, options: requestOptions) { (image, _) in
//            coverPhoto = image
//        }
//
//        return coverPhoto
//    }
//}


import UIKit
import Photos

class PhotoAlbumsViewController: UIViewController {
  
  @IBOutlet weak var albumsTableView: UITableView!
  @IBOutlet weak var textIndicator: UILabel!
  
  @IBOutlet weak var progressView: UIProgressView!
  var albums: [(collection: PHAssetCollection, assetsCount: Int?,fetchAsset:PHFetchResult<PHAsset>?)] = []
  
  // Image Cache
  private var imageCache = NSCache<NSString, UIImage>()
  
  var pickerParameters: PickerParameters?
  private var albumCounts = [String: Int]()
  override func viewDidLoad() {
    super.viewDidLoad()
    setupTableView()
    self.textIndicator.reactZIndex = 2
    //    fetchPhotoAlbums()
    //    PhotoAlbumManager.shared.fetchPhotoAlbums()
    PhotoAlbumManager.shared.addListener("PhotoAlbumsViewController") {
      self.updateUI()
    }
    
    PhotoAlbumManager.shared.addProgressListener("Progress") { [weak self] (total, current) in
      DispatchQueue.main.async {
        self?.updateProgress(currentIndex: current, totalCount: total)
      }
    }
    
  }
  
  deinit{
    PhotoAlbumManager.shared.removeListener("PhotoAlbumsViewController")
    PhotoAlbumManager.shared.removeProgressListener("Progress")
  }
  
  private func setupTableView() {
    albumsTableView.dataSource = self
    albumsTableView.delegate = self
  }
  
  @IBAction func actionBack(_ sender: UIButton) {
    NotificationCenter.default.post(name: Notification.Name("ImagesUpdated"), object: nil, userInfo: ["originalImages": [], "smallImages": []])
    dismiss(animated: true)
  }
  
  func updateUI(){
    
    DispatchQueue.main.async {
      // Update your UI with the albums
      self.albums = PhotoAlbumManager.shared.albums
      print(PhotoAlbumManager.shared.currentAlbumProcessing,"inProcessing")
      self.albumsTableView.reloadData()
      self.progressView.isHidden = true
      self.textIndicator.isHidden = true
    }
    
  }
  
  func updateProgress(currentIndex: Int, totalCount: Int) {
    print("Total count: \(totalCount)")
    print("Current index: \(currentIndex)")
    
    guard totalCount > 0, currentIndex <= totalCount else {
      print("Invalid totalCount or currentIndex")
      return
    }
    
    let progress: Float
    if totalCount == 1 {
      progress = currentIndex == 0 ? 1.0 : 0.0 // Complete if only one and processing
    } else {
      progress = Float(currentIndex) / Float(totalCount - 1)
    }
    
    progressView.setProgress(progress, animated: true)
  }
  
  //  private func fetchPhotoAlbums() {
  //
  //    DispatchQueue.global(qos: .userInitiated).async {
  //      let fetchOptions = PHFetchOptions()
  //      let albumTypes: [(PHAssetCollectionType, PHAssetCollectionSubtype)] = [
  //        (.album, .any),
  //        (.smartAlbum, .smartAlbumUserLibrary),
  //        (.smartAlbum, .smartAlbumFavorites),
  //        (.smartAlbum, .smartAlbumSelfPortraits)
  //
  //      ]
  //
  //      albumTypes.forEach { type, subtype in
  //        let collections = PHAssetCollection.fetchAssetCollections(with: type, subtype: subtype, options: fetchOptions)
  //        collections.enumerateObjects { (collection, _, _) in
  //          let assetsFetchOptions = PHFetchOptions()
  //          assetsFetchOptions.predicate = NSPredicate(format: "mediaType == %d", PHAssetMediaType.image.rawValue)
  //          let assetsCount = PHAsset.fetchAssets(in: collection, options: assetsFetchOptions).count
  //          if assetsCount > 0 {
  //            self.albums.append((collection: collection, assetsCount: assetsCount))
  //          }
  //        }
  //      }
  //    }
  //    albums.sort(by: { $0.assetsCount > $1.assetsCount })
  //    albumsTableView.reloadData()
  //  }
  
  
  //  private func fetchPhotoAlbums() {
  //      DispatchQueue.global(qos: .userInitiated).async {
  //          let fetchOptions = PHFetchOptions()
  //          var localAlbums: [(collection: PHAssetCollection, assetsCount: Int)] = []
  //
  //          let albumTypes: [(PHAssetCollectionType, PHAssetCollectionSubtype)] = [
  //              (.album, .any),
  //              (.smartAlbum, .smartAlbumUserLibrary),
  //              (.smartAlbum, .smartAlbumFavorites),
  //              (.smartAlbum, .smartAlbumSelfPortraits)
  //          ]
  //
  //          albumTypes.forEach { type, subtype in
  //              let collections = PHAssetCollection.fetchAssetCollections(with: type, subtype: subtype, options: fetchOptions)
  //              collections.enumerateObjects { (collection, _, _) in
  //                  let assetsFetchOptions = PHFetchOptions()
  //                  assetsFetchOptions.predicate = NSPredicate(format: "mediaType == %d", PHAssetMediaType.image.rawValue)
  //                  let assetsCount = PHAsset.fetchAssets(in: collection, options: assetsFetchOptions).count
  //                  if assetsCount > 0 {
  //                      localAlbums.append((collection: collection, assetsCount: assetsCount))
  //                  }
  //              }
  //          }
  //
  //          localAlbums.sort(by: { $0.assetsCount > $1.assetsCount })
  //
  //          DispatchQueue.main.async {
  //              self.albums = localAlbums
  //              self.albumsTableView.reloadData()
  //          }
  //      }
  //  }
  
  
  //  private func fetchPhotoAlbums() {
  //      DispatchQueue.global(qos: .userInitiated).async {
  //          let fetchOptions = PHFetchOptions()
  //          let albumTypes: [(PHAssetCollectionType, PHAssetCollectionSubtype)] = [
  //              (.album, .any),
  //              (.smartAlbum, .smartAlbumUserLibrary),
  //              (.smartAlbum, .smartAlbumFavorites),
  //              (.smartAlbum, .smartAlbumSelfPortraits)
  //          ]
  //
  //          var processedAlbumsCount = 0
  //          let totalAlbumTypes = albumTypes.count
  //
  //          albumTypes.forEach { type, subtype in
  //              let collections = PHAssetCollection.fetchAssetCollections(with: type, subtype: subtype, options: fetchOptions)
  //              collections.enumerateObjects { (collection, _, _) in
  //                  let assetsFetchOptions = PHFetchOptions()
  //                  assetsFetchOptions.predicate = NSPredicate(format: "mediaType == %d", PHAssetMediaType.image.rawValue)
  //                  let assetsCount = PHAsset.fetchAssets(in: collection, options: nil).count
  //                  if assetsCount > 0 {
  //                      self.albums.append((collection: collection, assetsCount: assetsCount))
  //                  }
  //              }
  //
  //              processedAlbumsCount += 1
  //              let progress = Float(processedAlbumsCount) / Float(totalAlbumTypes)
  //
  //              DispatchQueue.main.async {
  //                  self.progressView.setProgress(progress, animated: true)
  //              }
  //          }
  //
  //          DispatchQueue.main.async {
  //              self.albums.sort(by: { $0.assetsCount > $1.assetsCount })
  //              self.albumsTableView.reloadData()
  //              self.progressView.isHidden = true // Hide progress view once done
  //            self.textIndicator.isHidden = true
  //          }
  //      }
  //  }
  
  
  
  //  private func fetchPhotoAlbums() {
  //      DispatchQueue.global(qos: .userInitiated).async {
  //          let fetchOptions = PHFetchOptions()
  //          let albumTypes: [(PHAssetCollectionType, PHAssetCollectionSubtype)] = [
  //              (.album, .any),
  //              (.smartAlbum, .smartAlbumUserLibrary),
  //              (.smartAlbum, .smartAlbumFavorites),
  //              (.smartAlbum, .smartAlbumSelfPortraits)
  //          ]
  //
  //          var processedAlbumsCount = 0
  //          let totalAlbumTypes = albumTypes.count
  //
  //          albumTypes.forEach { type, subtype in
  //              let collections = PHAssetCollection.fetchAssetCollections(with: type, subtype: subtype, options: fetchOptions)
  //              collections.enumerateObjects { (collection, _, _) in
  //                  let assetsCount = PHAsset.fetchAssets(in: collection, options: nil).count
  //                  if assetsCount > 0 {
  //                      self.albums.append((collection: collection, assetsCount: assetsCount))
  //                  }
  //              }
  //              processedAlbumsCount += 1
  //              let progress = Float(processedAlbumsCount) / Float(totalAlbumTypes)
  //
  //              DispatchQueue.main.async {
  //                  self.progressView.setProgress(progress, animated: true)
  //              }
  //          }
  //
  //          DispatchQueue.main.async {
  //              self.albums.sort(by: { $0.assetsCount > $1.assetsCount })
  //              self.albumsTableView.reloadData()
  //              self.progressView.isHidden = true // Hide progress view once done
  //            self.textIndicator.isHidden = true
  //          }
  //      }
  //  }
  
  //  private func fetchPhotoAlbums() {
  //      DispatchQueue.global(qos: .userInitiated).async {
  //          let fetchOptions = PHFetchOptions()
  //          let albumTypes: [(PHAssetCollectionType, PHAssetCollectionSubtype)] = [
  //              (.album, .any),
  //              (.smartAlbum, .smartAlbumUserLibrary),
  //              (.smartAlbum, .smartAlbumFavorites),
  //              (.smartAlbum, .smartAlbumSelfPortraits)
  //          ]
  //          let dispatchGroup = DispatchGroup()
  //          var temporaryAlbums: [(collection: PHAssetCollection, assetsCount: Int?)] = []
  //
  //          albumTypes.forEach { type, subtype in
  //              let collections = PHAssetCollection.fetchAssetCollections(with: type, subtype: subtype, options: fetchOptions)
  //              collections.enumerateObjects { (collection, _, _) in
  //                  temporaryAlbums.append((collection: collection, assetsCount: nil))
  //
  //                  dispatchGroup.enter()
  //                  DispatchQueue.global(qos: .userInitiated).async {
  //
  //                    let estimatedCount = collection.estimatedAssetCount
  //                                    if estimatedCount != NSNotFound {
  //                                      print(estimatedCount,"estimated")
  //                                      self.albumCounts[collection.localIdentifier] = estimatedCount
  //                                      dispatchGroup.leave()
  //                                    } else {
  //                                      let assetsCount = PHAsset.fetchAssets(in: collection, options: nil).count
  //                                          self.albumCounts[collection.localIdentifier] = assetsCount
  //                                      dispatchGroup.leave()
  //                                    }
  //                  }
  //              }
  //          }
  //
  //          dispatchGroup.notify(queue: .main) {
  //              self.albums = temporaryAlbums.map { album in
  //                  (collection: album.collection, assetsCount: self.albumCounts[album.collection.localIdentifier])
  //              }.filter { $0.assetsCount != nil && $0.assetsCount! > 0 }
  //
  //              self.albums.sort(by: { ($0.assetsCount ?? 0) > ($1.assetsCount ?? 0) })
  //              self.albumsTableView.reloadData()
  //              self.progressView.isHidden = true
  //              self.textIndicator.isHidden = true
  //          }
  //      }
  //  }
  
  
  //  private func fetchPhotoAlbums() {
  //      DispatchQueue.global(qos: .userInitiated).async {
  //          let fetchOptions = PHFetchOptions()
  //          let albumTypes: [(PHAssetCollectionType, PHAssetCollectionSubtype)] = [
  //              (.album, .any),
  //              (.smartAlbum, .smartAlbumUserLibrary),
  //              (.smartAlbum, .smartAlbumFavorites),
  //              (.smartAlbum, .smartAlbumSelfPortraits),
  //          ]
  //
  //          let dispatchGroup = DispatchGroup()
  //        var temporaryAlbums: [String: (collection: PHAssetCollection, assetsCount: Int?)] = [:]
  //          albumTypes.forEach { type, subtype in
  //              let collections = PHAssetCollection.fetchAssetCollections(with: type, subtype: subtype, options: fetchOptions)
  //              collections.enumerateObjects { (collection, _, _) in
  //                  dispatchGroup.enter()
  //                DispatchQueue.global(qos: .userInitiated).async {
  //                      let estimatedCount = collection.estimatedAssetCount
  //                      if estimatedCount != NSNotFound {
  //                          DispatchQueue.main.async {
  //                              temporaryAlbums[collection.localIdentifier] = (collection: collection, assetsCount: estimatedCount)
  //                              dispatchGroup.leave()
  //                          }
  //                      } else {
  //                          let assetsCount = PHAsset.fetchAssets(in: collection, options: nil).count
  //                          DispatchQueue.main.async {
  //                              temporaryAlbums[collection.localIdentifier] = (collection: collection, assetsCount: assetsCount)
  //                              dispatchGroup.leave()
  //                          }
  //                      }
  //                  }
  //              }
  //          }
  //
  //          dispatchGroup.notify(queue: .main) {
  //              self.albums = temporaryAlbums.values.filter { $0.assetsCount != nil && $0.assetsCount! > 0 }
  //              self.albums.sort(by: { ($0.assetsCount ?? 0) > ($1.assetsCount ?? 0) })
  //              self.albumsTableView.reloadData()
  //              self.progressView.isHidden = true
  //              self.textIndicator.isHidden = true
  //          }
  //      }
  //  }
  
  
  
  // Inside AlbumCell
  //  func fetchCoverPhotoForAlbum(_ album: PHAssetCollection, using cache: NSCache<NSString, UIImage>, completion: @escaping (UIImage?) -> Void) {
  //      let cacheKey = NSString(string: "\(album.localIdentifier)")
  //      if let cachedImage = cache.object(forKey: cacheKey) {
  //          completion(cachedImage)
  //          return
  //      }
  //
  //      let fetchOptions = PHFetchOptions()
  //      fetchOptions.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
  //      let albumAssets = PHAsset.fetchAssets(in: album, options: fetchOptions)
  //
  //      guard let firstAsset = albumAssets.firstObject else {
  //          completion(nil)
  //          return
  //      }
  //
  //      let imageManager = PHImageManager.default()
  //      let requestOptions = PHImageRequestOptions()
  //      requestOptions.isSynchronous = false // Fetch the image asynchronously
  //      requestOptions.deliveryMode = .highQualityFormat
  //      imageManager.requestImage(for: firstAsset, targetSize: CGSize(width: 70, height: 70), contentMode: .aspectFill, options: requestOptions) { (image, _) in
  //          if let image = image {
  //              cache.setObject(image, forKey: cacheKey)
  //          }
  //          DispatchQueue.main.async {
  //              completion(image)
  //          }
  //      }
  //  }
  
}

// MARK: - UITableViewDataSource

extension PhotoAlbumsViewController: UITableViewDataSource {
  
  func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    return albums.count
  }
  
  func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
    guard let cell = tableView.dequeueReusableCell(withIdentifier: "AlbumCell", for: indexPath) as? AlbumCell else {
      return UITableViewCell()
    }
    let albumInfo = albums[indexPath.row]
    if let data = albumInfo.fetchAsset{
      cell.PhfetchData["\(indexPath.row)"] = data
    }
    cell.configureWith(album: albumInfo.collection, assetsCount: albumInfo.assetsCount ?? 0, using: imageCache,row:indexPath.row,image: true)
    return cell
  }
}

// MARK: - UITableViewDelegate

extension PhotoAlbumsViewController: UITableViewDelegate {
  
  func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
    let selectedAlbum = albums[indexPath.row].collection
    let totalCount = albums[indexPath.row].assetsCount
    
    guard let cell = tableView.cellForRow(at: indexPath) as? AlbumCell else {
      return
    }
    if let data  =  cell.PhfetchData["\(indexPath.row)"] as? PHFetchResult<PHAsset>{
      presentCollectionViewController(for: selectedAlbum,count: totalCount ?? 0,asset: data)
    }
    else{
      presentCollectionViewController(for: selectedAlbum,count: totalCount ?? 0)
    }
    //    presentCollectionViewController(for: selectedAlbum,count: totalCount ?? 0)
  }
  
  private func presentCollectionViewController(for album: PHAssetCollection,count:Int,asset:PHFetchResult<PHAsset>? = nil) {
    self.dismiss(animated: true) {
      if let keyWindowScene = UIApplication.shared.connectedScenes
        .filter({ $0.activationState == .foregroundActive })
        .compactMap({ $0 as? UIWindowScene })
        .first {
        guard let firstViewController = UIStoryboard(name: "Main2", bundle: nil).instantiateViewController(withIdentifier: "CollectionViewController") as? CollectionViewController else {
          print("Failed to instantiate CollectionViewController from storyboard.")
          return
        }
        firstViewController.pickerParameters = self.pickerParameters
        firstViewController.modalPresentationStyle = .fullScreen // Set full
        firstViewController.modalTransitionStyle = .coverVertical //
        firstViewController.selectedAlbum = album
        firstViewController.totalAssetCount = count
        if let data = asset{
          firstViewController.fetchResult = data
        }
        let rootViewController = keyWindowScene.windows.first?.rootViewController
        rootViewController?.present(firstViewController, animated: true, completion: nil)
        
      }
    }
  }
}

// MARK: - AlbumCell Configuration

extension AlbumCell {
  
  func configureWith(album: PHAssetCollection, assetsCount: Int, using cache: NSCache<NSString, UIImage>,row:Int,image:Bool) {
    lblTExt.text = album.localizedTitle
    lblCount.text = "\(assetsCount)"
    
    if (image){
      fetchCoverPhotoForAlbum(album, using: cache,row: row) { [weak self] image in
        DispatchQueue.main.async {
          
          self?.imageView1?.image = image
        }
      }
    }
    else{
      fetchCoverPhotoForVideo(album, using: cache,row: row) { [weak self] image in
        DispatchQueue.main.async {
          
          self?.imageView1?.image = image
        }
      }
    }
  }
  
  func fetchCoverPhotoForAlbum(_ album: PHAssetCollection, using cache: NSCache<NSString, UIImage>,row:Int, completion: @escaping (UIImage?) -> Void) {
    let cacheKey = NSString(string: "\(album.localIdentifier)")
    let fetchOptions = PHFetchOptions()
    var actualData :PHFetchResult<PHAsset>?
  
    if let data  =  self.PhfetchData["\(row)"] as? PHFetchResult<PHAsset>{
      print("already captured from Album manager")
      actualData = data
    }
    else{
      print("getting latest one")
      actualData = PHAsset.fetchAssets(in: album, options: fetchOptions)
    }
    guard let albumAssets = actualData else {
      print("actual data is nil")
      return  }
    self.PhfetchData["\(row)"] = albumAssets
    
    if let cachedImage = cache.object(forKey: cacheKey) {
      completion(cachedImage)
      return
    }
    let fetchResult =  albumAssets
    let endIndex = max(fetchResult.count - 0, 0)
    let startIndex = max(fetchResult.count - (0 + 20), 0)
    let indexSet = IndexSet(integersIn: startIndex..<endIndex)
    let filteredAssets = fetchResult.objects(at: indexSet)
    let cover =  filteredAssets.reversed().filter { $0.mediaType != .video }.first
    guard let firstAsset = cover as? PHAsset else {
      return
    }
    let imageManager = PHImageManager.default()
    let requestOptions = PHImageRequestOptions()
    requestOptions.isSynchronous = false
    requestOptions.deliveryMode = .highQualityFormat
    imageManager.requestImage(for: firstAsset, targetSize: CGSize(width: 70, height: 70), contentMode: .aspectFill, options: requestOptions) { (image, _) in
      if let image = image {
        cache.setObject(image, forKey: cacheKey)
      }
      completion(image)
    }
  }
  
  
  func fetchCoverPhotoForVideo(_ album: PHAssetCollection, using cache: NSCache<NSString, UIImage>,row:Int, completion: @escaping (UIImage?) -> Void) {
    let cacheKey = NSString(string: "\(album.localIdentifier)")
    let fetchOptions = PHFetchOptions()
    var actualData :PHFetchResult<PHAsset>?
  
    if let data  =  self.PhfetchData["\(row)"] as? PHFetchResult<PHAsset>{
      print("already captured from Album manager")
      actualData = data
    }
    else{
      print("getting latest one")
      actualData = PHAsset.fetchAssets(in: album, options: fetchOptions)
    }
    guard let albumAssets = actualData else {
      print("actual data is nil")
      return  }
    self.PhfetchData["\(row)"] = albumAssets
    
    if let cachedImage = cache.object(forKey: cacheKey) {
      completion(cachedImage)
      return
    }
    let fetchResult =  albumAssets
    let endIndex = max(fetchResult.count - 0, 0)
    let startIndex = max(fetchResult.count - (0 + 20), 0)
    let indexSet = IndexSet(integersIn: startIndex..<endIndex)
    let filteredAssets = fetchResult.objects(at: indexSet)
    let cover =  filteredAssets.reversed().filter { $0.mediaType == .video }.first
    guard let firstAsset = cover as? PHAsset else {
      return
    }
    let imageManager = PHImageManager.default()
    let requestOptions = PHImageRequestOptions()
    requestOptions.isSynchronous = false
    requestOptions.deliveryMode = .highQualityFormat
    imageManager.requestImage(for: firstAsset, targetSize: CGSize(width: 70, height: 70), contentMode: .aspectFill, options: requestOptions) { (image, _) in
      if let image = image {
        cache.setObject(image, forKey: cacheKey)
      }
      completion(image)
    }
  }
}
