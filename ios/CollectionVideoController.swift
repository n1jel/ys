//import UIKit
//import Photos
//import AVFoundation
//
//class CollectionVideoController: UIViewController, UICollectionViewDataSource, UICollectionViewDelegate {
//
//    @IBOutlet weak var videosCollectionView: UICollectionView!
//    @IBOutlet weak var activityIndicator: UIActivityIndicatorView!
//
//    var selectedVideos: [PHAsset] = []
//
//    var videoAlbum: PHAssetCollection?
//
//    override func viewDidLoad() {
//        super.viewDidLoad()
//
//        videosCollectionView.dataSource = self
//        videosCollectionView.delegate = self
//
//        fetchVideosInAlbum()
//    }
//
//    // MARK: - Fetching Videos
//
//    func fetchVideosInAlbum() {
//        guard let videoAlbum = videoAlbum else {
//            return
//        }
//
//        let fetchOptions = PHFetchOptions()
//        fetchOptions.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
//        let videoAssets = PHAsset.fetchAssets(in: videoAlbum, options: fetchOptions)
//
//        // Fetching assets can be a time-consuming operation, so it's recommended to do it asynchronously.
//        DispatchQueue.global(qos: .background).async {
//            videoAssets.enumerateObjects { asset, _, _ in
//                // Filter out only video assets
//                if asset.mediaType == .video {
//                    self.selectedVideos.append(asset)
//                }
//            }
//
//            // Reload the collection view on the main thread once fetching is complete.
//            DispatchQueue.main.async {
//                self.videosCollectionView.reloadData()
//                self.activityIndicator.stopAnimating()
//            }
//        }
//    }
//
//    // MARK: - UICollectionViewDataSource
//
//    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
//        return selectedVideos.count
//    }
//
//    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
//        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: "VideoCell", for: indexPath) as! VideoCollectionViewCell
//
//        let videoAsset = selectedVideos[indexPath.item]
//        loadVideoThumbnail(for: videoAsset, into: cell.imageView)
//
//        return cell
//    }
//
//    // MARK: - UICollectionViewDelegate
//
//    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
//        let selectedVideo = selectedVideos[indexPath.item]
//
//        // Handle the selected video, e.g., play the video or perform other actions.
//        // You can use AVPlayerViewController or AVPlayer to play the video.
//
//        // Example using AVPlayerViewController:
//        let playerViewController = AVPlayerViewController()
//        if let assetURL = getVideoURL(for: selectedVideo) {
//            let player = AVPlayer(url: assetURL)
//            playerViewController.player = player
//            present(playerViewController, animated: true) {
//                player.play()
//            }
//        }
//    }
//
//    // MARK: - Helper Methods
//
//    func loadVideoThumbnail(for asset: PHAsset, into imageView: UIImageView) {
//        let imageManager = PHImageManager.default()
//        let requestOptions = PHImageRequestOptions()
//        requestOptions.isSynchronous = false
//        requestOptions.deliveryMode = .fastFormat
//
//        imageManager.requestImage(for: asset, targetSize: CGSize(width: 100, height: 100), contentMode: .aspectFill, options: requestOptions) { (image, _) in
//            imageView.image = image
//        }
//    }
//
//    func getVideoURL(for asset: PHAsset) -> URL? {
//        let options = PHVideoRequestOptions()
//        options.version = .original
//
//        var videoURL: URL?
//
//        PHImageManager.default().requestAVAsset(forVideo: asset, options: options) { avAsset, _, _ in
//            if let avURLAsset = avAsset as? AVURLAsset {
//                videoURL = avURLAsset.url
//            }
//        }
//
//        return videoURL
//    }
//}
//



//import UIKit
//import Photos
//
//class CollectionVideoController: UIViewController, UICollectionViewDataSource, UICollectionViewDelegate, UICollectionViewDelegateFlowLayout {
//
//    @IBOutlet weak var videoCollectionView: UICollectionView!
//
//    var selectedAlbum: PHAssetCollection?
//    var videoAssets: [PHAsset] = []
//
//    override func viewDidLoad() {
//        super.viewDidLoad()
//
//        videoCollectionView.dataSource = self
//        videoCollectionView.delegate = self
//
//        if let selectedAlbum = selectedAlbum {
//            videoAssets = fetchVideoAssetsFromAlbum(album: selectedAlbum)
//        }
//    }
//
//    // MARK: - UICollectionViewDataSource
//
//    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
//        return videoAssets.count
//    }
//
//    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
//        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: "VideoCell", for: indexPath) as! VideoCollectionViewCell
//        let asset = videoAssets[indexPath.item]
//
//        // Load and display the video asset thumbnail in the cell
//        loadThumbnailForAsset(asset, into: cell.videoThumbnailImageView)
//
//        return cell
//    }
//
//    // MARK: - UICollectionViewDelegate
//
//    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
//        // Handle the selection of a video asset, e.g., play the selected video.
//        let selectedAsset = videoAssets[indexPath.item]
//
//        PHImageManager.default().requestAVAsset(forVideo: selectedAsset, options: nil) { (avAsset, _, _) in
//            if let videoURL = (avAsset as? AVURLAsset)?.url {
//                // You can use videoURL to play or further process the selected video.
//                print("Selected Video URL: \(videoURL)")
//            }
//        }
//    }
//
//    // MARK: - Helper Methods
//
//    func fetchVideoAssetsFromAlbum(album: PHAssetCollection) -> [PHAsset] {
//        var assets: [PHAsset] = []
//        let fetchOptions = PHFetchOptions()
//        fetchOptions.predicate = NSPredicate(format: "mediaType == %d", PHAssetMediaType.video.rawValue)
//        fetchOptions.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)] // Sorting by creation date in descending order
//        let albumAssets = PHAsset.fetchAssets(in: album, options: fetchOptions)
//
//        albumAssets.enumerateObjects { (asset, index, _) in
//            assets.append(asset)
//        }
//
//        return assets
//    }
//
//    func loadThumbnailForAsset(_ asset: PHAsset, into imageView: UIImageView) {
//        let imageManager = PHImageManager.default()
//        let requestOptions = PHImageRequestOptions()
//        requestOptions.isSynchronous = false
//        requestOptions.deliveryMode = .highQualityFormat
//
//        imageManager.requestImage(for: asset, targetSize: CGSize(width: 100, height: 100), contentMode: .aspectFill, options: requestOptions) { (image, _) in
//            imageView.image = image
//        }
//    }
//}
//
//class VideoCollectionViewCell: UICollectionViewCell {
//    @IBOutlet weak var videoThumbnailImageView: UIImageView!
//}




