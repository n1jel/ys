
import AWSS3
import Alamofire
import Photos
import CoreServices
class S3VideoUploadManager {
  private var uploadTasks: [AWSS3TransferUtilityUploadTask] = []
  private var apiRequests: [Request] = []
  var pickerParameters: PickerParameters?
  static let shared = S3VideoUploadManager()
  private var bucketName = "yourseason"
  private var mime_type = "image/jpeg"
  private var uploadedVideoKeys = [String]() // Array to store uploaded image keys
  var collectionID = ""
  var uploadedVideoKeysString = ""
  var cancelProcess = false
  var backgroundTask: UIBackgroundTaskIdentifier = .invalid
  var assets:[PHAsset] = []
  
  
  private init() {
    print("i am initialized")
    NotificationCenter.default.addObserver(self, selector: #selector(cancel(_:)), name: NSNotification.Name("cancel"), object: nil)
  }
  deinit {
    NotificationCenter.default.removeObserver(self)
  }
  
  @objc func cancel(_ notification: Notification) {
    print("cancelling")
    self.cancelProcess = true
    self.cancelAllS3Uploads()
    self.cancelAllAPIRequests()
    self.uploadedVideoKeys.removeAll()
    self.assets.removeAll()
    var count = self.assets.count
    let dict: Dictionary<String,Any> = [
      "name": "Uploading",
      "total": String(count),
      "completed":String(count),
      "remaining" : "0",
    ]
    NotificationCenter.default.post(name: NSNotification.Name("status"), object: self, userInfo: ["data": dict])
    print("Cancelling batches after current batch")
    UIApplication.shared.endBackgroundTask(backgroundTask)
    backgroundTask = .invalid
    DispatchQueue.main.asyncAfter(deadline: .now() + 3){
      self.cancelProcess = false
    }
  }
  
  func configure(bucketName: String, mime_type: String) {
    self.bucketName = bucketName
    self.mime_type = mime_type
  }
  
  
  
  
//  func startUpload(completion: @escaping () -> Void) {
//    backgroundTask = UIApplication.shared.beginBackgroundTask {
//      UIApplication.shared.endBackgroundTask(self.backgroundTask)
//      self.backgroundTask = .invalid
//    }
//
//    createCollection { [weak self] in
//      guard let self = self else { return }
//      completion()
//      let batchSize = 6 // Adjust based on your needs
//      let totalAssets = assets.count
//      let totalBatches = Int(ceil(Double(totalAssets) / Double(batchSize)))
//      var currentBatchIndex = 0
//
//
//      var uploadBatch: (() -> Void)!
//
//      uploadBatch = { [weak self] in
//        guard let self = self else { return }
//        print(totalBatches, "total batch index")
//        print(currentBatchIndex, "current batch index")
//        if currentBatchIndex < totalBatches {
//          let startIndex = currentBatchIndex * batchSize
//          let endIndex = min(startIndex + batchSize, totalAssets)
//          let batch = Array(assets[startIndex..<endIndex])
//          if self.cancelProcess {
//            self.cancelProcess = false
//            UIApplication.shared.endBackgroundTask(self.backgroundTask)
//            self.backgroundTask = .invalid
//            return
//          }
//          self.fetchImageDataForAssets(batch) { imageDataBatch in
//            if !(self.cancelProcess) {
//              self.uploadImagesBatch(imageDataBatch, startIndex: startIndex, bucketName: "yourseason", contentType: "image/jpeg") {
//                currentBatchIndex += 1
//                uploadBatch() // Now 'uploadBatch' can call itself
//
//              }
//            } else {
//              self.cancelProcess = false
//              print("Cancelling batches after current batch")
//              UIApplication.shared.endBackgroundTask(self.backgroundTask)
//              self.backgroundTask = .invalid
//            }
//          }
//        } else {
//          if self.cancelProcess {
//            self.cancelProcess = false
//            print("Cancelling updatecollection")
//            UIApplication.shared.endBackgroundTask(self.backgroundTask)
//            self.backgroundTask = .invalid
//            return
//          }
//
//
//          self.updateCollection {
//            DispatchQueue.main.async {
//              UIApplication.shared.endBackgroundTask(self.backgroundTask)
//              self.backgroundTask = .invalid
//            }
//          }
//
//        }
//      }
//
//      uploadBatch()
//    }
//  }
  
  
  
  fileprivate func toCreateCollection(collectiontype:String,_ completion: @escaping() -> Void) {
    print("upload started")
    
    let dict: Dictionary<String,Any> = [
      "name": "Uploading",
      "total": String(self.assets.count),
      "completed":String(self.uploadedVideoKeys.count),
      "remaining" : String((self.assets.count) - (self.uploadedVideoKeys.count)),
    ]
    NotificationCenter.default.post(name: NSNotification.Name("status"), object: self, userInfo: ["data": dict])
    
    backgroundTask = UIApplication.shared.beginBackgroundTask {
      UIApplication.shared.endBackgroundTask(self.backgroundTask)
      self.backgroundTask = .invalid
    }
    
    createCollection(type: collectiontype) { [weak self] in
      guard let self = self else { return }
      completion()
      let batchSize = 1 // Adjust based on your needs
      let totalAssets = assets.count
      let totalBatches = Int(ceil(Double(totalAssets) / Double(batchSize)))
      var currentBatchIndex = 0
      
      
      var uploadBatch: (() -> Void)!
      
      uploadBatch = { [weak self] in
        guard let self = self else { return }
        print(totalBatches, "total batch index")
        print(currentBatchIndex, "current batch index")
        if currentBatchIndex < totalBatches {
          let startIndex = currentBatchIndex * batchSize
          let endIndex = min(startIndex + batchSize, totalAssets)
          let batch = Array(assets[startIndex..<endIndex])
          if self.cancelProcess {
            self.cancelProcess = false
            UIApplication.shared.endBackgroundTask(self.backgroundTask)
            self.backgroundTask = .invalid
            return
          }
          self.fetchVideoAsset(batch) { urlDataBatch in
            if !(self.cancelProcess) {
              self.uploadVideosBatch(urlDataBatch, startIndex: startIndex, bucketName: "yourseason") {
                currentBatchIndex += 1
                uploadBatch()
              }
              //              self.uploadImagesBatch(imageDataBatch, startIndex: startIndex, bucketName: "yourseason", contentType: "image/jpeg") {
              //                currentBatchIndex += 1
              //                uploadBatch() // Now 'uploadBatch' can call itself
              //
              //              }
            } else {
              self.cancelProcess = false
              print("Cancelling batches after current batch")
              UIApplication.shared.endBackgroundTask(self.backgroundTask)
              self.backgroundTask = .invalid
            }
          }
        } else {
          if self.cancelProcess {
            self.cancelProcess = false
            print("Cancelling updatecollection")
            UIApplication.shared.endBackgroundTask(self.backgroundTask)
            self.backgroundTask = .invalid
            return
          }
          
          
          self.updateCollection(colletiontype: collectiontype) {
            DispatchQueue.main.async {
              UIApplication.shared.endBackgroundTask(self.backgroundTask)
              self.backgroundTask = .invalid
            }
          }
          
        }
      }
      
      uploadBatch()
    }
  }
  
  
  
  fileprivate func updateMedia(type:String,_ completion: @escaping() -> Void) {
    print("upload started")
    
    let dict: Dictionary<String,Any> = [
      "name": "Uploading",
      "total": String(self.assets.count),
      "completed":String(self.uploadedVideoKeys.count),
      "remaining" : String((self.assets.count) - (self.uploadedVideoKeys.count)),
    ]
    NotificationCenter.default.post(name: NSNotification.Name("status"), object: self, userInfo: ["data": dict])
    
    backgroundTask = UIApplication.shared.beginBackgroundTask {
      UIApplication.shared.endBackgroundTask(self.backgroundTask)
      self.backgroundTask = .invalid
    }
    
//    createCollection { [weak self] in
//      guard let self = self else { return }
    
      completion()
      let batchSize = 1 // Adjust based on your needs
      let totalAssets = assets.count
      let totalBatches = Int(ceil(Double(totalAssets) / Double(batchSize)))
      var currentBatchIndex = 0
      
      
      var uploadBatch: (() -> Void)!
      
      uploadBatch = { [weak self] in
        guard let self = self else { return }
        print(totalBatches, "total batch index")
        print(currentBatchIndex, "current batch index")
        if currentBatchIndex < totalBatches {
          let startIndex = currentBatchIndex * batchSize
          let endIndex = min(startIndex + batchSize, totalAssets)
          let batch = Array(assets[startIndex..<endIndex])
          if self.cancelProcess {
            self.cancelProcess = false
            UIApplication.shared.endBackgroundTask(self.backgroundTask)
            self.backgroundTask = .invalid
            return
          }
          self.fetchVideoAsset(batch) { urlDataBatch in
            if !(self.cancelProcess) {
              self.uploadVideosBatch(urlDataBatch, startIndex: startIndex, bucketName: "yourseason") {
                currentBatchIndex += 1
                uploadBatch()
              }
              //              self.uploadImagesBatch(imageDataBatch, startIndex: startIndex, bucketName: "yourseason", contentType: "image/jpeg") {
              //                currentBatchIndex += 1
              //                uploadBatch() // Now 'uploadBatch' can call itself
              //
              //              }
            } else {
              self.cancelProcess = false
              print("Cancelling batches after current batch")
              UIApplication.shared.endBackgroundTask(self.backgroundTask)
              self.backgroundTask = .invalid
            }
          }
        } else {
          if self.cancelProcess {
            self.cancelProcess = false
            print("Cancelling updatecollection")
            UIApplication.shared.endBackgroundTask(self.backgroundTask)
            self.backgroundTask = .invalid
            return
          }
          
         
          self.updateCollection(colletiontype: type) {
            DispatchQueue.main.async {
              UIApplication.shared.endBackgroundTask(self.backgroundTask)
              self.backgroundTask = .invalid
            }
          }
          
        }
      }
      
      uploadBatch()
//    }
  }
  
  
  
  
  fileprivate func updateGallerySeason(_ collectiontype:String,_ completion: @escaping() -> Void) {
    print("upload started")
    
    let dict: Dictionary<String,Any> = [
      "name": "Uploading",
      "total": String(self.assets.count),
      "completed":String(self.uploadedVideoKeys.count),
      "remaining" : String((self.assets.count) - (self.uploadedVideoKeys.count)),
    ]
    NotificationCenter.default.post(name: NSNotification.Name("status"), object: self, userInfo: ["data": dict])
    
    backgroundTask = UIApplication.shared.beginBackgroundTask {
      UIApplication.shared.endBackgroundTask(self.backgroundTask)
      self.backgroundTask = .invalid
    }
    
//    createCollection { [weak self] in
//      guard let self = self else { return }
    
      completion()
      let batchSize = 1 // Adjust based on your needs
      let totalAssets = assets.count
      let totalBatches = Int(ceil(Double(totalAssets) / Double(batchSize)))
      var currentBatchIndex = 0
      
      
      var uploadBatch: (() -> Void)!
      
      uploadBatch = { [weak self] in
        guard let self = self else { return }
        print(totalBatches, "total batch index")
        print(currentBatchIndex, "current batch index")
        if currentBatchIndex < totalBatches {
          let startIndex = currentBatchIndex * batchSize
          let endIndex = min(startIndex + batchSize, totalAssets)
          let batch = Array(assets[startIndex..<endIndex])
          if self.cancelProcess {
            self.cancelProcess = false
            UIApplication.shared.endBackgroundTask(self.backgroundTask)
            self.backgroundTask = .invalid
            return
          }
          self.fetchVideoAsset(batch) { urlDataBatch in
            if !(self.cancelProcess) {
              self.uploadVideosBatch(urlDataBatch, startIndex: startIndex, bucketName: "yourseason") {
                currentBatchIndex += 1
                uploadBatch()
              }
              //              self.uploadImagesBatch(imageDataBatch, startIndex: startIndex, bucketName: "yourseason", contentType: "image/jpeg") {
              //                currentBatchIndex += 1
              //                uploadBatch() // Now 'uploadBatch' can call itself
              //
              //              }
            } else {
              self.cancelProcess = false
              print("Cancelling batches after current batch")
              UIApplication.shared.endBackgroundTask(self.backgroundTask)
              self.backgroundTask = .invalid
            }
          }
        } else {
          if self.cancelProcess {
            self.cancelProcess = false
            print("Cancelling updatecollection")
            UIApplication.shared.endBackgroundTask(self.backgroundTask)
            self.backgroundTask = .invalid
            return
          }
          
          
          self.updateGallery(type: collectiontype){
            DispatchQueue.main.async {
              UIApplication.shared.endBackgroundTask(self.backgroundTask)
              self.backgroundTask = .invalid
            }
          }
          
        }
      }
      
      uploadBatch()
//    }
  }
  
  
  
  
  
  
  
  
  
  
  
  func startUpload(completion: @escaping () -> Void) {
    
    if let collectiondata = pickerParameters?.collectionData,let option = pickerParameters?.additionalOptions,let colID = option["collection_id"] as? String{
      let collectionType = option["collectionType"] as? String
      print(option,"testing")
      if colID != ""{
        // Update Collection Case in already created collection
      print("Update Collection Case in already created collection")
        self.collectionID = colID
        if  collectionType == "Brands"{
          updateMedia(type: "Brands") {
            completion()
          }
        }else{
          updateMedia(type: "") {
            completion()
          }
        }
       
      }
      
      else if collectiondata.isEmpty {
        // Add media to gallery case
        print("Add media to gallery case")
        if collectionType == "Brands"{
          updateGallerySeason("Brands") {
            completion()
          }
        }else{
          updateGallerySeason("") {
            completion()
          }
        }
//        updateGallerySeason("Brands") {
//          completion()
//        }
      }
      else{
        // Create Collection Case
        print("Create Collection Case")
        let collectiontype = pickerParameters?.additionalOptions["collectionType"] as? String
        if collectiontype == "Brands"{
          toCreateCollection(collectiontype: "Brands") {
                   completion()
                 }
        }else{
          toCreateCollection(collectiontype: "") {
                   completion()
                 }
        }
//        toCreateCollection(collectiontype: "") {
//          completion()
//        }
      }

    }else{
      print("not uploading")
    }
    
    
  }
  
  
  
  
  
  
  
//  private func uploadImagesBatch(_ batch: [Data], startIndex: Int, bucketName: String, contentType: String, completion: @escaping () -> Void) {
//    let dispatchGroup = DispatchGroup()
//    for (offset, imageData) in batch.enumerated() {
//      let index = startIndex + offset
//      let fileName = "\(Int(Date().timeIntervalSince1970))_\(index).jpeg"
//      let key = "gallery/test/\(fileName)"
//      let sentToData = compressImageData(imageData, compressionQuality: 0.7)
//      dispatchGroup.enter()
//      let transferUtility = AWSS3TransferUtility.s3TransferUtility(forKey: "org.solidappmaker.YourSeason.s3transferutility.background")
//
//      transferUtility?.uploadData(sentToData, bucket: bucketName, key: key, contentType: contentType, expression: nil, completionHandler: { [weak self] (task, error) in
//
//        if let error = error {
//          print("Error uploading image data: \(error)")
//          dispatchGroup.leave()
//        } else {
//          if let index = self?.uploadTasks.firstIndex(of: task) {
//            self?.uploadTasks.remove(at: index)
//          }
//          self?.uploadedImageKeys.append(key)
//          let dict: Dictionary<String,Any> = [
//            "name": "Uploading",
//            "total": String(self?.assets.count ?? 0),
//            "completed":String(self?.uploadedImageKeys.count ?? 0),
//            "remaining" : String((self?.assets.count ?? 0) - (self?.uploadedImageKeys.count ?? 0)),
//          ]
//          NotificationCenter.default.post(name: NSNotification.Name("status"), object: self, userInfo: ["data": dict])
//          print("Upload complete for key: \(key)")
//          dispatchGroup.leave()
//        }
//      })
//      .continueWith { (task) -> AnyObject? in
//        if let uploadTask = task.result {
//          self.uploadTasks.append(uploadTask)
//        }
//        return nil
//      }
//    }
//
//    dispatchGroup.notify(queue: .main) {
//      completion()
//    }
//  }
  
  
  func cancelAllS3Uploads() {
    for task in uploadTasks {
      task.cancel()
    }
    uploadTasks.removeAll()
  }
  
  func cancelAllAPIRequests() {
    for request in apiRequests {
      request.cancel()
    }
    apiRequests.removeAll()
  }
  
  
  
//  // Existing compressImageData method with slight modification for dynamic quality adjustment
//  func compressImageData(_ imageData: Data, compressionQuality: CGFloat? = nil) -> Data {
//    guard let image = UIImage(data: imageData) else {
//      print("Could not create image from data.")
//      return imageData
//    }
//
//    //      let quality = compressionQuality ?? determineCompressionQuality(for: imageData)
//    let quality = determineCompressionQuality(for: imageData)
//    guard let compressedImageData = image.jpegData(compressionQuality: quality) else {
//      print("Could not compress image.")
//      return imageData
//    }
//    return compressedImageData
//  }
  
  
  
//  // New method to determine compression quality dynamically
//  func determineCompressionQuality(for data: Data) -> CGFloat {
//    let imageSizeMB = Double(data.count) / (1024.0 * 1024.0)
//    if imageSizeMB < 1 {
//      return 0.9 // Less compression for smaller images
//    } else if imageSizeMB < 5 {
//      return 0.7 // Medium compression for medium-sized images
//    } else {
//      return 0.5 // More compression for larger images
//    }
//  }
  
  
  
  
  private func createCollection(type:String,completion: @escaping () -> Void) {
    if let dataParams  = pickerParameters{
      var urlString = ""
//      var urlString = "https://api.yourseasonapp.com/api/v1/stylist/create_collection"
//      let urlString = "http://192.168.0.111:5068/api/v1/stylist/create_collection"
      
      if type == "Brands"{
        urlString = "https://api.yourseasonapp.com/api/v1/brand/create_collection"
      }else{
        urlString = "https://api.yourseasonapp.com/api/v1/stylist/create_collection"
      }
      let headers: HTTPHeaders = [
        "Authorization": "Bearer \(dataParams.token)",
        "Content-Type": "application/json"
      ]
      let requestBody: [String: Any] = dataParams.collectionData
      let request = AF.request(urlString, method: .post, parameters: requestBody, encoding: JSONEncoding.default, headers: headers).responseData { response in
        switch response.result {
        case .success(let data):
          do {
            if let index = self.apiRequests.firstIndex(where: { $0.request?.url?.absoluteString == response.request?.url?.absoluteString }) {
              self.apiRequests.remove(at: index)
            }
            // Attempt to parse the JSON data
            if let JSON = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
              print("JSON:=-=>>>>>>>>> \(JSON)")
              let data =   JSON["data"] as? Dictionary<String,Any>
              self.collectionID = data?["_id"] as? String ?? ""
              completion()
              
            }
          } catch let error {
            print("Error parsing JSON: \(error.localizedDescription)")
          }
        case .failure(let error):
          print("Error in request: \(error.localizedDescription)")
        }
      }
      
      apiRequests.append(request)
    }
  }
  
  
  
//  private func fetchImageDataForAssets(_ assets: [PHAsset], completion: @escaping ([Data]) -> Void) {
//    var imageDataBatch: [Data] = []
//    let dispatchGroup = DispatchGroup()
//    for asset in assets {
//      dispatchGroup.enter()
//      PHImageManager.default().requestImageDataAndOrientation(for: asset, options: nil) { (imageData, _, _, _) in
//        if let imageData = imageData {
//          imageDataBatch.append(imageData)
//          dispatchGroup.leave()
//        }
//      }
//    }
//    dispatchGroup.notify(queue: .main) {
//      completion(imageDataBatch)
//    }
//  }
  
  
  
  
  
  
  private func uploadVideosBatch(_ batch: [URL], startIndex: Int, bucketName: String, contentType: String = "video/mp4", completion: @escaping () -> Void) {
    print("inside upload video batch")
    print("batch",batch)
      let dispatchGroup = DispatchGroup()
    for (offset, videoURL) in batch.enumerated() {
      if let mimeType = getMimeType(forFileExtension: videoURL.pathExtension) {
      let index = startIndex + offset
      let fileName = "\(Int(Date().timeIntervalSince1970))_\(index).mp4"
      let key = "gallery/test/\(fileName)"
      dispatchGroup.enter()
      let transferUtility = AWSS3TransferUtility.s3TransferUtility(forKey: "org.solidappmaker.YourSeason.s3transferutility.background")
      
        print(videoURL,"here is video url","mimetype",mimeType)
        do{
          let dataToupload  = try? Data(contentsOf: videoURL)
          if let data = dataToupload{
            transferUtility?.uploadData(data, bucket: bucketName, key: key, contentType: mimeType, expression: nil, completionHandler: { [weak self] (task, error) in
              if let error = error {
                print("Error uploading video file: \(error)")
                dispatchGroup.leave()
              } else {
                if let index = self?.uploadTasks.firstIndex(of: task) {
                  self?.uploadTasks.remove(at: index)
                }
                self?.uploadedVideoKeys.append(key) // Consider renaming to uploadedMediaKeys or similar
                let dict: Dictionary<String,Any> = [
                  "name": "Uploading",
                  "total": String(self?.assets.count ?? 0),
                  "completed":String(self?.uploadedVideoKeys.count ?? 0),
                  "remaining" : String((self?.assets.count ?? 0) - (self?.uploadedVideoKeys.count ?? 0)),
                ]
                NotificationCenter.default.post(name: NSNotification.Name("status"), object: self, userInfo: ["data": dict])
                print("Upload complete for key: \(key)")
                dispatchGroup.leave()
              }
            })
            .continueWith { (task) -> AnyObject? in
              if let uploadTask = task.result {
                self.uploadTasks.append(uploadTask)
              }
              return nil
            }
          }
          else{
            print("unable to convert to data")
          }
        }
       
   
    }
      }
      
      dispatchGroup.notify(queue: .main) {
          completion()
      }
  }

  
  func getMimeType(forFileExtension fileExtension: String) -> String? {
    if let uti = UTTypeCreatePreferredIdentifierForTag(kUTTagClassFilenameExtension, fileExtension as CFString, nil)?.takeRetainedValue() {
      if let mimeType = UTTypeCopyPreferredTagWithClass(uti, kUTTagClassMIMEType)?.takeRetainedValue() {
        return mimeType as String
      }
    }
    return nil
  }
  
