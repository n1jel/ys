
import UIKit
import Photos
import ImageIO
import AWSS3
import Alamofire

struct EditGalleryImage: Decodable,Equatable {
    var _id: String
    var is_cover_image: Int?
  var is_selected:Int
    var media_name: String
    var media_type: String
    var stylist_id: String?
    var brand_id: String?
  
    var thumbnail: String?
  
  static func ==(lhs: EditGalleryImage, rhs: EditGalleryImage) -> Bool {
        return lhs._id == rhs._id
    }
}
class EditCollectionLibrary: UIViewController, UICollectionViewDataSource, UICollectionViewDelegate,UICollectionViewDelegateFlowLayout {
  
  @IBOutlet weak var btnBackGroundView: UIView!
  @IBOutlet weak var headerBackgroundView: UIView!
  var pickerParameters: PickerParameters?
  var collectionID:String?
  var token:String?
  @IBOutlet weak var activityIndicator: UIActivityIndicatorView!
  @IBOutlet weak var photosCollectionView: UICollectionView!
  var selectedItems: Array<Dictionary<String,Any>> = [[:]]
  var data:[Data] = []
  var selectedItemsOriginal: Array<Dictionary<String,Any>> = [[:]]
  var dictToSend: Array<Dictionary<String,Any>> = [[:]]
  @IBOutlet weak var lblCount: UILabel!
  @IBOutlet weak var selectionDone: UIButton!
  var selectedAlbum: PHAssetCollection?
  var totalAssetCount:Int?
//  var selectedAlbumAssets: [PHAsset] = []
//  var selectedImageAssets:[PHAsset] = []
  @IBOutlet weak var headerView: UIView!
  var originalBase64Images:[String] = []
  var fileUrl:[String]=[]
  var isFetchingAssets = false
  var currentPage = 0
    let itemsPerPage = 30
  var fetchResult: PHFetchResult<PHAsset>?
  var totalPages = 0
  var limit = 30
  var page = 1
  var  isloading = false
  var currentPageVariable: Int = 0
  var totalEntriesVariable: Int = 0
  var totalPagesVariable: Int = 0
  var galleryImage:[EditGalleryImage] = []
  var selectedGalleryImage:[EditGalleryImage] = []
  let colors = [UIColor(named: "Primary") ?? UIColor.red, UIColor(named: "Grad1") ?? UIColor.blue ]
  @IBOutlet weak var btnPost: UIButton!
  let ref = ImageDownloader.shared
  var selectedImageId:[String] = []
  override func viewDidLoad() {
    super.viewDidLoad()
    print(pickerParameters, "jsdfhybgusdyfhgiv")
    let desiredBottomPadding: CGFloat = 100.0
        photosCollectionView.contentInset = UIEdgeInsets(top: 0, left: 0, bottom: desiredBottomPadding, right: 0)
    headerView.roundBottomCorners(cornerRadius: 16)
    headerBackgroundView.roundBottomCorners(cornerRadius: 16)
    headerBackgroundView.applyGradientView(colors: colors, startPoint: CGPoint(x: 0, y: 0), endPoint: CGPoint(x: 1, y: 0))
    btnBackGroundView.applyGradientView(colors: colors, startPoint: CGPoint(x: 0, y: 0), endPoint: CGPoint(x: 1, y: 0))
    photosCollectionView.dataSource = self
    photosCollectionView.delegate = self
    photosCollectionView.allowsMultipleSelectionDuringEditing = true
    photosCollectionView.isEditing = true
    activityIndicator.startAnimating()
    fetchDataFromAPI(limit: limit, page: page) { result in
        switch result {
        case .success(let data):
            // Handle successful response and process data
          do{
            if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any]{
              print("Data received:", json)
              let status = json["status"] as? Bool ?? false
              print(status)
              // Example: Convert data to JSON
//            if let dataString = String(data: data, encoding: .utf8) {
//                    print(dataString)
//                } else {
//                    print("Could not convert data to a UTF-8 string.")
//                }
              if status{
                self.parseJsonResponse(data: data)
              }
              else{
                DispatchQueue.main.async {
                  self.activityIndicator.stopAnimating()
                 if let message = json["message"] as? String{
                    print("No Media Available")
                   self.showToast(message: message, font: .systemFont(ofSize: 12.0))
                  }
                }
              }
//              self.parseJsonResponse(data: data)
            }}
          catch{
            
          }
       
            
        case .failure(let error):
            // Handle error
            print("Error:", error)
        }
    }
  }
  override func viewDidLayoutSubviews() {
      super.viewDidLayoutSubviews()
     
      headerBackgroundView.updateGradientView(colors: colors)
    btnBackGroundView.updateGradientView(colors: colors)
  }
  @IBAction func actionBack(_ sender: UIButton) {
    self.dismiss(animated: true)
  }
  
  func parseJsonResponse(data: Data) {
      do {
          if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any],
             let dataArray = json["data"] as? [[String: Any]],
             let otherInfo = json["other"] as? [String: Any],
             let currentPage = otherInfo["current_page"] as? Int,
             let totalEntries = otherInfo["total_entries"] as? Int,
             let totalPages = otherInfo["total_page"] as? Int {
              
            print(json,"see data here ")
            let jsonData = try JSONSerialization.data(withJSONObject: dataArray, options: [])
                                 let galleryImages = try JSONDecoder().decode([EditGalleryImage].self, from: jsonData)
                                 print("Parsed Gallery Images:", galleryImages)
                       self.galleryImage = galleryImages
              // Extract media
            print(self.galleryImage)
           
            var mediarry:[String] = []
            var mediaArrayNew:[Dictionary<String,String>] = []
            
              for url in galleryImage {
                mediaArrayNew.append(["url":url.media_name,"media_Type":url.media_type])
                mediarry.append(url.media_name)
              }
            
            self.ref.downloadImagesWithArray2(urls: mediaArrayNew) { bool, err in
              DispatchQueue.main.async {
                self.activityIndicator.stopAnimating()
                self.photosCollectionView.reloadData()
              }
             
            }

//              // Save current page, total entries, and total pages to variables
              currentPageVariable = currentPage
              totalEntriesVariable = totalEntries
              totalPagesVariable = totalPages
              
              print("Current Page:", currentPageVariable)
              print("Total Entries:", totalEntriesVariable)
              print("Total Pages:", totalPagesVariable)
          } else {
              print("Invalid JSON format")
          }
      } catch {
          print("Error parsing JSON:", error)
      }
  }
  
 
  
  func fetchDataFromAPI(limit: Int, page: Int, completion: @escaping (Result<Data, Error>) -> Void) {
    guard let param = pickerParameters else {
      print("please send param")
      return
    }
      print("helloooo===>" ,param,pickerParameters)
      // Include parameters in the URL itself for a GET request
    let collectiontype = param.additionalOptions["collectionType"] as? String
    var url:URL?
    if collectiontype == "Brands"{
      url = URL(string:"https://api.yourseasonapp.com/api/v1/brand/get_my_gallery?page=\(page)&limit=\(limit)&collection_id=\(self.collectionID ?? "")")
    }else{
      url = URL(string:"https://api.yourseasonapp.com/api/v1/stylist/get_my_gallery?page=\(page)&limit=\(limit)&collection_id=\(self.collectionID ?? "")")
    }

    guard let url = url else{return}
    
//    guard let url = URL(string: "https://api.yourseasonapp.com/api/v1/stylist/get_my_gallery?page=\(page)&limit=\(limit)&collection_id=\(self.collectionID ?? "")") else {
//          completion(.failure(NSError(domain: "Invalid URL", code: 0, userInfo: nil)))
//          return
//      }
      
      var request = URLRequest(url: url)
      request.httpMethod = "GET"
    request.setValue("Bearer \(self.token ?? "")", forHTTPHeaderField: "Authorization")
      // No need to set parameters in the body or content-type for a GET request
      let task = URLSession.shared.dataTask(with: request) { (data, response, error) in
          if let error = error {
              completion(.failure(error))
              return
          }
          
          guard let httpResponse = response as? HTTPURLResponse, (200...299).contains(httpResponse.statusCode) else {
              completion(.failure(NSError(domain: "Server Error", code: 0, userInfo: nil)))
              return
          }
          
          if let data = data {
              completion(.success(data))
          } else {
              completion(.failure(NSError(domain: "No Data", code: 0, userInfo: nil)))
          }
      }
      
      task.resume()
  }

  
  func loadMoreContent() {
    let startIndex = self.galleryImage.count
      print("jdshbfguvshybdfiv")
      var indexPaths = [IndexPath]()
      page = page + 1
    fetchDataFromAPI(limit: limit, page: page) { result in
          do {
              let data = try result.get()
           if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any],
               let dataArray = json["data"] as? [[String: Any]],
               let otherInfo = json["other"] as? [String: Any],
               let currentPage = otherInfo["current_page"] as? Int,
               let totalEntries = otherInfo["total_entries"] as? Int,
               let totalPages = otherInfo["total_page"] as? Int {
                  self.currentPageVariable = currentPage
                  self.totalEntriesVariable = totalEntries
                  self.totalPagesVariable = totalPages
                  
                  
                  print("Current Page222:", self.currentPageVariable)
                  print("Total Entries222:", self.totalEntriesVariable)
                  print("Total Pages222:", self.totalPagesVariable)
        
             let jsonData = try JSONSerialization.data(withJSONObject: dataArray, options: [])
                                  let galleryImages = try JSONDecoder().decode([EditGalleryImage].self, from: jsonData)
                                  print("Parsed Gallery Images:", galleryImages)
             var mediarry:[String] = []
             
             var mediaArrayNew:[Dictionary<String,String>] = []

             for url in galleryImages {
               mediaArrayNew.append(["url":url.media_name,"media_Type":url.media_type])
                 mediarry.append(url.media_name)
               }
                  self.ref.downloadImagesWithArray2(urls: mediaArrayNew) { results, errors in
                      
                      if (results ?? false) {
                        self.galleryImage.append(contentsOf: galleryImages)
//
                        print(startIndex,((startIndex + mediarry.count) - 1))
                          for index in  startIndex..<(startIndex + mediarry.count) {
                              indexPaths.append(IndexPath(item: index, section: 0)) // Assuming you have only one section
                          }
                          
                          DispatchQueue.main.asyncAfter(deadline: .now() + 0, execute: {
                              self.photosCollectionView.performBatchUpdates({
                                  self.photosCollectionView.insertItems(at: indexPaths)
                              }, completion: nil)
                              self.isloading = false
                          })
                      }  else {
                          print("Unknown error occurred while downloading image at index \(errors).")
                          // Handle unknown error
                      }
                      
                  }
                  
              }
          } catch {
              // Handle error
              print("Error:", error)
          }
      }
  }


  @IBAction func actionPost(_ sender: UIButton) {

    if selectedImageId.count > 0{
      self.activityIndicator.startAnimating()
      updateCollection {
        print("created sucessfully")
        DispatchQueue.main.async {
          self.activityIndicator.stopAnimating()
        }
        self.dismiss(animated: true) {
          NotificationCenter.default.post(name: NSNotification.Name("ImagesUpdated"), object: self, userInfo: ["originalImages": [],"smallImages":[]])
        }
       
      }
    }

  }
  
  private func updateCollection(completion: @escaping () -> Void) {
    guard let collectiontype = pickerParameters?.additionalOptions["collectionType"] as? String else{
      
      print("send param in edict collection function")
      return
    }
    
    print(collectiontype, "collecction type")
      var urlString = ""
//      let urlString = "https://api.yourseasonapp.com/api/v1/stylist/update_collection"
      //      let urlString = "http://192.168.0.111:5068/api/v1/stylist/create_collection"
    if collectiontype == "Brands"{
      urlString = "https://api.yourseasonapp.com/api/v1/brand/update_collection"
    }else{
      urlString = "https://api.yourseasonapp.com/api/v1/stylist/update_collection"
    }
      let headers: HTTPHeaders = [
        "Authorization": "Bearer \(self.token ?? "")",
        "Content-Type": "application/json"
      ]
      var requestBody: [String: Any] = [:]
      requestBody["mediaArray"] = selectedImageId
      requestBody["collection_id"] = self.collectionID
      print(requestBody,"request body ........")
      let request = AF.request(urlString, method: .post, parameters: requestBody, encoding: JSONEncoding.default, headers: headers).responseData { response in
        switch response.result {
        case .success(let data):
          do {
         
            // Attempt to parse the JSON data
            if let JSON = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
              print("JSON: \(JSON)")
              let data =   JSON["data"] as? Dictionary<String,Any>
             
              completion()
              
            }
          } catch let error {
            print("Error parsing JSON: \(error.localizedDescription)")
          }
        case .failure(let error):
          print("Error in request: \(error.localizedDescription)")
        }
      }

  }


  // MARK: - UICollectionViewDataSource
  
  func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
    return galleryImage.count
  }
  @IBAction func actionSelectionDone(_ sender: UIButton) {
  
  }
  
  
  func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
    let image = galleryImage[indexPath.item]
    let cell = collectionView.dequeueReusableCell(withReuseIdentifier: "EditLibraryPhoto", for: indexPath) as! EditLibraryPhoto
    let imageURL = galleryImage[indexPath.item].media_name
    let uri = URL(string: "https://d1ibgiujerad7s.cloudfront.net/\(imageURL)")!
    cell.updateUI()
    if image.is_selected == 1{
      cell.doneImg.isHidden = false
    }
    else{
      cell.doneImg.isHidden = true
    }
    if image.media_type == "video"{
      cell.imgVideo.isHidden = false
    }
    else{
      cell.imgVideo.isHidden = true
    }
    
    DispatchQueue.global(qos: .userInitiated).async{
        self.ref.downloadImage2(url: uri.absoluteString, index: indexPath.item,media_type: image.media_type) { data, err in
            if let err = err{
                print(err)
            }else{
                if let response = data {
                    DispatchQueue.main.async {
                        cell.imageView.image = response
                        
                    }
                }
            }
        }
    }

    let isSelected = selectedGalleryImage.contains(image)
    cell.updateSelectionStatus(isSelected: !isSelected)
    return cell
  }
  
  
  func collectionView(_ collectionView: UICollectionView, shouldSelectItemAt indexPath: IndexPath) -> Bool {
      // Determine if the cell at the specified indexPath should be selectable
    let image = galleryImage[indexPath.item]
    if image.is_selected == 1{
      return false
    }
    else{
     return true
    }

  }
  func collectionView(_ collectionView: UICollectionView, viewForSupplementaryElementOfKind kind: String, at indexPath: IndexPath) -> UICollectionReusableView {
      if kind == UICollectionView.elementKindSectionFooter {
          let footer = collectionView.dequeueReusableSupplementaryView(ofKind: kind, withReuseIdentifier: "customFooterView", for: indexPath) as! customFooterView
          footer.start() // Start the activity indicator
          return footer
      }
      fatalError("Unexpected element kind")
  }
  
  func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, referenceSizeForFooterInSection section: Int) -> CGSize {
      // Return the size of the footer view. Adjust the height as needed.
      return CGSize(width: collectionView.bounds.width, height:  (currentPageVariable == totalPagesVariable) ? 0 : 50)
  }
  
  
  func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
    var image = galleryImage[indexPath.item]
    selectedImageId.append(image._id)
    selectedGalleryImage.append(image)
    let cell = collectionView.cellForItem(at: indexPath) as? EditLibraryPhoto
    cell?.updateSelectionStatus(isSelected: !selectedGalleryImage.contains(image))
    lblCount.text = "Edit Images (\(String(selectedGalleryImage.count)))"
  }
  
  
  func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
    let screenWidth =  UIScreen.main.bounds.width / 3.5
    return CGSize(width: screenWidth, height: screenWidth)
  }
  
  
  func collectionView(_ collectionView: UICollectionView, didDeselectItemAt indexPath: IndexPath) {
    var image = galleryImage[indexPath.item]
    if let index = selectedGalleryImage.firstIndex(of: image) {
      selectedGalleryImage.remove(at: index)
    }
    if let index2 = selectedImageId.firstIndex(of: image._id) {
      selectedImageId.remove(at: index2)
    }
    let cell = collectionView.cellForItem(at: indexPath) as? EditLibraryPhoto
    cell?.updateSelectionStatus(isSelected: !selectedGalleryImage.contains(image))
    lblCount.text = "Edit Images (\(String(selectedGalleryImage.count)))"
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
  
  
  
  func setThumbnailFromVideoURL(url: URL, imageView: UIImageView) {
      let asset = AVAsset(url: url)
      let imageGenerator = AVAssetImageGenerator(asset: asset)
      imageGenerator.appliesPreferredTrackTransform = true

      let time = CMTime(seconds: 1, preferredTimescale: 60) // Adjust the time as needed

      imageGenerator.generateCGImagesAsynchronously(forTimes: [NSValue(time: time)]) { _, cgImage, _, _, _ in
          if let cgImage = cgImage {
              let thumbnail = UIImage(cgImage: cgImage)
              DispatchQueue.main.async {
                  imageView.image = thumbnail
              }
          }
      }
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




extension EditCollectionLibrary: UIScrollViewDelegate {
  func scrollViewDidScroll(_ scrollView: UIScrollView) {
      let offsetY = scrollView.contentOffset.y
      let contentHeight = scrollView.contentSize.height
      let height = scrollView.frame.size.height
    let threshold: CGFloat = 100.0
      if offsetY > contentHeight - height - threshold{
          if (currentPageVariable == totalPagesVariable){
            if let footerView = self.photosCollectionView.visibleSupplementaryViews(ofKind: UICollectionView.elementKindSectionFooter).first as? customFooterView {
                  footerView.stopLoading()
              }
          }
          else{
              if !isloading {
                  isloading = true
                  loadMoreContent()
              }}
          // Footer is visible, load more content
          
      }
  }
    

}


class EditLibraryPhoto: UICollectionViewCell {
  @IBOutlet weak var imageView: UIImageView!
  @IBOutlet weak var tick: UIImageView!
  
  @IBOutlet weak var doneImg: UIImageView!
  @IBOutlet weak var overlayView: UIView!
  @IBOutlet weak var view: UIView!
  
  @IBOutlet weak var imgVideo: UIImageView!
  func   updateSelectionStatus(isSelected:Bool){
//    tick.isHidden = isSelected
    print(isSelected,"updating")
    overlayView.isHidden = isSelected
    view.isHidden = isSelected
  }
  
  func updateUI(){
    imageView.layer.cornerRadius = 8
    view.layer.cornerRadius = 12.5
  }
}









extension UIViewController {

func showToast(message : String, font: UIFont) {

    let toastLabel = UILabel(frame: CGRect(x: self.view.frame.size.width/2 - 75, y: self.view.frame.size.height-100, width: 150, height: 35))
    toastLabel.backgroundColor = UIColor.black.withAlphaComponent(0.6)
    toastLabel.textColor = UIColor.white
    toastLabel.font = font
    toastLabel.textAlignment = .center;
    toastLabel.text = message
    toastLabel.alpha = 1.0
    toastLabel.layer.cornerRadius = 10;
    toastLabel.clipsToBounds  =  true
    self.view.addSubview(toastLabel)
    UIView.animate(withDuration: 4.0, delay: 0.1, options: .curveEaseOut, animations: {
         toastLabel.alpha = 0.0
    }, completion: {(isCompleted) in
        toastLabel.removeFromSuperview()
    })
} }