import UIKit
import Photos
import CoreServices
class CollectionVideoController: UIViewController, UICollectionViewDataSource, UICollectionViewDelegate, UICollectionViewDelegateFlowLayout {
  
  @IBOutlet weak var lblCount: UILabel!
  @IBOutlet weak var activityIndicator: UIActivityIndicatorView!
  @IBOutlet weak var videosCollectionView: UICollectionView!
  @IBOutlet weak var cancelBtn: UIButton!
  @IBOutlet weak var uploadBtn: UIButton!
  var totalAssetCount:Int?
  let s3UploadManager = S3VideoUploadManager.shared
  var selectedAlbum: PHAssetCollection?
  var videoAssets: [PHAsset] = []
  var selectedVideoAssets:[PHAsset] = []
  var singleSelectedVideoAsset:PHAsset? = nil
  var selectedDict:Array<Dictionary<String,Any>> = []
  var previousIndexSelected:IndexPath = IndexPath(row: -1, section: -1)
  var pickerParameters: PickerParameters?
  var fetchResult: PHFetchResult<PHAsset>?
  var currentPage = 0
    let itemsPerPage = 30
  var totalPages = 0
  var isFetchingAssets = false
  override func viewDidLoad() {
    super.viewDidLoad()
    s3UploadManager.pickerParameters = pickerParameters
    videosCollectionView.dataSource = self
    videosCollectionView.delegate = self
        videosCollectionView.allowsMultipleSelectionDuringEditing = true
        videosCollectionView.isEditing = true
    totalPages = ((totalAssetCount ?? 0) + itemsPerPage - 1) / itemsPerPage
    
    if let data = fetchResult{
      fetchAssetsForCurrentPage()
      print("already data here")
    }
    else{
      fetchVideoAssets()
    }
    
  }
  
  func fetchAssetsForCurrentPage() {
    print(currentPage,totalPages,totalAssetCount,isFetchingAssets)
    print("started")
      if let total = totalAssetCount {
          guard !isFetchingAssets else { return }
        print("working1")
          guard currentPage < totalPages else {
              // All pages have been fetched
              return
          }
          
          isFetchingAssets = true
          
          let startIndex = currentPage * itemsPerPage
          let endIndex = min(startIndex + itemsPerPage, total)
          print("fetching")
          let fetchedAssets = fetchAssetsFromAlbum1(album: selectedAlbum!, startIndex: startIndex, fetchLimit: itemsPerPage)
        print("ending")
          // Determine the indexes of items to insert or update
          let startIndexForInsertion = videoAssets.count
          let endIndexForInsertion = startIndexForInsertion + fetchedAssets.count
          
          // Append fetched assets to the collection
        videoAssets.append(contentsOf: fetchedAssets)
          
          // Prepare index paths for insertion
          let indexPathsForInsertion = (startIndexForInsertion..<endIndexForInsertion).map { IndexPath(item: $0, section: 0) }
          
          // Perform insertion or updating
          if currentPage == 0 {
            videosCollectionView.reloadData() // Reload if it's the first page
          } else {
            videosCollectionView.performBatchUpdates({
              videosCollectionView.insertItems(at: indexPathsForInsertion)
              }, completion: nil)
          }
          
          currentPage += 1
          isFetchingAssets = false
      }
  }
  
  func fetchAssetsFromAlbum1(album: PHAssetCollection, startIndex: Int, fetchLimit: Int) -> [PHAsset] {
      var assets: [PHAsset] = []
      if let fetchResult =  fetchResult {
          let endIndex = max(fetchResult.count - startIndex, 0)
          let startIndex = max(fetchResult.count - (startIndex + fetchLimit), 0)
          let indexSet = IndexSet(integersIn: startIndex..<endIndex)
          let filteredAssets = fetchResult.objects(at: indexSet)
        assets.append(contentsOf: filteredAssets.reversed())
          //.filter { $0.mediaType == .video })
      }
          
      return assets
  }
  
