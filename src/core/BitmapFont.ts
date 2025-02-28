import { createContext, createDummyImgData, getPixel, setPixel } from './ImageHelper'

export class BitmapFont {

    charHeight: number
    letters: ImageData[] = []

    constructor(fontImageData: ImageData, cols = 10, rows = 19) { // font images always consist of 10 columns and 19 rows with last row empty
        // actually chars are font dependent and have to be externalized in future
        // maybe CP850 was used... not sure, doesn't fit...
        const chars = [' ', '!', '"', '#', '$', '%', '⌵', '`', '(', ')',
            '*', '+', ',', '-', '.', '/', '0', '1', '2', '3',
            '4', '5', '6', '7', '8', '9', ':', ';', '<', '=',
            '>', '?', '@', 'A', 'B', 'C', 'D', 'E', 'F', 'G',
            'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q',
            'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '[',
            '\\', ']', '^', '_', '\'', 'a', 'b', 'c', 'd', 'e',
            'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
            'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y',
            'z', 'Ä', 'Å', 'Á', 'À', 'Â', 'Ã', 'Ą', 'ä', 'å',
            'á', 'à', 'â', 'ã', 'ą', 'Ë', 'E̊', 'É', 'È', 'É',
            'Ę', 'ë', 'e̊', 'é', 'è', 'e̊', 'ę̊', '', '', '',
            '', '', '', '', '', 'Ö', '', '', '', '',
            'ö', '', '', '', '', 'Ü', '', '', '', 'ü',
            '', '', '', '', '', '', '', '', '', '',
            '', '', '', '', '', '', '', '', '', '',
            '', '', '', 'ß', '', '', '', 'Ñ', '', 'ñ',
            '',
        ] // XXX complete this character list

        const maxCharWidth = fontImageData.width / cols
        this.charHeight = fontImageData.height / rows

        function getActualCharacterWidth(imgData) {
            for (let y = 0; y < imgData.height / rows; y++) { // find non-empty row first
                let rowPixelIndex = y * 4 * imgData.width
                if (imgData.data[rowPixelIndex] !== 255 && imgData.data[rowPixelIndex + 2] !== 255) { // red/blue pixels indicate end of character
                    for (let x = 0; x < maxCharWidth; x++) {
                        let colPixelIndex = x * 4
                        if (imgData.data[colPixelIndex] === 255 || imgData.data[colPixelIndex + 2] === 255) { // red/blue pixels indicate end of character
                            return x
                        }
                    }
                    return maxCharWidth
                }
            }
            return 0
        }

        for (let i = 0; i < chars.length; i++) {
            let imgData = this.extractData(fontImageData, (i % 10) * maxCharWidth, Math.floor(i / 10) * this.charHeight, maxCharWidth, this.charHeight)
            let actualWidth = getActualCharacterWidth(imgData)
            if (actualWidth > 0) {
                imgData = this.extractData(imgData, 0, 0, actualWidth, this.charHeight)
            } else {
                imgData = createDummyImgData(maxCharWidth, this.charHeight)
            }
            this.letters[chars[i]] = imgData
        }
    }

    extractData(imgData, startX, startY, width, height): ImageData {
        const alpha = getPixel(imgData, startX + width - 1, startY + height - 1)
        const result = new ImageData(width, height)
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const p = getPixel(imgData, startX + x, startY + y)
                if (p.r === alpha.r && p.g === alpha.g && p.b === alpha.b) p.a = 0 // apply alpha channel
                setPixel(result, x, y, p.r, p.g, p.b, p.a)
            }
        }
        return result
    }

    createTextImage(text: string, maxWidth?: number, autoCenter: boolean = true): SpriteImage {
        if (text === undefined || text === null || text.length < 1) {
            // empty text requested, context with width 0 is not allowed, but 1 with alpha is close enough
            return createContext(1, 1).canvas
        }
        text = text.replace(/_/g, ' ')
        const rows = this.determineRows(text, maxWidth)
        const width = Math.max(...(rows.map(r => r.width)))
        const result = new ImageData(width, this.charHeight * rows.length)
        rows.forEach((row, index) => {
            const rowX = autoCenter ? Math.round((width - row.width) / 2) : 0
            const rowY = index * this.charHeight
            let letterX = 0
            for (let c = 0; c < row.text.length; c++) {
                const letterImgData = this.letters[row.text.charAt(c)]
                if (letterImgData) {
                    for (let x = letterX; x < letterX + letterImgData.width; x++) {
                        for (let y = 0; y < letterImgData.height; y++) {
                            const p = getPixel(letterImgData, x - letterX, y)
                            setPixel(result, rowX + x, rowY + y, p.r, p.g, p.b, p.a)
                        }
                    }
                    letterX += letterImgData.width
                } // missing letter issue already reported above
            }
        })
        const img = createContext(result.width, result.height)
        img.putImageData(result, 0, 0)
        return img.canvas
    }

    private determineRows(text: string, maxWidth?: number): { text: string, width: number }[] {
        const spaceWidth = this.letters[' '].width
        const rows: { text: string, width: number }[] = []
        let rowText = ''
        let rowWidth = 0
        text.split(' ').map(word => {
            let wordWidth = 0
            for (let c = 0; c < word.length; c++) {
                const letter = word.charAt(c)
                const letterImg = this.letters[letter]
                if (letterImg) {
                    wordWidth += letterImg.width
                } else {
                    console.error('Letter \'' + letter + '\' not found in charset! Ignoring it')
                }
            }
            if (rowWidth > 0) {
                if (!maxWidth || rowWidth + spaceWidth + wordWidth < maxWidth) {
                    rowText += ' ' + word
                    rowWidth += spaceWidth + wordWidth
                } else {
                    rows.push({text: rowText, width: rowWidth})
                    rowText = word
                    rowWidth = wordWidth
                }
            } else {
                rowText += word
                rowWidth += wordWidth
            }
            return wordWidth
        })
        if (rowWidth > 0) rows.push({text: rowText, width: rowWidth})
        return rows
    }
}
