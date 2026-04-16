
import UIKit


extension UIView {
     func applyGradientView(colors: [UIColor], startPoint: CGPoint, endPoint: CGPoint) {
        let gradientLayer = CAGradientLayer()
        gradientLayer.frame = self.bounds
        gradientLayer.colors = colors.map { $0.cgColor }
        gradientLayer.startPoint = startPoint
        gradientLayer.endPoint = endPoint
        gradientLayer.name = "gradientLayer"
        
        // Remove existing gradient layers
        self.layer.sublayers?.filter { $0.name == "gradientLayer" }.forEach { $0.removeFromSuperlayer() }
        
        // Insert the new gradient layer at the very bottom
        self.layer.insertSublayer(gradientLayer, at: 0)
    }
    
    func updateGradientView(colors: [UIColor], startPoint: CGPoint = CGPoint(x: 0, y: 0), endPoint: CGPoint = CGPoint(x: 1, y: 0)) {
        applyGradientView(colors: colors, startPoint: startPoint, endPoint: endPoint)
    }
  
}


