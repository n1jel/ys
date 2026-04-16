////
////  CollectionViewController.swift
////  customGalleryDemo
////
////  Created by John on 30/01/24.
////
//
//import UIKit
//import Photos
//import ImageIO
//import AWSS3
//class CollectionViewController: UIViewController, UICollectionViewDataSource, UICollectionViewDelegate,UICollectionViewDelegateFlowLayout {
//  
//  var pickerParameters: PickerParameters?
//  
//  
//  func getImageTimestamp(from image: UIImage) -> Date? {
//    if let cgImage = image.cgImage,
//       let source = CGImageSourceCreateWithData(image.jpegData(compressionQuality: 1.0) as! CFData, nil),
//       let imageProperties = CGImageSourceCopyPropertiesAtIndex(source, 0, nil) as? [CFString: Any],
//       let dateTimeOriginal = imageProperties[kCGImagePropertyExifDateTimeOriginal] as? String {
//      let dateFormatter = DateFormatter()
//      dateFormatter.dateFormat = "yyyy:MM:dd HH:mm:ss"
//      if let date = dateFormatter.date(from: dateTimeOriginal) {
//        return date
//      }
//    }
//    return nil
//  }
//  
//  @IBOutlet weak var activityIndicator: UIActivityIndicatorView!
//  @IBOutlet weak var photosCollectionView: UICollectionView!
//  var selectedItems: Array<Dictionary<String,Any>> = [[:]]
//  var data:[Data] = []
//  var selectedItemsOriginal: Array<Dictionary<String,Any>> = [[:]]
//  let s3UploadManager = S3UploadManager.shared
//  var dictToSend: Array<Dictionary<String,Any>> = [[:]]
//  @IBOutlet weak var lblCount: UILabel!
//  @IBOutlet weak var selectionDone: UIButton!
//  var selectedAlbum: PHAssetCollection?
//  var totalAssetCount:Int?
//  var selectedAlbumAssets: [PHAsset] = []
//  var selectedImageAssets:[PHAsset] = []
//  var originalBase64Images:[String] = []
//  var fileUrl:[String]=[]
//  var isFetchingAssets = false
//  var currentPage = 0
//    let itemsPerPage = 60
//  var fetchResult: PHFetchResult<PHAsset>?
//  var totalPages = 0
//  override func viewDidLoad() {
//    super.viewDidLoad()
//    
//    totalPages = (totalAssetCount ?? 0 + itemsPerPage - 1) / itemsPerPage
//    if let selectedAlbum = selectedAlbum {
//      self.fetchResult = PHAsset.fetchAssets(in: selectedAlbum, options: nil)
//    }
//    s3UploadManager.pickerParameters = pickerParameters
//    photosCollectionView.dataSource = self
//    photosCollectionView.delegate = self
//    photosCollectionView.allowsMultipleSelectionDuringEditing = true
//    photosCollectionView.isEditing = true
////    if let selectedAlbum = selectedAlbum {
////      selectedAlbumAssets = fetchAssetsFromAlbum(album: selectedAlbum).reversed().filter{$0.mediaType != .video}
////    }
//    fetchAssetsForCurrentPage()
//    
//  }
//  
//  
//
////  func fetchAssetsForCurrentPage() {
////    
////    if selectedAlbumAssets.count >= totalAssetCount ?? 0 {
////      return
////    }
////      guard !isFetchingAssets else { return }
////      isFetchingAssets = true
////      
////      let startIndex = currentPage * itemsPerPage
////      let endIndex = (currentPage + 1) * itemsPerPage
////      
////    let fetchedAssets = fetchAssetsFromAlbum1(album: selectedAlbum!, startIndex: startIndex, fetchLimit: itemsPerPage).filter{$0.mediaType != .video}
////      
////      selectedAlbumAssets.append(contentsOf: fetchedAssets)
////      
////      photosCollectionView.reloadData()
////      
////    currentPage += 1
////    isFetchingAssets = false
////  }
//  
//  
////  func fetchAssetsForCurrentPage() {
////    if let total = totalAssetCount{
////      guard !isFetchingAssets else { return }
////      guard currentPage < totalPages else {
////        // All pages have been fetched
////        return
////      }
////      
////      isFetchingAssets = true
////      
////      let startIndex = currentPage * itemsPerPage
////      let endIndex = min(startIndex + itemsPerPage, total)
////      
////      let fetchedAssets = fetchAssetsFromAlbum1(album: selectedAlbum!, startIndex: startIndex, fetchLimit: itemsPerPage)
////      selectedAlbumAssets.append(contentsOf: fetchedAssets)
////      photosCollectionView.reloadData()
////      
////      currentPage += 1
////      isFetchingAssets = false
////    }
////  }
//  
//  
//  func fetchAssetsForCurrentPage() {
//      if let total = totalAssetCount {
//          guard !isFetchingAssets else { return }
//          guard currentPage < totalPages else {
//              // All pages have been fetched
//              return
//          }
//          
//          isFetchingAssets = true
//          
//          let startIndex = currentPage * itemsPerPage
//          let endIndex = min(startIndex + itemsPerPage, total)
//          
//          let fetchedAssets = fetchAssetsFromAlbum1(album: selectedAlbum!, startIndex: startIndex, fetchLimit: itemsPerPage)
//          
//          // Determine the indexes of items to insert or update
//          let startIndexForInsertion = selectedAlbumAssets.count
//          let endIndexForInsertion = startIndexForInsertion + fetchedAssets.count
//          
//          // Append fetched assets to the collection
//          selectedAlbumAssets.append(contentsOf: fetchedAssets)
//          
//          // Prepare index paths for insertion
//          let indexPathsForInsertion = (startIndexForInsertion..<endIndexForInsertion).map { IndexPath(item: $0, section: 0) }
//          
//          // Perform insertion or updating
//          if currentPage == 0 {
//              photosCollectionView.reloadData() // Reload if it's the first page
//          } else {
//              photosCollectionView.performBatchUpdates({
//                  photosCollectionView.insertItems(at: indexPathsForInsertion)
//              }, completion: nil)
//          }
//          
//          currentPage += 1
//          isFetchingAssets = false
//      }
//  }
//
//  
//  
////  func fetchAssetsFromAlbum1(album: PHAssetCollection, startIndex: Int, fetchLimit: Int) -> [PHAsset] {
////        var assets: [PHAsset] = []
////    
////    if let fetchResult =  fetchResult{
////      let endIndex = min(startIndex + fetchLimit, fetchResult.count)
////      print(startIndex,"here")
////     print(endIndex,"here")
////      let indexSet = IndexSet(integersIn: startIndex..<endIndex)
////      let filteredAssets = fetchResult.objects(at: indexSet)
////      
////      assets.append(contentsOf: filteredAssets)
////    }
////      
////        
////        return assets
////    }
//  
//  func fetchAssetsFromAlbum1(album: PHAssetCollection, startIndex: Int, fetchLimit: Int) -> [PHAsset] {
//      var assets: [PHAsset] = []
//      if let fetchResult =  fetchResult {
//          let endIndex = max(fetchResult.count - startIndex, 0)
//          let startIndex = max(fetchResult.count - (startIndex + fetchLimit), 0)
//          let indexSet = IndexSet(integersIn: startIndex..<endIndex)
//          let filteredAssets = fetchResult.objects(at: indexSet)
//        assets.append(contentsOf: filteredAssets.reversed().filter { $0.mediaType != .video })
//      }
//          
//      return assets
//  }
//
//  // MARK: - UICollectionViewDataSource
//  
//  func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
//    return selectedAlbumAssets.count
//  }
//  @IBAction func actionSelectionDone(_ sender: UIButton) {
//    print("Button Clicked")
//    self.activityIndicator.startAnimating()
//    NotificationCenter.default.post(name: NSNotification.Name("ImagesUpdated"), object: self, userInfo: ["originalImages": [],"smallImages":[]])
//    
//    let dict: Dictionary<String,Any> = [
//      "name": "inside  upload Section",
//      "data": ""
//    ]
//    NotificationCenter.default.post(name: NSNotification.Name("fireEvent"), object: self, userInfo: ["data": [dict]])
//    
//    self.s3UploadManager.assets = selectedImageAssets
//    self.s3UploadManager.startUpload() {
//      DispatchQueue.main.async {
//               self.activityIndicator.stopAnimating()
//               self.dismiss(animated: true)
//             }
//    }
//  }
//  
//  func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
//    let cell = collectionView.dequeueReusableCell(withReuseIdentifier: "PhotoCell", for: indexPath) as! PhotoCollectionViewCell
//    let asset = selectedAlbumAssets[indexPath.item]
//    
//    loadImageForAsset(asset, into: cell.imageView)
//    
//    let isSelected = selectedImageAssets.contains(asset)
//    
//    cell.updateSelectionStatus(isSelected: !isSelected)
//    return cell
//  }
//  
//  func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
//    let asset = selectedAlbumAssets[indexPath.item]
//    selectedImageAssets.append(asset)
//    let cell = collectionView.cellForItem(at: indexPath) as? PhotoCollectionViewCell
//    cell?.updateSelectionStatus(isSelected: !selectedImageAssets.contains(asset))
//    lblCount.text = String(selectedImageAssets.count)
//  }
//  
//  
//  func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
//    let screenWidth =  UIScreen.main.bounds.width / 3.2
//    return CGSize(width: screenWidth, height: screenWidth)
//  }
//  
//  
//  func collectionView(_ collectionView: UICollectionView, didDeselectItemAt indexPath: IndexPath) {
//    let asset = selectedAlbumAssets[indexPath.item]
//    if let index = selectedImageAssets.firstIndex(of: asset) {
//      selectedImageAssets.remove(at: index)
//    }
//    let cell = collectionView.cellForItem(at: indexPath) as? PhotoCollectionViewCell
//    cell?.updateSelectionStatus(isSelected: !selectedImageAssets.contains(asset))
//    lblCount.text = String(selectedImageAssets.count)
//  }
//  
//  // MARK: - Helper Methods
//  
//  func fetchAssetsFromAlbum(album: PHAssetCollection) -> [PHAsset] {
//    var assets: [PHAsset] = []
//    let albumAssets = PHAsset.fetchAssets(in: album, options: nil)
//    
//    albumAssets.enumerateObjects { (asset,index , _) in
//      assets.append(asset)
//    }
//    return assets
//  }
//  
//  
//  func loadImageForAsset(_ asset: PHAsset, into imageView: UIImageView) {
//    let imageManager = PHImageManager.default()
//    let requestOptions = PHImageRequestOptions()
//    requestOptions.isSynchronous = false
//    requestOptions.deliveryMode = .highQualityFormat
//    
//    imageManager.requestImage(for: asset, targetSize: CGSize(width: 100, height: 100), contentMode: .aspectFill, options: requestOptions) { [self] (image, _) in
//      imageView.image = image
//    }
//  }
//  
//
//  
//  @IBAction func cancelButtom(_ sender: UIButton) {
//    NotificationCenter.default.post(name: NSNotification.Name("ImagesUpdated"), object: self, userInfo: ["originalImages": [],"smallImages":[]])
//    NotificationCenter.default.post(name: NSNotification.Name("fireEvent"), object: self, userInfo: ["data":[[
//      "name": "Cancel Pressed",
//      "data": self.dictToSend.count
//    ] ]])
//    self.dismiss(animated: true)
//  }
//  
//  
//}
//
//class PhotoCollectionViewCell: UICollectionViewCell {
//  @IBOutlet weak var imageView: UIImageView!
//  @IBOutlet weak var tick: UIImageView!
//  
//  func   updateSelectionStatus(isSelected:Bool){
//    tick.isHidden = isSelected
//  }
//}
//
//
//
//
//
//
//extension CollectionViewController: UIScrollViewDelegate {
//    func scrollViewDidScroll(_ scrollView: UIScrollView) {
//        let offsetY = scrollView.contentOffset.y
//        let contentHeight = scrollView.contentSize.height
//        let screenHeight = scrollView.frame.size.height
//        
//        if offsetY > contentHeight - screenHeight {
//            fetchAssetsForCurrentPage()
//        }
//    }
//    
//
//}
//
//
//
//
//////
//////  CollectionViewController.swift
//////  customGalleryDemo
//////
//////  Created by John on 30/01/24.
//////
////
////import UIKit
////import Photos
////import ImageIO
////import AWSS3
////class CollectionViewController: UIViewController, UICollectionViewDataSource, UICollectionViewDelegate,UICollectionViewDelegateFlowLayout {
////
////  var pickerParameters: PickerParameters?
////
////
////    func getImageTimestamp(from image: UIImage) -> Date? {
////        if let cgImage = image.cgImage,
////            let source = CGImageSourceCreateWithData(image.jpegData(compressionQuality: 1.0) as! CFData, nil),
////            let imageProperties = CGImageSourceCopyPropertiesAtIndex(source, 0, nil) as? [CFString: Any],
////            let dateTimeOriginal = imageProperties[kCGImagePropertyExifDateTimeOriginal] as? String {
////            let dateFormatter = DateFormatter()
////            dateFormatter.dateFormat = "yyyy:MM:dd HH:mm:ss"
////            if let date = dateFormatter.date(from: dateTimeOriginal) {
////                return date
////            }
////        }
////        return nil
////    }
////
////    @IBOutlet weak var activityIndicator: UIActivityIndicatorView!
////    @IBOutlet weak var photosCollectionView: UICollectionView!
////  var selectedItems: Array<Dictionary<String,Any>> = [[:]]
////  var data:[Data] = []
////  var selectedItemsOriginal: Array<Dictionary<String,Any>> = [[:]]
////  let s3UploadManager = S3UploadManager.shared
////  var dictToSend: Array<Dictionary<String,Any>> = [[:]]
////    @IBOutlet weak var lblCount: UILabel!
////    @IBOutlet weak var selectionDone: UIButton!
////    var selectedAlbum: PHAssetCollection?
////    var selectedAlbumAssets: [PHAsset] = []
////    var selectedImageAssets:[PHAsset] = []
////    var originalBase64Images:[String] = []
////    var fileUrl:[String]=[]
////    override func viewDidLoad() {
////        super.viewDidLoad()
////
////      s3UploadManager.pickerParameters = pickerParameters
////        photosCollectionView.dataSource = self
////        photosCollectionView.delegate = self
////        photosCollectionView.allowsMultipleSelectionDuringEditing = true
////        photosCollectionView.isEditing = true
////        if let selectedAlbum = selectedAlbum {
////          selectedAlbumAssets = fetchAssetsFromAlbum(album: selectedAlbum).reversed().filter{$0.mediaType != .video}
////        }
////
////
////    }
////
////    // MARK: - UICollectionViewDataSource
////
////    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
////        return selectedAlbumAssets.count
////    }
////    @IBAction func actionSelectionDone(_ sender: UIButton) {
////        print("Button Clicked")
////
//////      fetchImages(for: selectedImageAssets) { originalImage, smallImage in
//////        NotificationCenter.default.post(name: NSNotification.Name("ImagesUpdated"), object: self, userInfo: ["originalImages": self.selectedItemsOriginal,"smallImages":self.selectedItems])
//////        self.dismiss(animated: true)
//////      }
////      NotificationCenter.default.post(name: NSNotification.Name("ImagesUpdated"), object: self, userInfo: ["originalImages": [],"smallImages":[]])
////
////      let dict: Dictionary<String,Any> = [
////        "name": "inside  upload Section",
////        "data": ""
////      ]
////      NotificationCenter.default.post(name: NSNotification.Name("fireEvent"), object: self, userInfo: ["data": [dict]])
////
////      fetchImages(for: selectedImageAssets) { originalImage, smallImage in
////
//////        NotificationCenter.default.post(name: NSNotification.Name("fireEvent"), object: self, userInfo: ["data":[[
//////          "name": "Funtionality of block is done Now Throwing the data through Notification with length of array in data",
//////          "data": self.dictToSend.count
//////        ] ]])
//////
//////        self.activityIndicator.stopAnimating()
//////        NotificationCenter.default.post(name: NSNotification.Name("fireEvent"), object: self, userInfo: ["data": self.dictToSend])
//////
//////        NotificationCenter.default.post(name: NSNotification.Name("ImagesUpdated"), object: self, userInfo: ["originalImages": self.dictToSend,"smallImages":self.dictToSend])
//////        self.dismiss(animated: true)
////
////
////        self.s3UploadManager.startUpload {
////                   // Completion handler - called when all images have been uploaded and API call has been made
////
////          self.dismiss(animated: true)
////                   // Perform any UI updates or other tasks as needed
////               }
////
////
////
////               // Start the upload process
////
////      }
////
////
////    }
////
////    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
////        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: "PhotoCell", for: indexPath) as! PhotoCollectionViewCell
////        let asset = selectedAlbumAssets[indexPath.item]
////
////        loadImageForAsset(asset, into: cell.imageView)
////
////        let isSelected = selectedImageAssets.contains(asset)
////
////        cell.updateSelectionStatus(isSelected: !isSelected)
////        //        if (selectedImageAssets.contains(asset)){
////        //            cell.tick.isHidden = false
////        //        }
////        //        else
////        //        {
////        //            cell.tick.isHidden = true
////        //        }
////        return cell
////    }
////
////    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
////
//////        if selectedImageAssets.count >= 200 {
//////                   // Maximum selection limit reached, inform the user
//////                   let alertController = UIAlertController(title: "Selection Limit Reached", message: "You can only select up to \(200) images.", preferredStyle: .alert)
//////                   alertController.addAction(UIAlertAction(title: "OK", style: .default, handler: nil))
//////                   present(alertController, animated: true, completion: nil)
//////                   return
//////               }
//////        else{
////            let asset = selectedAlbumAssets[indexPath.item]
//////            if let index = selectedImageAssets.firstIndex(of: asset) {
//////                selectedImageAssets.remove(at: index)
//////            } else {
////                selectedImageAssets.append(asset)
//////            }
////            let cell = collectionView.cellForItem(at: indexPath) as? PhotoCollectionViewCell
////            cell?.updateSelectionStatus(isSelected: !selectedImageAssets.contains(asset))
////            lblCount.text = String(selectedImageAssets.count)
//////        }
////
////
////    }
////
////
////  func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
////    let screenWidth =  UIScreen.main.bounds.width / 3.2
////        return CGSize(width: screenWidth, height: screenWidth)
////    }
////
//////
//////  func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, minimumLineSpacingForSectionAt section: Int) -> CGFloat {
//////    return 4.0
//////  }
//////
//////  func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, minimumInteritemSpacingForSectionAt section: Int) -> CGFloat {
//////    return 4.0
//////  }
////    func collectionView(_ collectionView: UICollectionView, didDeselectItemAt indexPath: IndexPath) {
////        let asset = selectedAlbumAssets[indexPath.item]
////        if let index = selectedImageAssets.firstIndex(of: asset) {
////            selectedImageAssets.remove(at: index)
////        }
//////        else {
//////            selectedImageAssets.append(asset)
//////        }
////        let cell = collectionView.cellForItem(at: indexPath) as? PhotoCollectionViewCell
////        cell?.updateSelectionStatus(isSelected: !selectedImageAssets.contains(asset))
////        lblCount.text = String(selectedImageAssets.count)
////    }
////
////    // MARK: - Helper Methods
////
////    func fetchAssetsFromAlbum(album: PHAssetCollection) -> [PHAsset] {
////        var assets: [PHAsset] = []
////        let albumAssets = PHAsset.fetchAssets(in: album, options: nil)
////
////        albumAssets.enumerateObjects { (asset,index , _) in
////            assets.append(asset)
////        }
////        return assets
////    }
////
////  func uploadImageDataToS3(imageData: Data, bucketName: String, objectKey: String, contentType: String) {
////      // Create an instance of AWSS3TransferUtility
////
////    print("Upload Progress: ")
////      let transferUtility = AWSS3TransferUtility.default()
////
////      // Configure the transfer utility
////      let expression = AWSS3TransferUtilityUploadExpression()
////      expression.progressBlock = {(task, progress) in
////          // Handle progress updates
////          print("Upload Progress: \(progress.fractionCompleted)")
////      }
////
////      // Create an AWSS3TransferUtilityUploadTask
////      let uploadCompletionHandler: AWSS3TransferUtilityUploadCompletionHandlerBlock = { (task, error) -> Void in
////          if let error = error {
////              // Handle error
////              print("Error uploading image data: \(error)")
////          } else {
////              // Image data uploaded successfully
////              print("Image data uploaded successfully")
////          }
////      }
////
////      transferUtility.uploadData(imageData,
////                                 bucket: bucketName,
////                                 key: objectKey,
////                                 contentType: contentType,
////                                 expression: expression,
////                                 completionHandler: uploadCompletionHandler).continueWith { (task) -> Any? in
////          if let error = task.error {
////              // Handle error
////              print("Error uploading image data: \(error)")
////          }
////          if task.result != nil {
////              // Image data uploaded successfully
////              print("Image data uploaded successfully")
////          }
////          return nil
////      }
////  }
////
////    func loadImageForAsset(_ asset: PHAsset, into imageView: UIImageView) {
//////        if asset.mediaType == .video {
//////            print("i am video")
//////        }
////        let imageManager = PHImageManager.default()
////        let requestOptions = PHImageRequestOptions()
////        requestOptions.isSynchronous = false
////        requestOptions.deliveryMode = .highQualityFormat
////
////        imageManager.requestImage(for: asset, targetSize: CGSize(width: 100, height: 100), contentMode: .aspectFill, options: requestOptions) { [self] (image, _) in
////
////
////            imageView.image = image
////        }
////    }
////
////
////
////
////    func fetchOriginalImages(for assets: [PHAsset], completion: @escaping ([Data?]) -> Void) {
////        activityIndicator.startAnimating()
////        var originalImagesData: [Data?] = []
////
////        let dispatchGroup = DispatchGroup()
////
////        for asset in assets {
////            dispatchGroup.enter()
////
////            PHImageManager.default().requestImageDataAndOrientation(for: asset, options: nil) { (imageData, _, _, _) in
////
////
////                if let image = imageData {
////
////                  self.saveDataAsImageFile(image) { fileURL,name  in
////                        if let url = fileURL ,let namee = name {
////
////                          let dict: Dictionary<String,Any> = [
////                            "name": namee,
////                            "uri": url.absoluteString,
////                            "type": "image/jpeg"
////                          ]
////
////                          self.fileUrl.append(url.absoluteString)
////                          self.selectedItemsOriginal.append(dict)
////                        } else {
////                          print("Error in writing on file")
////                        }
////                    }
////
////                               }
////
////
////
////
////                if let base64 = imageData?.base64EncodedString(options: []){
////                    self.originalBase64Images.append(base64)
////                }
////
////                originalImagesData.append(imageData)
////                dispatchGroup.leave()
////            }
////        }
////
////        dispatchGroup.notify(queue: .main) {
////            completion(originalImagesData)
////        }
////    }
////
////
////
////
////
////  func fetchSmallImage(for assets: [PHAsset], completion: @escaping ([Data?]) -> Void) {
////    let imageManager = PHImageManager.default()
////    let requestOptions = PHImageRequestOptions()
////    requestOptions.isSynchronous = false
////    requestOptions.deliveryMode = .highQualityFormat
////      activityIndicator.startAnimating()
////      var originalImagesData: [Data?] = []
////
////      let dispatchGroup = DispatchGroup()
////
////      for asset in assets {
////          dispatchGroup.enter()
////
////        imageManager.requestImage(for: asset, targetSize: CGSize(width: 100, height: 100), contentMode: .aspectFill, options: requestOptions) { [self] (image, _) in
////
////          if let uiImage = image{
////            self.saveImageAsImageFile(uiImage, fileExtension: ".jpg", completion: { fileURL, name in
////              if let url = fileURL ,let namee = name {
////
////                let dict: Dictionary<String,Any> = [
////                  "name": namee,
////                  "uri": url.absoluteString,
////                  "type": "image/jpeg"
////                ]
////
////                self.fileUrl.append(url.absoluteString)
////                self.selectedItems.append(dict)
////              } else {
////                print("Error in writing on file")
////              }
////            })
////          }
////
////
//////          originalImagesData.append(imageData)
////          dispatchGroup.leave()
////        }
////
////
////
////
////
////
////
////
////
////
////
////      }
////
////      dispatchGroup.notify(queue: .main) {
////          completion(originalImagesData)
////      }
////  }
////
//////    func saveDataAsImageFile(_ data: Data, fileExtension: String = "jpg") -> URL? {
//////        // Generate a unique file name
//////        let dateFormatter = DateFormatter()
//////        dateFormatter.dateFormat = "yyyyMMddHHmmss"
//////        let uniqueFileName = dateFormatter.string(from: Date())
//////        let fileName = "\(uniqueFileName).\(fileExtension)"
//////
//////        // Get the documents directory URL
//////        if let documentsDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first {
//////            let fileURL = documentsDirectory.appendingPathComponent(fileName)
//////
//////            do {
//////                // Write the data as an image file
//////                try data.write(to: fileURL)
//////                return fileURL
//////            } catch {
//////                print("Error saving data as image file: \(error)")
//////            }
//////        }
//////
//////        return nil
//////    }
////
////
//////  func fetchImages(for assets: [PHAsset], completion: @escaping ([Data?], [Data?]) -> Void) {
//////    selectedItems = []
//////    selectedItemsOriginal = []
//////      activityIndicator.startAnimating()
//////      var originalImagesData: [Data?] = []
//////      var smallImagesData: [Data?] = []
//////
//////      let dispatchGroup = DispatchGroup()
//////
//////      for asset in assets {
//////          dispatchGroup.enter()
//////
//////        print(asset.localIdentifier,"Local identifier")
//////          PHImageManager.default().requestImageDataAndOrientation(for: asset, options: nil) { (imageData, _, _, _) in
//////
//////              if let image = imageData {
//////                  self.saveDataAsImageFile(image) { fileURL, name in
//////                      if let url = fileURL, let namee = name {
//////                          let dict2: Dictionary<String, Any> = [
//////                              "name": namee,
//////                              "uri": url.absoluteString,
//////                              "type": "image/jpeg",
//////                              "assetIdentifier":asset.localIdentifier
//////                          ]
//////
//////                          self.fileUrl.append(url.absoluteString)
//////                          self.selectedItemsOriginal.append(dict2)
//////                        dispatchGroup.leave()
//////                        print(dict2,"crestingggggggggg 22",self.selectedItemsOriginal)
//////                      } else {
//////                        dispatchGroup.leave()
//////                          print("Error in writing on file")
//////                      }
//////                  }
//////              }
////////              originalImagesData.append(imageData)
//////
//////          }
//////
//////          dispatchGroup.enter()
//////
//////          let imageManager = PHImageManager.default()
//////          let requestOptions = PHImageRequestOptions()
//////          requestOptions.isSynchronous = false
//////          requestOptions.deliveryMode = .highQualityFormat
//////
//////          imageManager.requestImage(for: asset, targetSize: CGSize(width: 100, height: 100), contentMode: .aspectFill, options: requestOptions) { [self] (image, _) in
//////
//////              if let uiImage = image {
//////                  self.saveImageAsImageFile(uiImage, fileExtension: ".jpg") { fileURL, name in
//////                      if let url = fileURL, let namee = name {
//////                          let dict: Dictionary<String, Any> = [
//////                              "name": namee,
//////                              "uri": url.absoluteString,
//////                              "type": "image/jpeg",
//////                              "assetIdentifier":asset.localIdentifier
//////                          ]
//////
//////                          self.fileUrl.append(url.absoluteString)
//////                          self.selectedItems.append(dict)
//////                        dispatchGroup.leave()
//////                        print(dict,"crestingggggggggg",self.selectedItems)
//////                      } else {
//////                          print("Error in writing on file")
//////                        dispatchGroup.leave()
//////                      }
//////                  }
//////              }
//////
//////              // smallImagesData.append(imageData)
////////              dispatchGroup.leave()
//////          }
//////      }
//////
//////      dispatchGroup.notify(queue: .main) {
//////
//////        self.selectedItemsOriginal.sort { ($0["assetIdentifier"] as! String) < ($1["assetIdentifier"] as! String) }
//////        self.selectedItems.sort { ($0["assetIdentifier"] as! String) < ($1["assetIdentifier"] as! String) }
//////
//////          completion(originalImagesData, smallImagesData)
//////      }
//////  }
////
////
////
////  func fetchImages(for assets: [PHAsset], completion: @escaping ([Data], [Data]) -> Void) {
////
////    NotificationCenter.default.post(name: NSNotification.Name("fireEvent"), object: self, userInfo: ["data":[[
////      "name": "started inside Fetch image block ",
////      "data": self.dictToSend.count
////    ]] ])
////      selectedItems = []
////      selectedItemsOriginal = []
////      activityIndicator.startAnimating()
////    dictToSend = []
////      var originalImagesData: [Dictionary<String, Any>] = []
////      var smallImagesData: [Dictionary<String, Any>] = []
////
////      // Array to store assets in the order they were provided
////      var orderedAssets: [PHAsset] = []
////
////      let dispatchGroup = DispatchGroup()
////
////      for asset in assets {
////          // Store the asset in the orderedAssets array
////          orderedAssets.append(asset)
////
////          dispatchGroup.enter()
////
////          PHImageManager.default().requestImageDataAndOrientation(for: asset, options: nil) { (imageData, _, _, _) in
////
////
////              if let image = imageData {
//////                self.data.append(image)
////                self.s3UploadManager.addImageDataToUpload(image)
////                dispatchGroup.leave()
//////                let bucketName = "yourseason"
//////                let objectKey = "gallery/test/\(asset.localIdentifier)" // The name of the file in S3
//////                let contentType = "image/jpeg" // Adjust the content type as needed
//////
//////                self.uploadImageDataToS3(imageData: image, bucketName: bucketName, objectKey: objectKey, contentType: contentType)
////
////
////
//////                  self.saveDataAsImageFile(image) { fileURL, name in
//////                      if let url = fileURL, let namee = name {
//////                          let dict: Dictionary<String, Any> = [
//////                              "assetIdentifier": asset.localIdentifier,
//////                              "name": namee,
//////                              "uri": url.absoluteString,
//////                              "type": "image/jpeg"
//////                          ]
//////
//////                          self.fileUrl.append(url.absoluteString)
//////                          self.selectedItemsOriginal.append(dict)
//////                          dispatchGroup.leave()
////////                          print(dict, "crestingggggggggg 22", self.selectedItemsOriginal)
//////                      } else {
//////                          dispatchGroup.leave()
//////                          print("Error in writing on file")
//////                      }
//////                  }
////              }
////          }
////
//////          dispatchGroup.enter()
//////
//////          let imageManager = PHImageManager.default()
//////          let requestOptions = PHImageRequestOptions()
//////          requestOptions.isSynchronous = false
//////          requestOptions.deliveryMode = .highQualityFormat
//////
//////          imageManager.requestImage(for: asset, targetSize: CGSize(width: 100, height: 100), contentMode: .aspectFill, options: requestOptions) { [self] (image, _) in
//////              if let uiImage = image {
//////                  self.saveImageAsImageFile(uiImage, fileExtension: ".jpg") { fileURL, name in
//////                      if let url = fileURL, let namee = name {
//////                          let dict: Dictionary<String, Any> = [
//////                              "assetIdentifier": asset.localIdentifier,
//////                              "name": namee,
//////                              "uri": url.absoluteString,
//////                              "type": "image/jpeg"
//////                          ]
//////
//////                          self.fileUrl.append(url.absoluteString)
//////                          self.selectedItems.append(dict)
//////                          dispatchGroup.leave()
////////                          print(dict, "crestingggggggggg", self.selectedItems)
//////                      } else {
//////                          print("Error in writing on file")
//////                          dispatchGroup.leave()
//////                      }
//////                  }
//////              }
//////          }
////      }
////
////      dispatchGroup.notify(queue: .main) {
////          // Sort both arrays based on the order of the assets
//////          let orderedOriginalImages = orderedAssets.compactMap { asset in
//////              return self.selectedItemsOriginal.first { ($0["assetIdentifier"] as! String) == asset.localIdentifier }
//////          }
//////
//////          let orderedSmallImages = orderedAssets.compactMap { asset in
//////              return self.selectedItems.first { ($0["assetIdentifier"] as! String) == asset.localIdentifier }
//////          }
//////
//////        print(orderedOriginalImages)
//////
//////
//////        NotificationCenter.default.post(name: NSNotification.Name("fireEvent"), object: self, userInfo: ["data":[[
//////          "name": "Notified in main before merging Arrays",
//////          "data": self.dictToSend.count
//////        ] ]])
//////
//////        self.dictToSend.append(contentsOf: self.mergeArrays(originalArray: orderedOriginalImages, smallerArray: orderedSmallImages))
//////
//////        NotificationCenter.default.post(name: NSNotification.Name("fireEvent"), object: self, userInfo: ["data":[[
//////          "name": "Notified in main After merging Arrays",
//////          "data": self.dictToSend.count
//////        ] ]])
////
//////          completion(orderedOriginalImages, orderedSmallImages)
////
////        completion(self.data, self.data)
////      }
////  }
////
////
////
////  @IBAction func cancelButtom(_ sender: UIButton) {
////    NotificationCenter.default.post(name: NSNotification.Name("ImagesUpdated"), object: self, userInfo: ["originalImages": [],"smallImages":[]])
////    NotificationCenter.default.post(name: NSNotification.Name("fireEvent"), object: self, userInfo: ["data":[[
////      "name": "Cancel Pressed",
////      "data": self.dictToSend.count
////    ] ]])
////    self.dismiss(animated: true)
////  }
////
////
////
////  func mergeArrays(originalArray: [Dictionary<String, Any>], smallerArray: [Dictionary<String, Any>]) -> [Dictionary<String, Any>] {
////      var mergedArray: [Dictionary<String, Any>] = []
////
////      // Create a dictionary for faster lookups
////      let smallerImageDict = Dictionary(uniqueKeysWithValues: smallerArray.map { ($0["assetIdentifier"] as! String, $0) })
////
////      for originalImageDict in originalArray {
////          var mergedDict = originalImageDict
////
////          if let assetIdentifier = originalImageDict["assetIdentifier"] as? String,
////             let smallerImageInfo = smallerImageDict[assetIdentifier] {
////              // Merge smaller image information
////              mergedDict["originalUri"] = mergedDict["uri"]
////              mergedDict["smallUri"] = smallerImageInfo["uri"]
////              mergedDict.removeValue(forKey: "uri")
////          }
////
////          mergedArray.append(mergedDict)
////      }
////
////      return mergedArray
////  }
////
////
////
////
////    func saveDataAsImageFile(_ data: Data, fileExtension: String = "jpg", completion: @escaping (URL?,String?) -> Void) {
////        DispatchQueue.global().async {
////            // Generate a unique file name
////            let dateFormatter = DateFormatter()
////            dateFormatter.dateFormat = "yyyyMMddHHmmss"
////          let uniqueFileName = String(Date().timeIntervalSince1970)
////            let fileName = "\(uniqueFileName).\(fileExtension)"
////
////            // Get the documents directory URL
////            if let documentsDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first {
////                let fileURL = documentsDirectory.appendingPathComponent(fileName)
////
////                do {
////                    // Write the data as an image file
////                    try data.write(to: fileURL)
////
////                  print(fileURL,"dsgdsgdsgds")
////                  print(uniqueFileName,"hjdsgfjdsf")
////
////                    DispatchQueue.main.async {
////                        completion(fileURL,uniqueFileName) // Notify the caller with the file URL on the main thread
////                    }
////                } catch {
////                    print("Error saving data as image file: \(error)")
////                    DispatchQueue.main.async {
////                      completion(nil, nil) // Notify the caller with nil in case of an error
////                    }
////                }
////            } else {
////                DispatchQueue.main.async {
////                    completion(nil,nil) // Notify the caller with nil if the documents directory is not available
////                }
////            }
////        }
////    }
////
////
////
////  func saveImageAsImageFile(_ image: UIImage, fileExtension: String = "jpg", completion: @escaping (URL?, String?) -> Void) {
////      DispatchQueue.global().async {
////          // Generate a unique file name
////          let dateFormatter = DateFormatter()
////          dateFormatter.dateFormat = "yyyyMMddHHmmss"
////          let uniqueFileName = String(Date().timeIntervalSince1970)
////          let fileName = "\(uniqueFileName).\(fileExtension)"
////
////          // Get the documents directory URL
////          if let documentsDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first {
////              let fileURL = documentsDirectory.appendingPathComponent(fileName)
////
////              if let imageData = image.jpegData(compressionQuality: 1.0) {
////                  do {
////                      // Write the image data as an image file
////                      try imageData.write(to: fileURL)
////                      DispatchQueue.main.async {
////                          completion(fileURL, uniqueFileName) // Notify the caller with the file URL and unique file name on the main thread
////                      }
////                  } catch {
////                      print("Error saving image as image file: \(error)")
////                      DispatchQueue.main.async {
////                          completion(nil, nil) // Notify the caller with nil in case of an error
////                      }
////                  }
////              } else {
////                  DispatchQueue.main.async {
////                      completion(nil, nil) // Notify the caller with nil if there's an issue with the image data
////                  }
////              }
////          } else {
////              DispatchQueue.main.async {
////                  completion(nil, nil) // Notify the caller with nil if the documents directory is not available
////              }
////          }
////      }
////  }
////
////
////    func fetchOriginalAssets(for assets: [PHAsset], completion: @escaping ([Data?]) -> Void) {
////        activityIndicator.startAnimating()
////        var originalAssetsData: [Data?] = []
////
////        let dispatchGroup = DispatchGroup()
////
////        for asset in assets {
////            dispatchGroup.enter()
////
////            if asset.mediaType == .video {
////                // Handle video asset
////                PHImageManager.default().requestAVAsset(forVideo: asset, options: nil) { (avAsset, _, _) in
////                    if let avAsset = avAsset as? AVURLAsset {
////                        do {
////                            let videoData = try Data(contentsOf: avAsset.url)
////                            originalAssetsData.append(videoData)
////                        } catch {
////                            originalAssetsData.append(nil)
////                        }
////                    } else {
////                        originalAssetsData.append(nil)
////                    }
////                    dispatchGroup.leave()
////                }
////            } else {
////                // Handle image asset
////                PHImageManager.default().requestImageDataAndOrientation(for: asset, options: nil) { (imageData, _, _, _) in
////                    if let imageData = imageData {
////                        originalAssetsData.append(imageData)
////                    } else {
////                        originalAssetsData.append(nil)
////                    }
////                    dispatchGroup.leave()
////                }
////            }
////        }
////
////        dispatchGroup.notify(queue: .main) {
////            completion(originalAssetsData)
////        }
////    }
////
////
////
////
////}
////
////class PhotoCollectionViewCell: UICollectionViewCell {
////    @IBOutlet weak var imageView: UIImageView!
////    @IBOutlet weak var tick: UIImageView!
////
////    func   updateSelectionStatus(isSelected:Bool){
////        tick.isHidden = isSelected
////    }
////}







