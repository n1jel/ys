//
//  AlbumCell.swift
//  customGalleryDemo
//
//  Created by John on 30/01/24.
//

import UIKit

class AlbumCell: UITableViewCell {

   
  @IBOutlet weak var lblCount: UILabel!
  @IBOutlet weak var imageView1: UIImageView!
    @IBOutlet weak var lblTExt: UILabel!
  var PhfetchData :Dictionary<String, Any> = [:]
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }

}