  private func fetchVideoAsset(_ assets: [PHAsset], completion: @escaping ([URL]) -> Void) {
    print("inside fetch video",assets)
    var VideoDataBatch: [URL] = []
    let dispatchGroup = DispatchGroup()
    let options = PHVideoRequestOptions()
        options.version = .original
    options.isNetworkAccessAllowed = true
    for asset in assets {
      dispatchGroup.enter()
      PHImageManager.default().requestAVAsset(forVideo: asset, options: options) { (avAsset, _, _) in
        guard let videoURL = (avAsset as? AVURLAsset)?.url else { return }
        print("urlhere started",videoURL)
        VideoDataBatch.append(videoURL)
        dispatchGroup.leave()
      }
    }
    dispatchGroup.notify(queue: .main) {
      completion(VideoDataBatch)
    }
  }
  
  
  private func updateCollection(colletiontype:String,completion: @escaping () -> Void) {
    print("i am started",colletiontype)
    if let dataParams  = pickerParameters{
      do {
        let jsonData = try JSONSerialization.data(withJSONObject: self.uploadedVideoKeys, options: [])
        if let jsonString = String(data: jsonData, encoding: .utf8) {
          print("JSON string: \(jsonString)")
          self.uploadedVideoKeysString = jsonString
          var temp = dataParams.additionalOptions
          temp["collection_id"] = self.collectionID
          temp["data"] =  jsonString
          print(temp)
         var urlString = ""
//          let urlString = "https://api.yourseasonapp.com/api/v1/stylist/update_media_array"
//          let urlString = "http://192.168.0.111:5068/api/v1/stylist/update_media_array"
          if colletiontype == "Brands"{
             urlString = "https://api.yourseasonapp.com/api/v1/brand/update_media_array"
          }else{
             urlString = "https://api.yourseasonapp.com/api/v1/stylist/update_media_array"
          }
          let headers: HTTPHeaders = [
            "Authorization": "Bearer \(dataParams.token)",
            "Content-Type": "application/json"
          ]
          let requestBody: [String: Any] = temp
          let request = AF.request(urlString, method: .post, parameters: requestBody, encoding: JSONEncoding.default, headers: headers).responseData { response in
            switch response.result {
            case .success(let data):
              do {
                if let index = self.apiRequests.firstIndex(where: { $0.request?.url?.absoluteString == response.request?.url?.absoluteString }) {
                  self.apiRequests.remove(at: index)
                }
                // Attempt to parse the JSON data
                if let JSON = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                  print("JSON: \(JSON)  here is updated data ")
                  
                  self.uploadedVideoKeys.removeAll()
                  self.assets.removeAll()
                  completion()
                }
              } catch let error {
                print("Error parsing JSON: \(error.localizedDescription)")
              }
            case .failure(let error):
              print("Error in request: \(error.localizedDescription)")
            }
          }
          apiRequests.append(request)
        }
      } catch {
        print("Error serializing array to JSON string: \(error.localizedDescription)")
      }
      
      
    }
  }
  
  
  
  private func updateGallery(type:String,completion: @escaping () -> Void) {
    print("i am started")
    if let dataParams  = pickerParameters{
      do {
        let jsonData = try JSONSerialization.data(withJSONObject: self.uploadedVideoKeys, options: [])
        if let jsonString = String(data: jsonData, encoding: .utf8) {
          print("JSON string: \(jsonString)")
          self.uploadedVideoKeysString = jsonString
          var temp = dataParams.additionalOptions
          temp["data"] =  jsonString
          print(temp,"here is the data ",dataParams.token)
          print(temp,"here is the data ",dataParams.token)
          
         var urlString = ""
//          let urlString = "https://api.yourseasonapp.com/api/v1/stylist/update_gallery_media"
//          let urlString = "http://192.168.0.111:5068/api/v1/stylist/update_gallery_media"
          if type == "Brands"{
            urlString = "https://api.yourseasonapp.com/api/v1/brand/update_gallery_media"
          }else{
            urlString = "https://api.yourseasonapp.com/api/v1/stylist/update_gallery_media"
          }
   
          let headers: HTTPHeaders = [
            "Authorization": "Bearer \(dataParams.token)",
            "Content-Type": "application/json"
          ]
          let requestBody: [String: Any] = temp
          let request = AF.request(urlString, method: .post, parameters: requestBody, encoding: JSONEncoding.default, headers: headers).responseData { response in
            switch response.result {
            case .success(let data):
              do {
                if let index = self.apiRequests.firstIndex(where: { $0.request?.url?.absoluteString == response.request?.url?.absoluteString }) {
                  self.apiRequests.remove(at: index)
                }
                // Attempt to parse the JSON data
                if let JSON = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                  print("JSON: \(JSON)  here is updated data ")
                  self.uploadedVideoKeys.removeAll()
                  self.assets.removeAll()
//                  self.cleanAll()
                  completion()
                }
              } catch let error {
                print("Error parsing JSON: \(error.localizedDescription)")
              }
            case .failure(let error):
              print("Error in request: \(error.localizedDescription)")
            }
          }
          apiRequests.append(request)
        }
      } catch {
        print("Error serializing array to JSON string: \(error.localizedDescription)")
      }
      
      
    }
  }
  
  
  
}












