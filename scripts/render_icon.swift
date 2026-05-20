import AppKit
import Foundation

let arguments = Array(CommandLine.arguments.dropFirst())
let outputPath = arguments.first ?? "icons/logo-128.png"
let dimension = Int(arguments.dropFirst().first ?? "128") ?? 128
let size = NSSize(width: dimension, height: dimension)

let image = NSImage(size: size)
image.lockFocus()

let paragraph = NSMutableParagraphStyle()
paragraph.alignment = .center

let attributes: [NSAttributedString.Key: Any] = [
  .font: NSFont(name: "Apple Symbols", size: CGFloat(dimension) * 0.40625) ?? NSFont.systemFont(ofSize: CGFloat(dimension) * 0.40625),
  .foregroundColor: NSColor(calibratedRed: 0.478, green: 0.247, blue: 0.098, alpha: 1.0),
  .paragraphStyle: paragraph
]

let mark = NSString(string: "🪩")
mark.draw(
  in: NSRect(
    x: CGFloat(dimension) * 0.1171875,
    y: CGFloat(dimension) * 0.109375,
    width: CGFloat(dimension) * 0.78125,
    height: CGFloat(dimension) * 0.625
  ),
  withAttributes: attributes
)

image.unlockFocus()

guard let tiff = image.tiffRepresentation,
      let bitmap = NSBitmapImageRep(data: tiff),
      let pngData = bitmap.representation(using: .png, properties: [:]) else {
  fputs("Failed to render icon\n", stderr)
  exit(1)
}

let outputURL = URL(fileURLWithPath: outputPath)
try FileManager.default.createDirectory(
  at: outputURL.deletingLastPathComponent(),
  withIntermediateDirectories: true
)
try pngData.write(to: outputURL)