import UIKit
import Photos
import ImageIO
import AWSS3
class CollectionViewController: UIViewController, UICollectionViewDataSource, UICollectionViewDelegate,UICollectionViewDelegateFlowLayout {
  
  var pickerParameters: PickerParameters?
  
  
  func getImageTimestamp(from image: UIImage) -> Date? {
    if let cgImage = image.cgImage,
       let source = CGImageSourceCreateWithData(image.jpegData(compressionQuality: 1.0) as! CFData, nil),
       let imageProperties = CGImageSourceCopyPropertiesAtIndex(source, 0, nil) as? [CFString: Any],
       let dateTimeOriginal = imageProperties[kCGImagePropertyExifDateTimeOriginal] as? String {
      let dateFormatter = DateFormatter()
      dateFormatter.dateFormat = "yyyy:MM:dd HH:mm:ss"
      if let date = dateFormatter.date(from: dateTimeOriginal) {
        return date
      }
    }
    return nil
  }
  
  @IBOutlet weak var activityIndicator: UIActivityIndicatorView!
  @IBOutlet weak var photosCollectionView: UICollectionView!
  var selectedItems: Array<Dictionary<String,Any>> = [[:]]
  var data:[Data] = []
  var selectedItemsOriginal: Array<Dictionary<String,Any>> = [[:]]
  let s3UploadManager = S3UploadManager.shared
  var dictToSend: Array<Dictionary<String,Any>> = [[:]]
  @IBOutlet weak var lblCount: UILabel!
  @IBOutlet weak var selectionDone: UIButton!
  var selectedAlbum: PHAssetCollection?
  var totalAssetCount:Int?
  var selectedAlbumAssets: [PHAsset] = []
  var selectedImageAssets:[PHAsset] = []
  var originalBase64Images:[String] = []
  var fileUrl:[String]=[]
  var isFetchingAssets = false
  var currentPage = 0
    let itemsPerPage = 30
  var fetchResult: PHFetchResult<PHAsset>?
  var totalPages = 0
  override func viewDidLoad() {
    super.viewDidLoad()
    
    print(pickerParameters, "imagecollectionpickerparameter")
    s3UploadManager.pickerParameters = pickerParameters
    photosCollectionView.dataSource = self
    photosCollectionView.delegate = self
    photosCollectionView.allowsMultipleSelectionDuringEditing = true
    photosCollectionView.isEditing = true
    totalPages = ((totalAssetCount ?? 0) + itemsPerPage - 1) / itemsPerPage
    print(totalPages)
    print(totalAssetCount)
    print(itemsPerPage)
    if let data = fetchResult{
      fetchAssetsForCurrentPage()
      print("already data here")
    }
    else{
      if let selectedAlbum = selectedAlbum {
        print("fetching data")
        self.fetchResult = PHAsset.fetchAssets(in: selectedAlbum, options: nil)
        fetchAssetsForCurrentPage()
      }
    }
//    fetchAssetsForCurrentPage()
    
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
          let startIndexForInsertion = selectedAlbumAssets.count
          let endIndexForInsertion = startIndexForInsertion + fetchedAssets.count
          
          // Append fetched assets to the collection
          selectedAlbumAssets.append(contentsOf: fetchedAssets)
          
          // Prepare index paths for insertion
          let indexPathsForInsertion = (startIndexForInsertion..<endIndexForInsertion).map { IndexPath(item: $0, section: 0) }
          
          // Perform insertion or updating
          if currentPage == 0 {
              photosCollectionView.reloadData() // Reload if it's the first page
          } else {
              photosCollectionView.performBatchUpdates({
                  photosCollectionView.insertItems(at: indexPathsForInsertion)
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
        assets.append(contentsOf: filteredAssets.reversed().filter { $0.mediaType != .video })
      }
          
      return assets
  }

  // MARK: - UICollectionViewDataSource
  
  func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
    return selectedAlbumAssets.count
  }
  @IBAction func actionSelectionDone(_ sender: UIButton) {
    print("Button Clicked")
    self.activityIndicator.startAnimating()
    NotificationCenter.default.post(name: NSNotification.Name("ImagesUpdated"), object: self, userInfo: ["originalImages": [],"smallImages":[]])
    
    let dict: Dictionary<String,Any> = [
      "name": "inside  upload Section",
      "data": ""
    ]
    NotificationCenter.default.post(name: NSNotification.Name("fireEvent"), object: self, userInfo: ["data": [dict]])
    
    self.s3UploadManager.assets = selectedImageAssets
    self.s3UploadManager.startUpload() {
      DispatchQueue.main.async {
               self.activityIndicator.stopAnimating()
               self.dismiss(animated: true)
             }
    }
  }
  
  func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
    let cell = collectionView.dequeueReusableCell(withReuseIdentifier: "PhotoCell", for: indexPath) as! PhotoCollectionViewCell
    let asset = selectedAlbumAssets[indexPath.item]
    
    loadImageForAsset(asset, into: cell.imageView)
    
    let isSelected = selectedImageAssets.contains(asset)
    
    cell.updateSelectionStatus(isSelected: !isSelected)
    return cell
  }
  