  @IBAction func cancelBtnTapped(_ sender: UIButton) {
    
    NotificationCenter.default.post(name: NSNotification.Name("videos"), object: self, userInfo: ["data": []])
    self.dismiss(animated: true)
  }
  
  
  @IBAction func uploadBtnTapped(_ sender: UIButton) {
    print(selectedDict.count)
    
    self.s3UploadManager.assets = selectedVideoAssets
    self.s3UploadManager.startUpload() {
      DispatchQueue.main.async {
               self.activityIndicator.stopAnimating()
        NotificationCenter.default.post(name: NSNotification.Name("videos"), object: self, userInfo: ["data": []])
               self.dismiss(animated: true)
             }
    }
//    NotificationCenter.default.post(name: NSNotification.Name("videos"), object: self, userInfo: ["data": self.selectedDict])
//    self.dismiss(animated: true)
  }
  
  // MARK: - UICollectionViewDataSource
  
  func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
    return videoAssets.count
  }
  
  func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
    let cell = collectionView.dequeueReusableCell(withReuseIdentifier: "VideoCollectionViewCell", for: indexPath) as! VideoCollectionViewCell
    let asset = videoAssets[indexPath.item]
    loadVideoThumbnailForAsset(asset, into: cell.thumbnailImageView)
        let isSelected = selectedVideoAssets.contains(asset)
//    let isSelected = self.singleSelectedVideoAsset == asset
    cell.updateSelectionStatus(isSelected: !isSelected)
    
    return cell
  }
  
  // MARK: - UICollectionViewDelegate
//  func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
//    print("i am here ")
//    let selectedAsset = videoAssets[indexPath.item]
//    
//    PHImageManager.default().requestAVAsset(forVideo: selectedAsset, options: nil) { (avAsset, _, _) in
//      DispatchQueue.main.async {
//        guard let videoURL = (avAsset as? AVURLAsset)?.url else { return }
//        let fileSize = self.getFileSize(url: videoURL)
//        
//        if fileSize > 200 { // Size in MB
//          // Video is larger than 200MB. Show alert and do not append.
//          self.showAlertForLargeFile()
//          self.singleSelectedVideoAsset = nil
//        } else {
//          // Proceed with selection or deselection.
//          if self.singleSelectedVideoAsset == selectedAsset {
//            self.singleSelectedVideoAsset = nil
//          } else {
//            self.singleSelectedVideoAsset = selectedAsset
//            if self.previousIndexSelected != indexPath{
//              collectionView.reloadItems(at: [self.previousIndexSelected])
//              self.previousIndexSelected = indexPath
//            }
//            self.addVideoToSelectedDict(with: videoURL, fileSize: fileSize)
//          }
//          print(fileSize,"reached here")
//          // Update UI for the selected cell.
//          
//          collectionView.reloadItems(at: [indexPath,self.previousIndexSelected])
//          
//          let isSelected = (selectedAsset == self.singleSelectedVideoAsset)
//          self.lblCount.text = isSelected ? "1" : "0"
//          //                  if let cell = collectionView.cellForItem(at: indexPath) as? VideoCollectionViewCell {
//          //                      let isSelected = (selectedAsset == self.singleSelectedVideoAsset)
//          //                      cell.updateSelectionStatus(isSelected: !isSelected)
//          //                      self.lblCount.text = isSelected ? "1" : "0"
//          //                  }
//        }
//      }
//    }
//  }
//  
//  func collectionView(_ collectionView: UICollectionView, didDeselectItemAt indexPath: IndexPath) {
//    let selectedAsset = videoAssets[indexPath.item]
//    
//    PHImageManager.default().requestAVAsset(forVideo: selectedAsset, options: nil) { (avAsset, _, _) in
//      DispatchQueue.main.async {
//        guard let videoURL = (avAsset as? AVURLAsset)?.url else { return }
//        let fileSize = self.getFileSize(url: videoURL)
//        
//        // Proceed with selection or deselection.
//        if fileSize > 200 { // Size in MB
//          // Video is larger than 200MB. Show alert and do not append.
//          self.showAlertForLargeFile()
//          self.singleSelectedVideoAsset = nil
//        } else {
//          if self.singleSelectedVideoAsset == selectedAsset {
//            self.singleSelectedVideoAsset = nil
//          } else {
//            self.singleSelectedVideoAsset = selectedAsset
//            if self.previousIndexSelected != indexPath{
//              collectionView.reloadItems(at: [self.previousIndexSelected])
//              self.previousIndexSelected = indexPath
//            }
//            
//            
//            self.addVideoToSelectedDict(with: videoURL, fileSize: fileSize)
//          }
//          
//          print(fileSize,"reached here")
//          // Update UI for the selected cell.
//          collectionView.reloadItems(at: [indexPath])
//          let isSelected = (selectedAsset == self.singleSelectedVideoAsset)
//          self.lblCount.text = isSelected ? "1" : "0"
//          //            if let cell = collectionView.cellForItem(at: indexPath) as? VideoCollectionViewCell {
//          //              let isSelected = (selectedAsset == self.singleSelectedVideoAsset)
//          //              cell.updateSelectionStatus(isSelected: !isSelected)
//          //              self.lblCount.text = isSelected ? "1" : "0"
//          //            }
//        }
//      }
//    }
//  }
  
  private func getFileSize(url: URL) -> Double {
    do {
      let resources = try url.resourceValues(forKeys:[.fileSizeKey])
      let fileSize = resources.fileSize ?? 0
      return Double(fileSize) / (1024 * 1024) // Convert to MB
    } catch {
      print("Error: \(error)")
      return 0
    }
  }
  
  private func addVideoToSelectedDict(with videoURL: URL, fileSize: Double) {
    let fileNameWithoutExtension = videoURL.deletingPathExtension().lastPathComponent
    if let mimeType = getMimeType(forFileExtension: videoURL.pathExtension) {
      let dict: Dictionary<String,Any> = [
        "name": fileNameWithoutExtension,
        "originalUri": videoURL.absoluteString,
        "type": mimeType,
        "size": fileSize
      ]
      self.selectedDict = []
      self.selectedDict.append(dict)
      print("Selected Video URL: \(dict)")
    }
  }
  
  private func showAlertForLargeFile() {
    // Assuming you have a UIViewController extension or access to present an alert
    let alertController = UIAlertController(title: "File Size Limit Exceeded", message: "The selected video is larger than 200MB and cannot be added.", preferredStyle: .alert)
    alertController.addAction(UIAlertAction(title: "OK", style: .default, handler: nil))
    // Replace `self` with your view controller if needed
    DispatchQueue.main.async {
      self.present(alertController, animated: true)
    }
  }
  
  
  
  
  
  
  
  
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
  
      
      
      let asset = videoAssets[indexPath.item]
      selectedVideoAssets.append(asset)
      let cell = collectionView.cellForItem(at: indexPath) as? VideoCollectionViewCell
      cell?.updateSelectionStatus(isSelected: !selectedVideoAssets.contains(asset))
      lblCount.text = String(selectedVideoAssets.count)
      
      
      
      
      
      
