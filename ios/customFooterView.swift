//
//  customFooterView.swift
//  YourSeason
//
//  Created by John on 11/03/24.
//

import UIKit

class customFooterView: UICollectionReusableView {
  @IBOutlet weak var activity: UIActivityIndicatorView!
  
  func start(){
      activity.startAnimating()
  }
  func stopLoading(){
      activity.hidesWhenStopped = true
      activity.stopAnimating()
     
  }
}