  func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
    let asset = selectedAlbumAssets[indexPath.item]
    selectedImageAssets.append(asset)
    let cell = collectionView.cellForItem(at: indexPath) as? PhotoCollectionViewCell
    cell?.updateSelectionStatus(isSelected: !selectedImageAssets.contains(asset))
    lblCount.text = String(selectedImageAssets.count)
  }
  
  
  func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
    let screenWidth =  UIScreen.main.bounds.width / 3.2
    return CGSize(width: screenWidth, height: screenWidth)
  }
  
  
  func collectionView(_ collectionView: UICollectionView, didDeselectItemAt indexPath: IndexPath) {
    let asset = selectedAlbumAssets[indexPath.item]
    if let index = selectedImageAssets.firstIndex(of: asset) {
      selectedImageAssets.remove(at: index)
    }
    let cell = collectionView.cellForItem(at: indexPath) as? PhotoCollectionViewCell
    cell?.updateSelectionStatus(isSelected: !selectedImageAssets.contains(asset))
    lblCount.text = String(selectedImageAssets.count)
  }
  
  // MARK: - Helper Methods
  
  func fetchAssetsFromAlbum(album: PHAssetCollection) -> [PHAsset] {
    var assets: [PHAsset] = []
    let albumAssets = PHAsset.fetchAssets(in: album, options: nil)
    
    albumAssets.enumerateObjects { (asset,index , _) in
      assets.append(asset)
    }
    return assets
  }
  
  
  func loadImageForAsset(_ asset: PHAsset, into imageView: UIImageView) {
    let imageManager = PHImageManager.default()
    let requestOptions = PHImageRequestOptions()
    requestOptions.isSynchronous = false
    requestOptions.deliveryMode = .highQualityFormat
    
    imageManager.requestImage(for: asset, targetSize: CGSize(width: 100, height: 100), contentMode: .aspectFill, options: requestOptions) { [self] (image, _) in
      imageView.image = image
    }
  }
  

  
  @IBAction func cancelButtom(_ sender: UIButton) {
    NotificationCenter.default.post(name: NSNotification.Name("ImagesUpdated"), object: self, userInfo: ["originalImages": [],"smallImages":[]])
    NotificationCenter.default.post(name: NSNotification.Name("fireEvent"), object: self, userInfo: ["data":[[
      "name": "Cancel Pressed",
      "data": self.dictToSend.count
    ] ]])
    self.dismiss(animated: true)
  }
  
  
}

class PhotoCollectionViewCell: UICollectionViewCell {
  @IBOutlet weak var imageView: UIImageView!
  @IBOutlet weak var tick: UIImageView!
  
  func   updateSelectionStatus(isSelected:Bool){
    tick.isHidden = isSelected
  }
  
  func updateUI(){
    imageView.layer.cornerRadius = 8
  }
}


extension CollectionViewController: UIScrollViewDelegate {
    func scrollViewDidScroll(_ scrollView: UIScrollView) {
        let offsetY = scrollView.contentOffset.y
        let contentHeight = scrollView.contentSize.height
        let screenHeight = scrollView.frame.size.height
        
        if offsetY > contentHeight - screenHeight {
            fetchAssetsForCurrentPage()
        }
    }
    

}