//      let selectedAsset = videoAssets[indexPath.item]
//      if let index = selectedVideoAssets.firstIndex(of: selectedAsset) {
//        print("removing in select")
//        selectedVideoAssets.remove(at: index)
//        let cell = collectionView.cellForItem(at: indexPath) as? VideoCollectionViewCell
//        let isSelected = selectedVideoAssets.contains(selectedAsset)
//        cell?.updateSelectionStatus(isSelected: !isSelected)
//        lblCount.text = String(selectedVideoAssets.count)
//      }
//      else{
//        print("Appending in select")
//        selectedVideoAssets.append(selectedAsset)
//        let cell = collectionView.cellForItem(at: indexPath) as? VideoCollectionViewCell
//        let isSelected = selectedVideoAssets.contains(selectedAsset)
//        cell?.updateSelectionStatus(isSelected: !isSelected)
//        lblCount.text = String(selectedVideoAssets.count)
//      }

    }
  
  func getMimeType(forFileExtension fileExtension: String) -> String? {
    if let uti = UTTypeCreatePreferredIdentifierForTag(kUTTagClassFilenameExtension, fileExtension as CFString, nil)?.takeRetainedValue() {
      if let mimeType = UTTypeCopyPreferredTagWithClass(uti, kUTTagClassMIMEType)?.takeRetainedValue() {
        return mimeType as String
      }
    }
    return nil
  }
  
    func collectionView(_ collectionView: UICollectionView, didDeselectItemAt indexPath: IndexPath) {
      
      
      let asset = videoAssets[indexPath.item]
      if let index = selectedVideoAssets.firstIndex(of: asset) {
        selectedVideoAssets.remove(at: index)
      }
      let cell = collectionView.cellForItem(at: indexPath) as? VideoCollectionViewCell
      cell?.updateSelectionStatus(isSelected: !selectedVideoAssets.contains(asset))
      lblCount.text = String(selectedVideoAssets.count)
      
      
//      let selectedAsset = videoAssets[indexPath.item]
//  
//      if let index = selectedVideoAssets.firstIndex(of: selectedAsset) {
//        print("removing in Deselect")
//        selectedVideoAssets.remove(at: index)
//        let cell = collectionView.cellForItem(at: indexPath) as? VideoCollectionViewCell
//        let isSelected = selectedVideoAssets.contains(selectedAsset)
//        cell?.updateSelectionStatus(isSelected: !isSelected)
//        lblCount.text = String(selectedVideoAssets.count)
//      }
//      else{
//        print("Appending in Deselect")
//        selectedVideoAssets.append(selectedAsset)
//        let cell = collectionView.cellForItem(at: indexPath) as? VideoCollectionViewCell
//        let isSelected = selectedVideoAssets.contains(selectedAsset)
//        cell?.updateSelectionStatus(isSelected: !isSelected)
//        lblCount.text = String(selectedVideoAssets.count)
//      }
    }
  
  
  
  // MARK: - UICollectionViewDelegateFlowLayout
  
  
  func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
    let screenWidth =  UIScreen.main.bounds.width / 3.2
    return CGSize(width: screenWidth, height: screenWidth)
  }
  
  // MARK: - Helper Methods
  
  func fetchVideoAssets() {
    guard let selectedAlbum = selectedAlbum else {
      return
    }
    
    let fetchOptions = PHFetchOptions()
    fetchOptions.predicate = NSPredicate(format: "mediaType == %d", PHAssetMediaType.video.rawValue)
    fetchOptions.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
    
    let albumAssets = PHAsset.fetchAssets(in: selectedAlbum, options: fetchOptions)
    
    albumAssets.enumerateObjects { (asset, _, _) in
      self.videoAssets.append(asset)
    }
    
    videosCollectionView.reloadData()
    activityIndicator.stopAnimating()
  }
  
  func loadVideoThumbnailForAsset(_ asset: PHAsset, into imageView: UIImageView) {
    let imageManager = PHImageManager.default()
    let requestOptions = PHImageRequestOptions()
    requestOptions.isSynchronous = false
    requestOptions.deliveryMode = .fastFormat
    
    imageManager.requestImage(for: asset, targetSize: CGSize(width: 100, height: 100), contentMode: .aspectFill, options: requestOptions) { (image, _) in
      imageView.image = image
    }
  }
}

