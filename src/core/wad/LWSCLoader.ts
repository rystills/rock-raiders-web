/**
 * @author Scarabol https://github.com/scarabol
 *
 * This loader loads LWSC files exported from LW
 *
 * File format description: http://www.martinreddy.net/gfx/3d/LWSC.txt
 */

import { AnimClip } from '../../game/model/entity/AnimClip';
import { AnimSubObj } from '../../game/model/entity/AnimSubObj';
import { LWOLoader } from './LWOLoader';
import { Group } from 'three';
import { ResourceManager } from '../../game/engine/ResourceManager';
import { getFilename } from '../Util';

export class LWSCLoader {

    parse(path, content): AnimClip {
        const lines: string[] = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n') // normalize newlines
            .replace(/\t/g, ' ') // tabs to spaces
            .split('\n')
            .map((l) => l.trim());

        if (lines[0] !== 'LWSC') {
            throw 'Invalid start of file! Expected \'LWSC\' in first line';
        }

        const numOfModels = parseInt(lines[1], 10); // TODO is this correct? May be something else
        if (numOfModels !== 1) {
            console.warn('Number of models has unexpected value: ' + numOfModels);
        }

        const animationClip = new AnimClip();
        for (let c = 2; c < lines.length; c++) {
            let line = lines[c];
            if (!line) {
                // object separator
            } else {
                const [key, value] = line.split(' ').filter((l: string) => l !== '');
                if (key === 'FirstFrame') {
                    animationClip.firstFrame = parseInt(value);
                } else if (key === 'LastFrame') {
                    animationClip.lastFrame = parseInt(value);
                } else if (key === 'FrameStep') {
                    const frameStep = parseInt(value);
                    if (frameStep !== 1) console.error('Animation frameStep has unexpected value: ' + frameStep);
                } else if (key === 'FramesPerSecond') {
                    animationClip.framesPerSecond = parseInt(value);
                } else if (key === 'AddNullObject' || key === 'LoadObject') {
                    const subObj = new AnimSubObj();
                    if (line.startsWith('LoadObject')) {
                        const filename = getFilename(value);
                        subObj.name = filename.slice(0, filename.length - '.lwo'.length);
                        subObj.filename = path + filename;
                        // TODO do not parse twice, read from cache first
                        try { // TODO refactor extract method (also used in AnimEntityLoader)
                            const lwoContent = ResourceManager.wadLoader.wad0File.getEntryBuffer(subObj.filename);
                            subObj.model = new LWOLoader(path).parse(lwoContent.buffer);
                        } catch (e) {
                            const sharedPath = 'world/shared/';
                            // console.log('load failed for ' + subObj.filename + ' trying shared path at ' + sharedPath + filename + '; error: ' + e); // TODO debug logging
                            const lwoContent = ResourceManager.wadLoader.wad0File.getEntryBuffer(sharedPath + filename);
                            subObj.model = new LWOLoader(sharedPath).parse(lwoContent.buffer);
                        }
                        line = lines[++c];
                    } else if (key === 'AddNullObject') {
                        subObj.name = value;
                        subObj.model = new Group();
                        // FIXME iterate line here too???
                    } else {
                        console.warn('Unexpected line: ' + line);
                    }
                    while (line) {
                        if (line.startsWith('ObjectMotion ')) {
                            line = lines[++c];
                            const lenInfos = parseInt(line);
                            const lenFrames = parseInt(lines[++c]);
                            line = lines[++c];
                            for (let x = 0; x < lenFrames && !line.startsWith('EndBehavior '); x++) {
                                line = lines[c + x * 2];
                                const infos = line.split(' ').map(Number);
                                if (infos.length !== lenInfos) console.warn('Number of infos (' + infos.length + ') does not match if specified count (' + lenInfos + ')');
                                line = lines[c + x * 2 + 1];
                                const animationFrameIndex = parseInt(line.split(' ')[0]); // other entries in line should be zeros
                                subObj.setFrameAndFollowing(animationFrameIndex, animationClip.lastFrame, infos);
                            }
                        } else if (line.startsWith('ParentObject ')) {
                            subObj.parentObjInd = Number(line.split(' ')[1]) - 1; // index is 1 based
                        } else {
                            // console.log("Unhandled line: "+line); // TODO debug logging, analyze remaining entries
                        }
                        line = lines[++c];
                    }
                    animationClip.bodies.push(subObj);
                } else {
                    // console.warn("Unexpected line: " + line); // TODO debug logging, analyze remaining entries
                }
            }
        }

        return animationClip;
    }
}
