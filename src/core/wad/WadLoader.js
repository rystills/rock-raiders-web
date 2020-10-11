import { NerpParser } from '../nerp/Nerp';
import { BitmapFont } from '../BitmapFont';
import { createContext } from '../ImageHelper';
import { CfgFileParser } from './CfgFileParser';
import { encodeChar } from '../EncodingHelper';
import { ResourceManager } from '../ResourceManager';
import { WadFile } from './WadFile';

let wad0File = null;
let wad1File = null;

const resourceMgr = new ResourceManager();

/**
 * load a script asset from the input path, setting the callback function to the input callback
 * @param path: the path from which to load the script asset
 * @param callback: the callback function to be called once the script has finished loading
 */
function loadScriptAsset(path, callback) {
    const script = document.createElement('script');
    script.type = 'text/javascript';

    if (callback != null) {
        script.onload = callback;
    }

    script.src = path;

    // begin loading the script by appending it to the document head
    document.getElementsByTagName('head')[0].appendChild(script);
}

/**
 * load an image asset from the input path, setting the callback function to the input callback
 * @param path: the path from which to load the image asset
 * @param name: the name that should be used when referencing the image in the GameManager images dict
 * @param callback: the callback function to be called once the image has finished loading
 */
function loadImageAsset(path, name, callback) {
    const img = new Image();

    img.onload = function () {
        const context = createContext(img.naturalWidth, img.naturalHeight);
        context.drawImage(img, 0, 0);
        resourceMgr.images[name.toLowerCase()] = context;
        URL.revokeObjectURL(img.src);
        if (callback != null) {
            callback();
        }
    };

    img.src = path;
}

function loadWadImageAsset(name, callback) {
    loadImageAsset(wad0File.getEntry(name), name, callback);
}

/**
 * Adds an alpha channel to the bitmap by setting alpha to 0 for all black pixels
 * @param name
 * @param callback
 */
function loadAlphaImageAsset(name, callback) {
    const img = new Image();

    img.onload = function () {
        const context = createContext(img.naturalWidth, img.naturalHeight);
        context.drawImage(img, 0, 0);
        const imgData = context.getImageData(0, 0, context.width, context.height);
        for (let n = 0; n < imgData.data.length; n += 4) {
            if (imgData.data[n] <= 2 && imgData.data[n + 1] <= 2 && imgData.data[n + 2] <= 2) { // Interface/Reward/RSoxygen.bmp uses 2/2/2 as "black" alpha background
                imgData.data[n + 3] = 0;
            }
        }
        context.putImageData(imgData, 0, 0);
        resourceMgr.images[name.toLowerCase()] = context;
        URL.revokeObjectURL(img.src);
        if (callback != null) {
            callback();
        }
    };

    img.src = wad0File.getEntry(name.toLowerCase());
}

/**
 * Adds an alpha channel to the image by setting alpha to 0 for all pixels, which have the same color as the pixel at position 0,0
 * @param name
 * @param callback
 */
function loadFontImageAsset(name, callback) {
    const img = new Image();

    img.onload = function () {
        const context = createContext(img.naturalWidth, img.naturalHeight);
        context.drawImage(img, 0, 0);
        const imgData = context.getImageData(0, 0, context.width, context.height);
        for (let n = 0; n < imgData.data.length; n += 4) {
            if (imgData.data[n] === imgData.data[0] && imgData.data[n + 1] === imgData.data[1] && imgData.data[n + 2] === imgData.data[2]) {
                imgData.data[n + 3] = 0;
            }
        }
        context.putImageData(imgData, 0, 0);
        resourceMgr.fonts[name.toLowerCase()] = new BitmapFont(context);
        URL.revokeObjectURL(img.src);
        if (callback != null) {
            callback();
        }
    };

    img.src = wad0File.getEntry(name);
}

function loadNerpAsset(name, callback) {
    name = name.replace(/.npl$/, '.nrn');
    const buffer = wad0File.getEntryData(name);
    const script = String.fromCharCode.apply(String, buffer);
    resourceMgr.nerps[name] = NerpParser(script, resourceMgr.nerps);
    if (callback != null) {
        callback();
    }
}