class VideoCollectionViewCell: UICollectionViewCell {
  @IBOutlet weak var thumbnailImageView: UIImageView!
  @IBOutlet weak var tick: UIImageView!
  
  func updateSelectionStatus(isSelected:Bool){
    tick.isHidden = isSelected
  }
}





extension CollectionVideoController: UIScrollViewDelegate {
    func scrollViewDidScroll(_ scrollView: UIScrollView) {
        let offsetY = scrollView.contentOffset.y
        let contentHeight = scrollView.contentSize.height
        let screenHeight = scrollView.frame.size.height
        
        if offsetY > contentHeight - screenHeight {
            fetchAssetsForCurrentPage()
        }
    }
    

}







//import UIKit
//import Photos
//import AVFoundation
//
//class CollectionVideoController: UIViewController, UICollectionViewDataSource, UICollectionViewDelegate {
//
//    @IBOutlet weak var videosCollectionView: UICollectionView!
//    @IBOutlet weak var activityIndicator: UIActivityIndicatorView!
//
//    var selectedVideos: [PHAsset] = []
//
//    var videoAlbum: PHAssetCollection?
//
//    override func viewDidLoad() {
//        super.viewDidLoad()
//
//        videosCollectionView.dataSource = self
//        videosCollectionView.delegate = self
//
//        fetchVideosInAlbum()
//    }
//
//    // MARK: - Fetching Videos
//
//    func fetchVideosInAlbum() {
//        guard let videoAlbum = videoAlbum else {
//            return
//        }
//
//        let fetchOptions = PHFetchOptions()
//        fetchOptions.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
//        let videoAssets = PHAsset.fetchAssets(in: videoAlbum, options: fetchOptions)
//
//        // Fetching assets can be a time-consuming operation, so it's recommended to do it asynchronously.
//        DispatchQueue.global(qos: .background).async {
//            videoAssets.enumerateObjects { asset, _, _ in
//                // Filter out only video assets
//                if asset.mediaType == .video {
//                    self.selectedVideos.append(asset)
//                }
//            }
//
//            // Reload the collection view on the main thread once fetching is complete.
//            DispatchQueue.main.async {
//                self.videosCollectionView.reloadData()
//                self.activityIndicator.stopAnimating()
//            }
//        }
//    }
//
//    // MARK: - UICollectionViewDataSource
//
//    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
//        return selectedVideos.count
//    }
//
//    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
//        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: "VideoCell", for: indexPath) as! VideoCollectionViewCell
//
//        let videoAsset = selectedVideos[indexPath.item]
//        loadVideoThumbnail(for: videoAsset, into: cell.imageView)
//
//        return cell
//    }
//
//    // MARK: - UICollectionViewDelegate
//
//    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
//        let selectedVideo = selectedVideos[indexPath.item]
//
//        // Handle the selected video, e.g., play the video or perform other actions.
//        // You can use AVPlayerViewController or AVPlayer to play the video.
//
//        // Example using AVPlayerViewController:
//        let playerViewController = AVPlayerViewController()
//        if let assetURL = getVideoURL(for: selectedVideo) {
//            let player = AVPlayer(url: assetURL)
//            playerViewController.player = player
//            present(playerViewController, animated: true) {
//                player.play()
//            }
//        }
//    }
//
//    // MARK: - Helper Methods
//
//    func loadVideoThumbnail(for asset: PHAsset, into imageView: UIImageView) {
//        let imageManager = PHImageManager.default()
//        let requestOptions = PHImageRequestOptions()
//        requestOptions.isSynchronous = false
//        requestOptions.deliveryMode = .fastFormat
//
//        imageManager.requestImage(for: asset, targetSize: CGSize(width: 100, height: 100), contentMode: .aspectFill, options: requestOptions) { (image, _) in
//            imageView.image = image
//        }
//    }
//
//    func getVideoURL(for asset: PHAsset) -> URL? {
//        let options = PHVideoRequestOptions()
//        options.version = .original
//
//        var videoURL: URL?
//
//        PHImageManager.default().requestAVAsset(forVideo: asset, options: options) { avAsset, _, _ in
//            if let avURLAsset = avAsset as? AVURLAsset {
//                videoURL = avURLAsset.url
//            }
//        }
//
//        return videoURL
//    }
//}
//