//    func startUpload(completion: @escaping () -> Void) {
//      // Begin a background task
//      var backgroundTask: UIBackgroundTaskIdentifier = .invalid
//      backgroundTask = UIApplication.shared.beginBackgroundTask {
//          // End the task if time expires.
//          UIApplication.shared.endBackgroundTask(backgroundTask)
//          backgroundTask = .invalid
//      }
//      createCollection {
//             self.uploadNextImage(index: 0) {
//               self.updateCollection {
//                 UIApplication.shared.endBackgroundTask(backgroundTask)
//                 backgroundTask = .invalid
//               }
//             }
//         }
//    }




//  private func uploadNextImage(index: Int, completion: @escaping () -> Void) {
//      guard index < imagesDataToUpload.count else {
//          DispatchQueue.main.async {
//              print("All images uploaded successfully.")
//              completion()
//          }
//          return
//      }
//
//      let imageData = imagesDataToUpload[index]
//      let fileName = "\(Int(Date().timeIntervalSince1970))_\(index).jpeg"
//      let key = "gallery/test/\(fileName)"
//      let bucketName = "yourseason" // Ensure this is set to your actual bucket name
//      let contentType = "image/jpeg" // Update if you have different content types
//
//      let transferUtility = AWSS3TransferUtility.s3TransferUtility(forKey: "org.solidappmaker.YourSeason.s3transferutility.background")
//
//      // Start the upload
//
//
//      transferUtility?.uploadData(imageData, bucket: bucketName, key: key, contentType: contentType, expression: nil, completionHandler: { (task, error) in
//          DispatchQueue.main.async {
//              if let error = error {
//                  print("Error uploading image data: \(error)")
//              } else {
//                self.uploadedImageKeys.append(key)
//                self.uploadNextImage(index: index + 1, completion: completion)
//                  print("Upload complete for key: \(key)")
//
//              }
//          }
//      }).continueWith { (task) -> AnyObject? in
//          if let error = task.error {
//              print("Error in continueWith block: \(error)")
//          }
//          if task.result != nil {
//              print("Success in continueWith block for key: \(key)")
//              // Additional success handling if needed
//
//          }
//          return nil
//      }
//  }