function numericNameToNumber(name) {
    if (name === undefined) {
        throw 'Numeric name must not be undefined';
    }
    const digits = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9 };
    const specials = {
        ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
        sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
    };
    const tens = { twenty: 20, thirty: 30, forty: 40 };
    let number = specials[name] || digits[name];
    if (number === undefined) {
        Object.keys(tens).forEach(ten => {
            if (name.startsWith(ten)) {
                const digitName = name.replace(ten, '');
                number = tens[ten] + (digitName ? digits[digitName] : 0);
            }
        });
    }
    if (number === undefined) {
        throw 'Found unexpected numeric name ' + name;
    }
    return number;
}

function parseNerpMsgFile(wadFile, name) {
    const result = [];
    const lines = String.fromCharCode.apply(String, wadFile.getEntryData(name).map(c => encodeChar(c))).split('\n');
    for (let c = 0; c < lines.length; c++) {
        const line = lines[c].trim();
        if (line.length < 1 || line === '-') {
            continue;
        }
        // line formatting differs between wad0 and wad1 files!
        const txt0Match = line.match(/\\\[([^\\]+)\\](\s*#([^#]+)#)?/);
        const txt1Match = line.match(/^([^$][^#]+)(\s*#([^#]+)#)?/);
        const sndMatch = line.match(/\$([^\s]+)\s*([^\s]+)/);
        if (wadFile === wad0File && txt0Match) {
            const index = txt0Match[3] !== undefined ? numericNameToNumber(txt0Match[3]) : c; // THIS IS MADNESS! #number# at the end of line is OPTIONAL
            result[index] = result[index] || {};
            result[index].txt = txt0Match[1];
        } else if (wadFile === wad1File && txt1Match) {
            const index = txt1Match[3] !== undefined ? numericNameToNumber(txt1Match[3]) : c; // THIS IS MADNESS! #number# at the end of line is OPTIONAL
            result[index] = result[index] || {};
            result[index].txt = txt1Match[1].replace(/_/g, ' ').trim();
        } else if (sndMatch && sndMatch.length === 3) {
            const index = numericNameToNumber(sndMatch[1]);
            result[index] = result[index] || {};
            result[index].snd = sndMatch[2].replace(/\\/g, '/');
        } else {
            throw 'Line in nerps message file did not match anything';
        }
    }
    return result;
}

function loadNerpMsg(name, callback) {
    const result = parseNerpMsgFile(wad0File, name);
    const msg1 = parseNerpMsgFile(wad1File, name);
    for (let c = 0; c < msg1.length; c++) {
        const m1 = msg1[c];
        if (!m1) continue;
        if (m1.txt) {
            result[c].txt = m1.txt;
        }
        if (m1.snd) {
            result[c].snd = m1.snd;
        }
    }
    resourceMgr.nerpMessages[name] = result;
    if (callback) {
        callback();
    }
}

function loadMapAsset(name, callback) {
    const buffer = wad0File.getEntryData(name);
    if (buffer.length < 13 || String.fromCharCode.apply(String, buffer.slice(0, 3)) !== 'MAP') {
        console.log('Invalid map data provided');
        return;
    }
    const map = { width: buffer[8], height: buffer[12], level: [] };
    let row = [];
    for (let seek = 16; seek < buffer.length; seek += 2) {
        row.push(buffer[seek]);
        if (row.length >= map.width) {
            map.level.push(row);
            row = [];
        }
    }
    resourceMgr.maps[name] = map;
    if (callback) {
        callback();
    }
}

function loadObjectListAsset(name, callback) {
    const buffer = wad0File.getEntryData(name);
    const lines = String.fromCharCode.apply(String, buffer).split('\n');
    resourceMgr.objectLists[name] = [];
    let currentObject = null;
    for (let c = 0; c < lines.length; c++) {
        const line = lines[c].trim();
        const objectStartMatch = line.match(/(.+)\s+{/);
        const drivingMatch = line.match(/driving\s+(.+)/);
        if (line.length < 1 || line.startsWith(';') || line.startsWith('Lego*')) {
            // ignore empty lines, comments and the root object
        } else if (objectStartMatch) {
            currentObject = {};
            resourceMgr.objectLists[name][objectStartMatch[1]] = currentObject;
        } else if (line === '}') {
            currentObject = null;
        } else if (drivingMatch) {
            currentObject.driving = drivingMatch[1];
        } else {
            const split = line.split(/\s+/);
            if (split.length !== 2 || currentObject === null) {
                throw 'Unexpected key value entry: ' + line;
            }
            const key = split[0];
            let val = split[1];
            if (key === 'xPos' || key === 'yPos' || key === 'heading') {
                val = parseFloat(val);
            } else if (key !== 'type') {
                throw 'Unexpected key value entry: ' + line;
            }
            currentObject[key] = val;
        }
    }
    if (callback) {
        callback();
    }
}

/**
 * load a sound asset from the input path, setting the callback function to the input callback
 * @param path: the path from which to load the sound asset
 * @param name: the name that should be used when referencing the sound in the GameManager sounds dict
 * @param callback:  the callback function to be called once the sound has finished loading
 */
function loadSoundAsset(path, name, callback) {
    const snd = document.createElement('audio');
    let srcType = '.ogg';
    // use ogg if supported, otherwise fall back to mp4 (cover all modern browsers)
    if (!(snd.canPlayType && snd.canPlayType('audio/ogg'))) {
        srcType = '.m4a';
    }

    if (callback != null) {
        snd.oncanplay = function () {
            snd.oncanplay = null; // otherwise the callback is triggered multiple times
            resourceMgr.sounds[name] = snd;
            callback();
        };
    }

    snd.src = path + srcType;
}

/**
 * Load a WAV file format sound asset from the WAD file.
 * @param path Path inside the WAD file
 * @param callback A callback that is triggered after the file has been loaded
 * @param key Optional key to store the sound, should look like SND_pilotdrill
 */
function loadWavAsset(path, callback, key) {
    const snd = document.createElement('audio');
    snd.keyname = key; // can be used to identify the sound later
    if (callback != null) {
        snd.oncanplay = function () {
            snd.oncanplay = null; // otherwise the callback is triggered multiple times
            const keyPath = key || path;
            // use array, because sounds have multiple variants sometimes
            resourceMgr.sounds[keyPath] = resourceMgr.sounds[keyPath] || [];
            resourceMgr.sounds[keyPath].push(snd);
            callback();
        };
    }
    // try (localized) wad1 file first, then use generic wad0 file
    try {
        snd.src = wad1File.getEntry(path);
    } catch (e) {
        snd.src = wad0File.getEntry(path);
    }
}

function updateLoadingScreen() {
    updateLoadingScreen.totalResources = updateLoadingScreen.totalResources || 1;
    updateLoadingScreen.curResource = updateLoadingScreen.curResource || 0;
    const ctx = loadingCanvas.getContext('2d');
    const loadingImg = resourceMgr.getImage(resourceMgr.configuration['Lego*']['Main']['LoadScreen']).canvas;
    const screenZoom = ctx.canvas.width / loadingImg.width;
    const loadingBarX = 142 * screenZoom;
    const loadingBarY = 450 * screenZoom;
    const loadingBarWidth = 353 * updateLoadingScreen.curResource / updateLoadingScreen.totalResources * screenZoom;
    const loadingBarHeight = 9 * screenZoom;
    ctx.drawImage(loadingImg, 0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(resourceMgr.getImage(resourceMgr.configuration['Lego*']['Main']['ProgressBar']).canvas, loadingBarX, loadingBarY, loadingBarWidth, loadingBarHeight);
}

function onAssetLoaded(callback) {
    return () => {
        updateLoadingScreen.curResource++;
        updateLoadingScreen();
        callback();
    };
}

/**
 * load in essential files, to begin the chain of asset loading
 */
function startLoadingProcess() {
    startLoadingProcess.startTime = new Date();
    startLoadingProcess.assetsFromCfgByName = {};
    setLoadingMessage('Loading configuration...');
    new Promise((resolve) => {
        new CfgFileParser().parse(wad1File.getEntryData('Lego.cfg'), (result) => {
            resourceMgr.configuration = result;
            resolve();
        });
    }).then(loadLoadingScreen);
}

/**
 * Load loading screen files, which are read from configuration
 */
function loadLoadingScreen() { // loading screen resources
    Promise.all([
        new Promise((resolve) => {
            const name = resourceMgr.configuration['Lego*']['Main']['LoadScreen']; // loading screen image
            loadWadImageAsset(name, resolve);
        }),
        new Promise((resolve) => {
            const name = resourceMgr.configuration['Lego*']['Main']['ProgressBar']; // loading bar container image
            loadWadImageAsset(name, resolve);
        }),
    ]).then(() => {
        updateLoadingScreen();
        const mainConf = resourceMgr.configuration['Lego*'];
        // registerAllAssets(mainConf);
        registerDebugAssets(mainConf);
        // start loading assets
        loadSequentialAssets.assetsFromCfg = Object.values(startLoadingProcess.assetsFromCfgByName);
        updateLoadingScreen.totalResources = resourceMgr.initialAssets.length + loadSequentialAssets.assetsFromCfg.length;
        loadSequentialAssets.assetIndex = 0;
        loadSequentialAssets();
    });
}

function addAsset(method, assetPath, optional = false, assetKey = null) {
    if (!assetPath || startLoadingProcess.assetsFromCfgByName.hasOwnProperty(assetPath.toLowerCase()) || assetPath === 'NULL') {
        return; // do not load assets twice
    }
    startLoadingProcess.assetsFromCfgByName[assetKey || assetPath] = {
        method: method,
        assetKey: assetKey,
        assetPath: assetPath,
        optional: optional,
    };
}

function registerDebugAssets(mainConf) { // register only assets used for debugging
    // level files
    Object.keys(mainConf['Levels']).forEach(levelKey => {
        if (!(levelKey === 'Level05')) {
            return;
        }
        const levelConf = mainConf['Levels'][levelKey];
        addAsset(loadMapAsset, levelConf['SurfaceMap']);
        addAsset(loadMapAsset, levelConf['PreDugMap']);
        addAsset(loadMapAsset, levelConf['TerrainMap']);
        addAsset(loadMapAsset, levelConf['BlockPointersMap'], true);
        addAsset(loadMapAsset, levelConf['CryOreMap']);
        addAsset(loadMapAsset, levelConf['PathMap'], true);
        addAsset(loadObjectListAsset, levelConf['OListFile']);
        addAsset(loadNerpAsset, levelConf['NERPFile']);
        addAsset(loadNerpMsg, levelConf['NERPMessageFile']);
        const menuConf = levelConf['MenuBMP'];
        if (menuConf) {
            menuConf.forEach((imgKey) => {
                addAsset(loadAlphaImageAsset, imgKey);
            });
        }
    });
}

function registerAllAssets(mainConf) { // dynamically register all assets from config
    // back button
    addAsset(loadWadImageAsset, mainConf['InterfaceBackButton'].slice(2, 4).forEach(imgPath => {
        addAsset(loadWadImageAsset, imgPath);
    }));
    addAsset(loadFontImageAsset, 'Interface/Fonts/ToolTipFont.bmp');
    // crystal side bar
    addAsset(loadAlphaImageAsset, 'Interface/RightPanel/CrystalSideBar.bmp'); // right side overlay showing crystal and ore count
    addAsset(loadAlphaImageAsset, 'Interface/RightPanel/CrystalSideBar_Ore.bmp'); // image representing a single piece of ore on the overlay
    addAsset(loadAlphaImageAsset, 'Interface/RightPanel/NoSmallCrystal.bmp'); // image representing no energy crystal on the overlay
    addAsset(loadAlphaImageAsset, 'Interface/RightPanel/SmallCrystal.bmp'); // image representing a single energy crystal on the overlay
    addAsset(loadAlphaImageAsset, 'Interface/RightPanel/UsedCrystal.bmp'); // image representing a single in use energy crystal on the overlay
    // level files
    Object.keys(mainConf['Levels']).forEach(levelKey => {
        if (!(levelKey.startsWith('Tutorial') || levelKey.startsWith('Level'))) {
            return; // ignore incomplete test levels and duplicates
        }
        const levelConf = mainConf['Levels'][levelKey];
        addAsset(loadMapAsset, levelConf['SurfaceMap']);
        addAsset(loadMapAsset, levelConf['PreDugMap']);
        addAsset(loadMapAsset, levelConf['TerrainMap']);
        addAsset(loadMapAsset, levelConf['BlockPointersMap'], true);
        addAsset(loadMapAsset, levelConf['CryOreMap']);
        addAsset(loadMapAsset, levelConf['PathMap'], true);
        addAsset(loadObjectListAsset, levelConf['OListFile']);
        addAsset(loadNerpAsset, levelConf['NERPFile']);
        addAsset(loadNerpMsg, levelConf['NERPMessageFile']);
        const menuConf = levelConf['MenuBMP'];
        if (menuConf) {
            menuConf.forEach((imgKey) => {
                addAsset(loadAlphaImageAsset, imgKey);
            });
        }
    });
    // reward screen
    const rewardConf = mainConf['Reward'];
    addAsset(loadWadImageAsset, rewardConf['Wallpaper']);
    addAsset(loadFontImageAsset, rewardConf['BackFont']);
    Object.values(rewardConf['Fonts']).forEach(imgPath => {
        addAsset(loadFontImageAsset, imgPath);
    });
    Object.values(rewardConf['Images']).forEach(img => {
        addAsset(loadAlphaImageAsset, img[0]);
    });
    Object.values(rewardConf['BoxImages']).forEach(img => {
        addAsset(loadWadImageAsset, img[0]);
    });
    rewardConf['SaveButton'].slice(0, 4).forEach(imgPath => {
        addAsset(loadWadImageAsset, imgPath);
    });
    rewardConf['AdvanceButton'].slice(0, 4).forEach(imgPath => {
        addAsset(loadWadImageAsset, imgPath);
    });
    // icon panel buttons
    Object.values(mainConf['InterfaceImages']).forEach(entry => {
        entry.slice(0, 3).forEach(imgPath => {
            addAsset(loadWadImageAsset, imgPath);
        });
    });
    Object.values(mainConf['InterfaceBuildImages']).forEach(entry => {
        entry.slice(0, -1).forEach(imgPath => {
            addAsset(loadWadImageAsset, imgPath);
        });
    });
    Object.values(mainConf['InterfaceSurroundImages']).forEach(entry => {
        addAsset(loadAlphaImageAsset, entry[0]);
        addAsset(loadAlphaImageAsset, entry[5]);
    });
    // spaces
    wad0File.filterEntryNames('World/WorldTextures/IceSplit/Ice..\\.bmp').forEach(imgPath => {
        addAsset(loadWadImageAsset, imgPath);
    });
    wad0File.filterEntryNames('World/WorldTextures/LavaSplit/Lava..\\.bmp').forEach(imgPath => {
        addAsset(loadWadImageAsset, imgPath);
    });
    wad0File.filterEntryNames('World/WorldTextures/RockSplit/Rock..\\.bmp').forEach(imgPath => {
        addAsset(loadWadImageAsset, imgPath);
    });
    // pause screen
    const pauseConf = mainConf['Menu']['PausedMenu'];
    addAsset(loadAlphaImageAsset, pauseConf['Menu1']['MenuImage'][0]);
    addAsset(loadFontImageAsset, pauseConf['Menu1']['MenuFont']);
    addAsset(loadFontImageAsset, pauseConf['Menu1']['HiFont']);
    addAsset(loadFontImageAsset, pauseConf['Menu1']['LoFont']);
    addAsset(loadAlphaImageAsset, 'Interface/FrontEnd/Vol_OffBar.bmp');
    addAsset(loadAlphaImageAsset, 'Interface/FrontEnd/Vol_OnBar.bmp');
    addAsset(loadAlphaImageAsset, 'Interface/FrontEnd/Vol_Leftcap.bmp');
    addAsset(loadAlphaImageAsset, 'Interface/FrontEnd/Vol_Rightcap.bmp');
    addAsset(loadAlphaImageAsset, 'Interface/FrontEnd/Vol_Plus.bmp');
    addAsset(loadAlphaImageAsset, 'Interface/FrontEnd/Vol_Minus.bmp');
    addAsset(loadAlphaImageAsset, 'Interface/FrontEnd/Vol_PlusHi.bmp');
    addAsset(loadAlphaImageAsset, 'Interface/FrontEnd/Vol_MinusHi.bmp');
    // sounds
    const samplesConf = mainConf['Samples'];
    Object.keys(samplesConf).forEach(sndKey => {
        let sndPath = samplesConf[sndKey] + '.wav';
        if (sndKey.startsWith('!')) { // TODO no clue what this means... loop? duplicate?!
            sndKey = sndKey.slice(1);
        }
        if (sndPath.startsWith('*')) { // TODO no clue what this means... don't loop, see telportup
            sndPath = sndPath.slice(1);
        } else if (sndPath.startsWith('@')) {
            // sndPath = sndPath.slice(1);
            // console.warn('Sound ' + sndPath + ' must be loaded from program files folder. Not yet implemented!');
            return;
        }
        sndPath.split(',').forEach(sndPath => {
            addAsset(loadWavAsset, sndPath, false, sndKey, true);
        });
    });
}

function onSequentialAssetLoaded() {
    loadSequentialAssets.assetIndex++;
    onAssetLoaded(loadSequentialAssets)();
}

function loadSequentialAssets() {
    if (loadSequentialAssets.assetIndex >= resourceMgr.initialAssets.length) {
        loadAssetsParallel(); // continue with parallel loading all other assets
        return;
    }
    const curAsset = resourceMgr.initialAssets[loadSequentialAssets.assetIndex];
    const assetName = curAsset[curAsset.length - 1].toLowerCase();
    const filename = curAsset[1] !== '' ? curAsset[1] + '/' + curAsset[2] : curAsset[2];
    if (curAsset[0] === 'js') {
        loadScriptAsset(filename, onSequentialAssetLoaded);
    } else if (curAsset[0] === 'img') {
        loadImageAsset(filename, assetName, onSequentialAssetLoaded);
    } else if (curAsset[0] === 'snd') {
        loadSoundAsset(filename, assetName, onSequentialAssetLoaded);
    } else if (curAsset[0] === 'wad0bmp') {
        loadWadImageAsset(assetName, onSequentialAssetLoaded);
    } else if (curAsset[0] === 'wad0alpha') {
        loadAlphaImageAsset(assetName, onSequentialAssetLoaded);
    } else if (curAsset[0] === 'wad0font') {
        loadFontImageAsset(assetName, onSequentialAssetLoaded);
    } else if (curAsset[0] === 'wad0nerp') {
        loadNerpAsset(filename, onSequentialAssetLoaded);
    } else {
        throw 'Unknown key ' + curAsset[0] + ', can\'t load: ' + curAsset.join(', ');
    }
}

function loadAssetsParallel() {
    const promises = [];
    loadSequentialAssets.assetsFromCfg.forEach((asset) => {
        promises.push(new Promise((resolve) => {
            try {
                asset.method(asset.assetPath, onAssetLoaded(resolve), asset.assetKey);
            } catch (e) {
                if (!asset.optional) {
                    throw e;
                }
                onAssetLoaded(resolve)();
            }
        }));
    });
    Promise.all(promises).then(() => {
        // main game file (put last as this contains the main game loop)
        // loadScriptAsset('rockRaiders.js', () => {
        // indicate that loading has finished, and display the total loading time
        console.log('Loading of about ' + updateLoadingScreen.totalResources + ' assets complete! Total load time: ' + ((new Date().getTime() - startLoadingProcess.startTime.getTime()) / 1000).toFixed(2).toString() + ' seconds.');
        // remove globals used during loading phase so as not to clutter the memory, if even only by a small amount
        // delete object;
        // });
        startWithCachedFiles.onload();
    });
}

/**
 * Read WAD file as binary blob from the given URL and parse it on success
 * @param url the url to the WAD file, can be local file url (file://...) too
 */
function loadWadFile(url) {
    return new Promise(resolve => {
        console.log('Loading WAD file from ' + url);
        fetch(url).then((response) => {
            if (response.ok) {
                response.arrayBuffer().then((buffer) => {
                    resolve(new WadFile().parseWadFile(buffer));
                });
            }
        });
    });
}

/**
 * Private helper method, which combines file loading and waits for them to become ready before continuing
 * @param wad0Url Url to parse the LegoRR0.wad file from
 * @param wad1Url Url to parse the LegoRR1.wad file from
 */
function loadWadFiles(wad0Url, wad1Url) {
    Promise.all([loadWadFile(wad0Url), loadWadFile(wad1Url)]).then(wadFiles => {
        wad0File = wadFiles[0];
        wad1File = wadFiles[1];
        openLocalCache((objectStore) => {
            objectStore.put(wad0File, 'wad0');
            objectStore.put(wad1File, 'wad1');
        });
        startLoadingProcess();
    });
}

function openLocalCache(onopen) {
    const request = indexedDB.open('RockRaidersWeb');
    request.onupgradeneeded = function (event) {
        // noinspection JSUnresolvedVariable
        const db = event.target.result;
        if (db.objectStoreNames.contains('wadfiles')) {
            db.deleteObjectStore('wadfiles');
        }
        db.createObjectStore('wadfiles');
    };
    request.onsuccess = function (event) {
        // noinspection JSUnresolvedVariable
        const db = event.target.result;
        const transaction = db.transaction(['wadfiles'], 'readwrite');
        const objectStore = transaction.objectStore('wadfiles');
        onopen(objectStore);
    };
}

function startWithCachedFiles(onload) {
    startWithCachedFiles.onload = onload; // TODO refactor loading process?! Use promises?!
    startWithCachedFiles.startTime = new Date();
    const _onerror = () => {
        setLoadingMessage('WAD files not found in cache');
        // as fallback load wad files from local URL
        // TODO load WAD files from HTML input element or external URL (CORS?!)
        loadWadFiles('./LegoRR0.wad', './LegoRR1.wad');
    };
    setLoadingMessage('Loading WAD files from cache...');
    openLocalCache((objectStore) => {
        const request1 = objectStore.get('wad0');
        request1.onerror = _onerror;
        request1.onsuccess = function () {
            if (request1.result === undefined) {
                _onerror();
                return;
            }
            console.log('First WAD file loaded from cache after ' + ((new Date().getTime() - startWithCachedFiles.startTime.getTime()) / 1000));
            wad0File = new WadFile();
            for (let prop in request1.result) { // class info are runtime info and not stored in cache => use copy constructor
                if (request1.result.hasOwnProperty(prop)) {
                    wad0File[prop] = request1.result[prop];
                }
            }
            const request2 = objectStore.get('wad1');
            request2.onerror = _onerror;
            request2.onsuccess = function () {
                if (request2.result === undefined) {
                    _onerror();
                    return;
                }
                wad1File = new WadFile();
                for (let prop in request2.result) { // class info are runtime info and not stored in cache => use copy constructor
                    if (request2.result.hasOwnProperty(prop)) {
                        wad1File[prop] = request2.result[prop];
                    }
                }
                console.log('WAD files loaded from cache after ' + ((new Date().getTime() - startWithCachedFiles.startTime.getTime()) / 1000));
                startLoadingProcess();
            };
        };
    });
}

function setLoadingMessage(text) {
    // clear the lower portion of the canvas and update the loading status
    loadingContext.fillStyle = 'black';
    loadingContext.fillRect(0, loadingCanvas.height - 70, loadingCanvas.width, 50);
    loadingContext.fillStyle = 'white';
    loadingContext.fillText(text, 20, loadingCanvas.height - 30);
}

const loadingCanvas = document.getElementById('loadingCanvas');
const loadingContext = loadingCanvas.getContext('2d');

export { startWithCachedFiles, loadWadFiles };
