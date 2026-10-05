import AppKit
import PDFKit

struct CatalogPage: Codable {
    let number: Int
    let width: Int
    let height: Int
    let text: String
}

let source = CommandLine.arguments.dropFirst().first ?? "Catálogo Petalume.pdf"
guard let document = PDFDocument(url: URL(fileURLWithPath: source)) else {
    fatalError("Unable to open catalog: \(source)")
}
let destination = URL(fileURLWithPath: "assets/pages", isDirectory: true)
try FileManager.default.createDirectory(at: destination, withIntermediateDirectories: true)
var pages: [CatalogPage] = []

for index in 0..<document.pageCount {
    guard let page = document.page(at: index) else {
        fatalError("Missing page \(index + 1)")
    }
    let bounds = page.bounds(for: .mediaBox)
    let number = index + 1
    for width in [810, 1620] {
        let height = Int((CGFloat(width) * bounds.height / bounds.width).rounded())
        guard let bitmap = NSBitmapImageRep(
            bitmapDataPlanes: nil, pixelsWide: width, pixelsHigh: height,
            bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true,
            isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0
        ), let context = NSGraphicsContext(bitmapImageRep: bitmap) else {
            fatalError("Unable to create bitmap")
        }
        NSGraphicsContext.saveGraphicsState()
        NSGraphicsContext.current = context
        context.cgContext.setFillColor(NSColor.white.cgColor)
        context.cgContext.fill(CGRect(x: 0, y: 0, width: width, height: height))
        context.cgContext.scaleBy(x: CGFloat(width) / bounds.width, y: CGFloat(height) / bounds.height)
        page.draw(with: .mediaBox, to: context.cgContext)
        NSGraphicsContext.restoreGraphicsState()
        guard let data = bitmap.representation(using: .jpeg, properties: [.compressionFactor: 0.86]) else {
            fatalError("Unable to encode page \(number)")
        }
        let filename = String(format: "page-%02d-%d.jpg", number, width)
        try data.write(to: destination.appendingPathComponent(filename))
    }
    let text = (page.string ?? "")
        .replacingOccurrences(of: "\u{FFFC}", with: "")
        .split(separator: "\n")
        .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
        .filter { !$0.isEmpty && $0 != String(number) }
        .joined(separator: "\n")
    pages.append(CatalogPage(number: number, width: 810, height: 1440, text: text))
    print("Exported page \(number)/\(document.pageCount)")
}

let encoder = JSONEncoder()
encoder.outputFormatting = [.prettyPrinted, .sortedKeys, .withoutEscapingSlashes]
try encoder.encode(pages).write(to: URL(fileURLWithPath: "assets/catalog.json"))
print("Export complete: \(pages.count) pages at 810px and 1620px.")