import UIKit
import Photos

class VideoAlbumViewController: UIViewController, UITableViewDataSource, UITableViewDelegate {
  
  @IBOutlet weak var albumsTableView: UITableView!
  
  var videoAlbums: [PHAssetCollection] = []
  var pickerParameters: PickerParameters?
  
  
  
  @IBOutlet weak var textIndicator: UILabel!
  
  @IBOutlet weak var progressView: UIProgressView!
  var albums: [(collection: PHAssetCollection, assetsCount: Int?,fetchAsset:PHFetchResult<PHAsset>?)] = []
  
  // Image Cache
  private var imageCache = NSCache<NSString, UIImage>()
  
  
  override func viewDidLoad() {
    super.viewDidLoad()
    
    albumsTableView.dataSource = self
    albumsTableView.delegate = self
    
    
    self.textIndicator.reactZIndex = 2
    //    fetchPhotoAlbums()
    //    PhotoAlbumManager.shared.fetchPhotoAlbums()
    VideoAlbumManager.shared.addListener("PhotoAlbumsViewController") {
      self.updateUI()
    }
    
    VideoAlbumManager.shared.addProgressListener("Progress") { [weak self] (total, current) in
      DispatchQueue.main.async {
        self?.updateProgress(currentIndex: current, totalCount: total)
      }
    }
//    fetchVideoAlbums()
  }
  
  func updateUI(){
    
    DispatchQueue.main.async {
      // Update your UI with the albums
      self.albums = VideoAlbumManager.shared.albums
//      print(VideoAlbumManager.shared.currentAlbumProcessing,"inProcessing")
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
  
  deinit{
    VideoAlbumManager.shared.removeListener("PhotoAlbumsViewController")
    VideoAlbumManager.shared.removeProgressListener("Progress")
  }
  
  @IBAction func actionBack(_ sender: UIButton) {
    NotificationCenter.default.post(name: NSNotification.Name("videos"), object: self, userInfo: ["data": []])
    self.dismiss(animated: true)
  }
  
  // MARK: - Fetching Video Albums
  
  func fetchVideoAlbums() {
    let fetchOptions = PHFetchOptions()
    let videoAlbums = PHAssetCollection.fetchAssetCollections(with: .album, subtype: .any, options: fetchOptions)
    let videoSmartAlbums = PHAssetCollection.fetchAssetCollections(with: .smartAlbum, subtype: .smartAlbumVideos, options: fetchOptions)
    print("videoAlbums count:", videoAlbums.count)
    
    videoAlbums.enumerateObjects { (album, index, _) in
      print(album)
      self.videoAlbums.append(album)
    }
    videoSmartAlbums.enumerateObjects { (album, index, _) in
      print(album)
      self.videoAlbums.append(album)
    }
    
    albumsTableView.reloadData()
  }
  
  // MARK: - UITableViewDataSource
  
  func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    return albums.count
  }
  
  func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
//    let cell = tableView.dequeueReusableCell(withIdentifier: "AlbumCell", for: indexPath) as! AlbumCell
    
    guard let cell = tableView.dequeueReusableCell(withIdentifier: "AlbumCell", for: indexPath) as? AlbumCell else {
      return UITableViewCell()
    }
    let albumInfo = albums[indexPath.row]
    if let data = albumInfo.fetchAsset{
      cell.PhfetchData["\(indexPath.row)"] = data
    }
    cell.configureWith(album: albumInfo.collection, assetsCount: albumInfo.assetsCount ?? 0, using: imageCache,row:indexPath.row,image: false)
    return cell
//    let album = videoAlbums[indexPath.row]
//    
//    if let coverVideo = fetchCoverVideoForAlbum(album) {
//      cell.imageView1.image = coverVideo
//    }
//    
//    
//    if let title = album.localizedTitle {
//      
//      
//      cell.lblTExt?.text = "\(album.localizedTitle ?? "")"
//      // Asynchronously count videos in the album
//      DispatchQueue.global(qos: .background).async {
//        let videoCount = self.fetchVideoCountInAlbum(album)
//        DispatchQueue.main.async {
//          cell.lblTExt?.text = "\(album.localizedTitle ?? "") \(videoCount)"
//        }
//      }
      
      //          cell.lblTExt?.text = "\(title) \(countVideoAssetsInAlbum(album: album))"
//    }
    
//    return cell
  }
  
  // MARK: - UITableViewDelegate
  
//  func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
//    let selectedAlbum = videoAlbums[indexPath.row]
//    
//    
//    self.dismiss(animated: true) {
//      if let keyWindowScene = UIApplication.shared.connectedScenes
//        .filter({ $0.activationState == .foregroundActive })
//        .compactMap({ $0 as? UIWindowScene })
//        .first {
//        let storyboard = UIStoryboard(name: "Main2", bundle: nil)
//        if let firstViewController = storyboard.instantiateViewController(withIdentifier: "CollectionVideoController") as? CollectionVideoController {
//          firstViewController.pickerParameters = self.pickerParameters
//          firstViewController.modalPresentationStyle = .fullScreen // Set full
//          firstViewController.modalTransitionStyle = .coverVertical //
//          firstViewController.selectedAlbum = selectedAlbum
//          let rootViewController = keyWindowScene.windows.first?.rootViewController
//          rootViewController?.present(firstViewController, animated: true, completion: nil)
//        }
//      }
//    }
    
//  }
  
  
  
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
        guard let firstViewController = UIStoryboard(name: "Main2", bundle: nil).instantiateViewController(withIdentifier: "CollectionVideoController") as? CollectionVideoController else {
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
  
  
  
  
  func fetchVideoCountInAlbum(_ album: PHAssetCollection) -> Int {
    let fetchOptions = PHFetchOptions()
    fetchOptions.predicate = NSPredicate(format: "mediaType == %d", PHAssetMediaType.video.rawValue)
    let albumAssets = PHAsset.fetchAssets(in: album, options: fetchOptions)
    return albumAssets.count
  }
  
  
  
  func fetchCoverVideoForAlbum(_ album: PHAssetCollection) -> UIImage? {
    let albumAssets = PHAsset.fetchAssets(in: album, options: nil)
    
    guard let firstAsset = albumAssets.firstObject else {
      return nil
    }
    
    let imageManager = PHImageManager.default()
    var coverVideoThumbnail: UIImage?
    
    let requestOptions = PHImageRequestOptions()
    requestOptions.isSynchronous = true
    
    imageManager.requestImage(for: firstAsset, targetSize: CGSize(width: 100, height: 100), contentMode: .aspectFill, options: requestOptions) { (image, _) in
      coverVideoThumbnail = image
    }
    
    return coverVideoThumbnail
  }
}