//  func startUpload( completion: @escaping () -> Void) {
//
//      backgroundTask = UIApplication.shared.beginBackgroundTask {
//          UIApplication.shared.endBackgroundTask(self.backgroundTask)
//          self.backgroundTask = .invalid
//      }
//
//      createCollection { [weak self] in
//          guard let self = self else { return }
//          completion()
//          let batchSize = 6 // Adjust based on your needs
//          let totalAssets = assets.count
//          let totalBatches = Int(ceil(Double(totalAssets) / Double(batchSize)))
//          var currentBatchIndex = 0
//          var uploadBatch: (() -> Void)!
//          uploadBatch = { [weak self] in
//              guard let self = self else { return }
//            print(totalBatches,"total batch index")
//            print(currentBatchIndex,"current batch index")
//              if currentBatchIndex < totalBatches {
//                  let startIndex = currentBatchIndex * batchSize
//                  let endIndex = min(startIndex + batchSize, totalAssets)
//                  let batch = Array(assets[startIndex..<endIndex])
//                  if self.cancelProcess {
//                      self.cancelProcess = false
//                      UIApplication.shared.endBackgroundTask(self.backgroundTask)
//                      self.backgroundTask = .invalid
//                      return
//                  }
//                  self.fetchImageDataForAssets(batch) { imageDataBatch in
//                      if !(self.cancelProcess) {
//                        self.uploadImagesBatch(imageDataBatch, startIndex: startIndex, bucketName: "yourseason", contentType: "image/jpeg") {
//                              currentBatchIndex += 1
//                              uploadBatch() // Now 'uploadBatch' can call itself
//                          }
//                      } else {
//                          self.cancelProcess = false
//                          print("Cancelling batches after current batch")
//                          UIApplication.shared.endBackgroundTask(self.backgroundTask)
//                          self.backgroundTask = .invalid
//                      }
//                  }
//              } else {
//                  if self.cancelProcess {
//                      self.cancelProcess = false
//                      print("Cancelling updatecollection")
//                      UIApplication.shared.endBackgroundTask(self.backgroundTask)
//                      self.backgroundTask = .invalid
//                      return
//                  }
//                  self.updateCollection {
//                      DispatchQueue.main.async {
//                          UIApplication.shared.endBackgroundTask(self.backgroundTask)
//                          self.backgroundTask = .invalid
//                      }
//                  }
//              }
//          }
//
//          uploadBatch()
//      }
//  }


