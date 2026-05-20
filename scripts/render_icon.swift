import AppKit
import Foundation

let outputPath = CommandLine.arguments.dropFirst().first ?? "icons/logo-128.png"
let size = NSSize(width: 128, height: 128)
let rect = NSRect(origin: .zero, size: size)

let image = NSImage(size: size)
image.lockFocus()

let backgroundPath = NSBezierPath(roundedRect: rect.insetBy(dx: 8, dy: 8), xRadius: 28, yRadius: 28)
let gradient = NSGradient(colors: [
  NSColor(calibratedRed: 1.0, green: 0.968, blue: 0.933, alpha: 1.0),
  NSColor(calibratedRed: 0.949, green: 0.871, blue: 0.796, alpha: 1.0)
])!
gradient.draw(in: backgroundPath, angle: -35)

NSColor(calibratedRed: 0.882, green: 0.690, blue: 0.498, alpha: 0.55).setFill()
NSBezierPath(ovalIn: NSRect(x: 84, y: 82, width: 24, height: 24)).fill()

let paragraph = NSMutableParagraphStyle()
paragraph.alignment = .center

let attributes: [NSAttributedString.Key: Any] = [
  .font: NSFont(name: "Apple Symbols", size: 56) ?? NSFont.systemFont(ofSize: 56),
  .foregroundColor: NSColor(calibratedRed: 0.478, green: 0.247, blue: 0.098, alpha: 1.0),
  .paragraphStyle: paragraph
]

let mark = NSString(string: "🪩")
mark.draw(in: NSRect(x: 12, y: 32, width: 104, height: 64), withAttributes: attributes)

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