//import UIKit
//import Photos
//
//class CollectionVideoController: UIViewController, UICollectionViewDataSource, UICollectionViewDelegate, UICollectionViewDelegateFlowLayout {
//
//    @IBOutlet weak var videoCollectionView: UICollectionView!
//
//    var selectedAlbum: PHAssetCollection?
//    var videoAssets: [PHAsset] = []
//
//    override func viewDidLoad() {
//        super.viewDidLoad()
//
//        videoCollectionView.dataSource = self
//        videoCollectionView.delegate = self
//
//        if let selectedAlbum = selectedAlbum {
//            videoAssets = fetchVideoAssetsFromAlbum(album: selectedAlbum)
//        }
//    }
//
//    // MARK: - UICollectionViewDataSource
//
//    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
//        return videoAssets.count
//    }
//
//    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
//        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: "VideoCell", for: indexPath) as! VideoCollectionViewCell
//        let asset = videoAssets[indexPath.item]
//
//        // Load and display the video asset thumbnail in the cell
//        loadThumbnailForAsset(asset, into: cell.videoThumbnailImageView)
//
//        return cell
//    }
//
//    // MARK: - UICollectionViewDelegate
//
//    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
//        // Handle the selection of a video asset, e.g., play the selected video.
//        let selectedAsset = videoAssets[indexPath.item]
//
//        PHImageManager.default().requestAVAsset(forVideo: selectedAsset, options: nil) { (avAsset, _, _) in
//            if let videoURL = (avAsset as? AVURLAsset)?.url {
//                // You can use videoURL to play or further process the selected video.
//                print("Selected Video URL: \(videoURL)")
//            }
//        }
//    }
//
//    // MARK: - Helper Methods
//
//    func fetchVideoAssetsFromAlbum(album: PHAssetCollection) -> [PHAsset] {
//        var assets: [PHAsset] = []
//        let fetchOptions = PHFetchOptions()
//        fetchOptions.predicate = NSPredicate(format: "mediaType == %d", PHAssetMediaType.video.rawValue)
//        fetchOptions.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)] // Sorting by creation date in descending order
//        let albumAssets = PHAsset.fetchAssets(in: album, options: fetchOptions)
//
//        albumAssets.enumerateObjects { (asset, index, _) in
//            assets.append(asset)
//        }
//
//        return assets
//    }
//
//    func loadThumbnailForAsset(_ asset: PHAsset, into imageView: UIImageView) {
//        let imageManager = PHImageManager.default()
//        let requestOptions = PHImageRequestOptions()
//        requestOptions.isSynchronous = false
//        requestOptions.deliveryMode = .highQualityFormat
//
//        imageManager.requestImage(for: asset, targetSize: CGSize(width: 100, height: 100), contentMode: .aspectFill, options: requestOptions) { (image, _) in
//            imageView.image = image
//        }
//    }
//}
//
//class VideoCollectionViewCell: UICollectionViewCell {
//    @IBOutlet weak var videoThumbnailImageView: UIImageView!
//}