//  func startUpload(completion: @escaping () -> Void) {
//      backgroundTask = UIApplication.shared.beginBackgroundTask {
//          UIApplication.shared.endBackgroundTask(self.backgroundTask)
//          self.backgroundTask = .invalid
//      }
//
//      createCollection { [weak self] in
//          guard let self = self else { return }
//          completion()
//          let batchSize = 6 // Adjust based on your needs
//          let totalAssets = assets.count
//          let totalBatches = Int(ceil(Double(totalAssets) / Double(batchSize)))
//          var currentBatchIndex = 0
//
//          var uploadBatch: (() -> Void)!
//
//          uploadBatch = { [weak self] in
//              guard let self = self else { return }
//              print(totalBatches, "total batch index")
//              print(currentBatchIndex, "current batch index")
//              if currentBatchIndex < totalBatches {
//                  let startIndex = currentBatchIndex * batchSize
//                  let endIndex = min(startIndex + batchSize, totalAssets)
//                  let batch = Array(assets[startIndex..<endIndex])
//                  if self.cancelProcess {
//                      self.cancelProcess = false
//                      UIApplication.shared.endBackgroundTask(self.backgroundTask)
//                      self.backgroundTask = .invalid
//                      return
//                  }
//                  self.fetchImageDataForAssets(batch) { imageDataBatch in
//                      if !(self.cancelProcess) {
//                          self.uploadImagesBatch(imageDataBatch, startIndex: startIndex, bucketName: "yourseason", contentType: "image/jpeg") {
//                              currentBatchIndex += 1
//                              uploadBatch() // Now 'uploadBatch' can call itself
//                          }
//                      } else {
//                          self.cancelProcess = false
//                          print("Cancelling batches after current batch")
//                          UIApplication.shared.endBackgroundTask(self.backgroundTask)
//                          self.backgroundTask = .invalid
//                      }
//                  }
//              } else {
//                  if self.cancelProcess {
//                      self.cancelProcess = false
//                      print("Cancelling updatecollection")
//                      UIApplication.shared.endBackgroundTask(self.backgroundTask)
//                      self.backgroundTask = .invalid
//                      return
//                  }
//                  self.updateCollection {
//                      DispatchQueue.main.async {
//                          UIApplication.shared.endBackgroundTask(self.backgroundTask)
//                          self.backgroundTask = .invalid
//                      }
//                  }
//              }
//          }
//
//          uploadBatch()
//      }
//  }