//import UIKit
//import Photos
//import CoreServices
//class CollectionVideoController: UIViewController, UICollectionViewDataSource, UICollectionViewDelegate, UICollectionViewDelegateFlowLayout {
//  
//  @IBOutlet weak var lblCount: UILabel!
//  @IBOutlet weak var activityIndicator: UIActivityIndicatorView!
//  @IBOutlet weak var videosCollectionView: UICollectionView!
//  @IBOutlet weak var cancelBtn: UIButton!
//  @IBOutlet weak var uploadBtn: UIButton!
//  
//  var selectedAlbum: PHAssetCollection?
//  var videoAssets: [PHAsset] = []
//  var selectedVideoAssets:[PHAsset] = []
//  var singleSelectedVideoAsset:PHAsset? = nil
//  var selectedDict:Array<Dictionary<String,Any>> = []
//  var previousIndexSelected:IndexPath = IndexPath(row: -1, section: -1)
//  override func viewDidLoad() {
//    super.viewDidLoad()
//    
//    videosCollectionView.dataSource = self
//    videosCollectionView.delegate = self
//    //    videosCollectionView.allowsMultipleSelectionDuringEditing = true
//    //    videosCollectionView.isEditing = true
//    fetchVideoAssets()
//  }
//  
//  @IBAction func cancelBtnTapped(_ sender: UIButton) {
//    
//    NotificationCenter.default.post(name: NSNotification.Name("videos"), object: self, userInfo: ["data": []])
//    self.dismiss(animated: true)
//  }
//  
//  @IBAction func uploadBtnTapped(_ sender: UIButton) {
//    print(selectedDict.count)
//    
//    NotificationCenter.default.post(name: NSNotification.Name("videos"), object: self, userInfo: ["data": self.selectedDict])
//    self.dismiss(animated: true)
//  }
//  
//  // MARK: - UICollectionViewDataSource
//  
//  func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
//    return videoAssets.count
//  }
//  
//  func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
//    let cell = collectionView.dequeueReusableCell(withReuseIdentifier: "VideoCollectionViewCell", for: indexPath) as! VideoCollectionViewCell
//    let asset = videoAssets[indexPath.item]
//    //    let isSelected = selectedVideoAssets.contains(asset)
//    let isSelected = self.singleSelectedVideoAsset == asset
//    cell.updateSelectionStatus(isSelected: !isSelected)
//    
//    loadVideoThumbnailForAsset(asset, into: cell.thumbnailImageView)
//    
//    return cell
//  }
//  
//  // MARK: - UICollectionViewDelegate
//  func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
//    print("i am here ")
//    let selectedAsset = videoAssets[indexPath.item]
//    
//    PHImageManager.default().requestAVAsset(forVideo: selectedAsset, options: nil) { (avAsset, _, _) in
//      DispatchQueue.main.async {
//        guard let videoURL = (avAsset as? AVURLAsset)?.url else { return }
//        let fileSize = self.getFileSize(url: videoURL)
//        
//        if fileSize > 200 { // Size in MB
//          // Video is larger than 200MB. Show alert and do not append.
//          self.showAlertForLargeFile()
//          self.singleSelectedVideoAsset = nil
//        } else {
//          // Proceed with selection or deselection.
//          if self.singleSelectedVideoAsset == selectedAsset {
//            self.singleSelectedVideoAsset = nil
//          } else {
//            self.singleSelectedVideoAsset = selectedAsset
//            if self.previousIndexSelected != indexPath{
//              collectionView.reloadItems(at: [self.previousIndexSelected])
//              self.previousIndexSelected = indexPath
//            }
//            self.addVideoToSelectedDict(with: videoURL, fileSize: fileSize)
//          }
//          print(fileSize,"reached here")
//          // Update UI for the selected cell.
//          
//          collectionView.reloadItems(at: [indexPath,self.previousIndexSelected])
//          
//          let isSelected = (selectedAsset == self.singleSelectedVideoAsset)
//          self.lblCount.text = isSelected ? "1" : "0"
//          //                  if let cell = collectionView.cellForItem(at: indexPath) as? VideoCollectionViewCell {
//          //                      let isSelected = (selectedAsset == self.singleSelectedVideoAsset)
//          //                      cell.updateSelectionStatus(isSelected: !isSelected)
//          //                      self.lblCount.text = isSelected ? "1" : "0"
//          //                  }
//        }
//      }
//    }
//  }
//  
//  func collectionView(_ collectionView: UICollectionView, didDeselectItemAt indexPath: IndexPath) {
//    let selectedAsset = videoAssets[indexPath.item]
//    
//    PHImageManager.default().requestAVAsset(forVideo: selectedAsset, options: nil) { (avAsset, _, _) in
//      DispatchQueue.main.async {
//        guard let videoURL = (avAsset as? AVURLAsset)?.url else { return }
//        let fileSize = self.getFileSize(url: videoURL)
//        
//        // Proceed with selection or deselection.
//        if fileSize > 200 { // Size in MB
//          // Video is larger than 200MB. Show alert and do not append.
//          self.showAlertForLargeFile()
//          self.singleSelectedVideoAsset = nil
//        } else {
//          if self.singleSelectedVideoAsset == selectedAsset {
//            self.singleSelectedVideoAsset = nil
//          } else {
//            self.singleSelectedVideoAsset = selectedAsset
//            if self.previousIndexSelected != indexPath{
//              collectionView.reloadItems(at: [self.previousIndexSelected])
//              self.previousIndexSelected = indexPath
//            }
//            
//            
//            self.addVideoToSelectedDict(with: videoURL, fileSize: fileSize)
//          }
//          
//          print(fileSize,"reached here")
//          // Update UI for the selected cell.
//          collectionView.reloadItems(at: [indexPath])
//          let isSelected = (selectedAsset == self.singleSelectedVideoAsset)
//          self.lblCount.text = isSelected ? "1" : "0"
//          //            if let cell = collectionView.cellForItem(at: indexPath) as? VideoCollectionViewCell {
//          //              let isSelected = (selectedAsset == self.singleSelectedVideoAsset)
//          //              cell.updateSelectionStatus(isSelected: !isSelected)
//          //              self.lblCount.text = isSelected ? "1" : "0"
//          //            }
//        }
//      }
//    }
//  }
//  
//  private func getFileSize(url: URL) -> Double {
//    do {
//      let resources = try url.resourceValues(forKeys:[.fileSizeKey])
//      let fileSize = resources.fileSize ?? 0
//      return Double(fileSize) / (1024 * 1024) // Convert to MB
//    } catch {
//      print("Error: \(error)")
//      return 0
//    }
//  }
//  
//  private func addVideoToSelectedDict(with videoURL: URL, fileSize: Double) {
//    let fileNameWithoutExtension = videoURL.deletingPathExtension().lastPathComponent
//    if let mimeType = getMimeType(forFileExtension: videoURL.pathExtension) {
//      let dict: Dictionary<String,Any> = [
//        "name": fileNameWithoutExtension,
//        "originalUri": videoURL.absoluteString,
//        "type": mimeType,
//        "size": fileSize
//      ]
//      self.selectedDict = []
//      self.selectedDict.append(dict)
//      print("Selected Video URL: \(dict)")
//    }
//  }
//  
//  private func showAlertForLargeFile() {
//    // Assuming you have a UIViewController extension or access to present an alert
//    let alertController = UIAlertController(title: "File Size Limit Exceeded", message: "The selected video is larger than 200MB and cannot be added.", preferredStyle: .alert)
//    alertController.addAction(UIAlertAction(title: "OK", style: .default, handler: nil))
//    // Replace `self` with your view controller if needed
//    DispatchQueue.main.async {
//      self.present(alertController, animated: true)
//    }
//  }
//  
//  
//  
//  
//  
//  
//  
//  
//  //  func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
//  //
//  //    let selectedAsset = videoAssets[indexPath.item]
//  //
//  //
//  //    if let index = selectedVideoAssets.firstIndex(of: selectedAsset) {
//  //      print("removing in select")
//  //      selectedVideoAssets.remove(at: index)
//  //      let cell = collectionView.cellForItem(at: indexPath) as? VideoCollectionViewCell
//  //      let isSelected = selectedVideoAssets.contains(selectedAsset)
//  //      cell?.updateSelectionStatus(isSelected: !isSelected)
//  //
//  //      lblCount.text = String(selectedVideoAssets.count)
//  //    }
//  //    else{
//  //      print("Appending in select")
//  //      selectedVideoAssets.append(selectedAsset)
//  //      let cell = collectionView.cellForItem(at: indexPath) as? VideoCollectionViewCell
//  //      let isSelected = selectedVideoAssets.contains(selectedAsset)
//  //      cell?.updateSelectionStatus(isSelected: !isSelected)
//  //
//  //      lblCount.text = String(selectedVideoAssets.count)
//  //    }
//  //    PHImageManager.default().requestAVAsset(forVideo: selectedAsset, options: nil) { (avAsset, _, _) in
//  //      if let videoURL = (avAsset as? AVURLAsset)?.url {
//  //        // You can use videoURL to play or further process the selected video.
//  //
//  //        let fileName = videoURL.lastPathComponent
//  //        let fileNameWithoutExtension = URL(fileURLWithPath: fileName).deletingPathExtension().lastPathComponent
//  //        if let mimeType = self.getMimeType(forFileExtension: videoURL.pathExtension) {
//  //          print(fileName,mimeType)
//  //
//  //          let dict: Dictionary<String,Any> = [
//  //            "name": fileNameWithoutExtension,
//  //            "originalUri": videoURL.absoluteString,
//  //            "type": mimeType
//  //          ]
//  //          self.selectedDict.append(dict)
//  //          print("Selected Video URL: \(dict)")
//  //          do {
//  //            let attributes = try FileManager.default.attributesOfItem(atPath: videoURL.path)
//  //            if let fileSize = attributes[.size] as? Int64 {
//  //              // File size in bytes
//  //              let fileSizeInMB = Double(fileSize) / (1024 * 1024) // Convert to MB
//  //              print("File Size: \(fileSizeInMB) MB")
//  //            }
//  //          } catch {
//  //            print("Error: \(error)")
//  //          }
//  //
//  //        }
//  //      }
//  //    }
//  //  }
//  
//  func getMimeType(forFileExtension fileExtension: String) -> String? {
//    if let uti = UTTypeCreatePreferredIdentifierForTag(kUTTagClassFilenameExtension, fileExtension as CFString, nil)?.takeRetainedValue() {
//      if let mimeType = UTTypeCopyPreferredTagWithClass(uti, kUTTagClassMIMEType)?.takeRetainedValue() {
//        return mimeType as String
//      }
//    }
//    return nil
//  }
//  
//  
//  //  func collectionView(_ collectionView: UICollectionView, didDeselectItemAt indexPath: IndexPath) {
//  //    let selectedAsset = videoAssets[indexPath.item]
//  //
//  //    if let index = selectedVideoAssets.firstIndex(of: selectedAsset) {
//  //      print("removing in Deselect")
//  //      selectedVideoAssets.remove(at: index)
//  //      let cell = collectionView.cellForItem(at: indexPath) as? VideoCollectionViewCell
//  //      let isSelected = selectedVideoAssets.contains(selectedAsset)
//  //      cell?.updateSelectionStatus(isSelected: !isSelected)
//  //      lblCount.text = String(selectedVideoAssets.count)
//  //    }
//  //    else{
//  //      print("Appending in Deselect")
//  //      selectedVideoAssets.append(selectedAsset)
//  //      let cell = collectionView.cellForItem(at: indexPath) as? VideoCollectionViewCell
//  //      let isSelected = selectedVideoAssets.contains(selectedAsset)
//  //      cell?.updateSelectionStatus(isSelected: !isSelected)
//  //      lblCount.text = String(selectedVideoAssets.count)
//  //    }
//  //  }
//  
//  
//  
//  // MARK: - UICollectionViewDelegateFlowLayout
//  
//  
//  func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
//    let screenWidth =  UIScreen.main.bounds.width / 3.2
//    return CGSize(width: screenWidth, height: screenWidth)
//  }
//  
//  // MARK: - Helper Methods
//  
//  func fetchVideoAssets() {
//    guard let selectedAlbum = selectedAlbum else {
//      return
//    }
//    
//    let fetchOptions = PHFetchOptions()
//    fetchOptions.predicate = NSPredicate(format: "mediaType == %d", PHAssetMediaType.video.rawValue)
//    fetchOptions.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
//    
//    let albumAssets = PHAsset.fetchAssets(in: selectedAlbum, options: fetchOptions)
//    
//    albumAssets.enumerateObjects { (asset, _, _) in
//      self.videoAssets.append(asset)
//    }
//    
//    videosCollectionView.reloadData()
//    activityIndicator.stopAnimating()
//  }
//  
//  func loadVideoThumbnailForAsset(_ asset: PHAsset, into imageView: UIImageView) {
//    let imageManager = PHImageManager.default()
//    let requestOptions = PHImageRequestOptions()
//    requestOptions.isSynchronous = false
//    requestOptions.deliveryMode = .fastFormat
//    
//    imageManager.requestImage(for: asset, targetSize: CGSize(width: 70, height: 70), contentMode: .aspectFill, options: requestOptions) { (image, _) in
//      imageView.image = image
//    }
//  }
//}
//
//class VideoCollectionViewCell: UICollectionViewCell {
//  @IBOutlet weak var thumbnailImageView: UIImageView!
//  @IBOutlet weak var tick: UIImageView!
//  
//  func updateSelectionStatus(isSelected:Bool){
//    tick.isHidden = isSelected
//  }
//}