//  func compressImageData(_ imageData: Data, compressionQuality: CGFloat) -> Data {
//    guard let image = UIImage(data: imageData) else {
//      print("Could not create image from data.")
//      return imageData // Return original data if it can't be converted to UIImage
//    }
//
//    guard let compressedImageData = image.jpegData(compressionQuality: compressionQuality) else {
//      print("Could not compress image.")
//      return imageData // Return original data if compression fails
//    }
//
//    return compressedImageData
//  }





//  func startUpload(completion: @escaping () -> Void) {
//
//    backgroundTask = UIApplication.shared.beginBackgroundTask {
//      UIApplication.shared.endBackgroundTask(self.backgroundTask)
//      self.backgroundTask = .invalid
//    }
//    print(cancelProcess)
//    let dict: Dictionary<String,Any> = [
//      "name": "Uploading",
//      "total": String(self.imagesDataToUpload.count),
//      "completed":String(self.uploadedImageKeys.count),
//      "remaining" : String((self.imagesDataToUpload.count) - (self.uploadedImageKeys.count)),
//    ]
//    NotificationCenter.default.post(name: NSNotification.Name("status"), object: self, userInfo: ["data": dict])
//
//    createCollection { [weak self] in
//      guard let self = self else { return }
//      completion()
//      let batchSize = 10 // Adjust based on your needs
//      let totalImages = self.imagesDataToUpload.count
//      let totalBatches = Int(ceil(Double(totalImages) / Double(batchSize)))
//      var currentBatchIndex = 0
//
//      var uploadBatch: (() -> Void)!
//
//      uploadBatch = { [weak self] in
//        guard let self = self else { return }
//        if currentBatchIndex < totalBatches {
//          let startIndex = currentBatchIndex * batchSize
//          let endIndex = min(startIndex + batchSize, totalImages)
//          let batch = Array(self.imagesDataToUpload[startIndex..<endIndex])
//          if (self.cancelProcess){
//            self.cancelProcess = false
//            UIApplication.shared.endBackgroundTask(backgroundTask)
//            backgroundTask = .invalid
//
//            return
//          }
//          self.uploadImagesBatch(batch, startIndex: startIndex, bucketName: "yourseason", contentType: "image/jpeg") {
//
//            if !(self.cancelProcess) {
//              currentBatchIndex += 1
//              uploadBatch() // Now 'uploadBatch' can call itself
//            } else {
//              self.cancelProcess = false
//              print("Cancelling batches after current batch")
//              UIApplication.shared.endBackgroundTask(self.backgroundTask)
//              self.backgroundTask = .invalid
//            }
//
////            currentBatchIndex += 1
////            uploadBatch() // Now 'uploadBatch' can call itself
//          }
//        } else {
//          if (self.cancelProcess){
//            self.cancelProcess = false
//            print("Cancelling updatecollection")
//            UIApplication.shared.endBackgroundTask(backgroundTask)
//            backgroundTask = .invalid
//            return
//          }
//          self.updateCollection {
//            DispatchQueue.main.async {
//              UIApplication.shared.endBackgroundTask(self.backgroundTask)
//              self.backgroundTask = .invalid
//            }
//          }
//        }
//      }
//
//      uploadBatch()
//    }
//  }



//                  }
//                else {
//                      // Wait for uploads to complete before calling updateCollection
//                      DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
//                          uploadBatch() // Call uploadBatch again to check if all uploads are completed
//                      }
//                  }



// Check if all uploads are completed before calling updateCollection
//                  if allUploadsCompleted {
//if currentBatchIndex == totalBatches {
//    allUploadsCompleted = true // Set flag when all uploads are done
//}
/*var allUploadsCompleted = false*/ // Flag to track all uploads completion
