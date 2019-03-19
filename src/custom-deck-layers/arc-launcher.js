// Copyright (c) 2019 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import {ArcLayer} from 'deck.gl';

const fragmentShader = `        
        #define SHADER_NAME arclaunch-fragment-shader

        #ifdef GL_ES
        precision highp float;
        #endif
        
        uniform float currentTime;
        
        varying vec4 vColor;
        varying float segmentRatio;
        
        void main(void) {
        
            vec3 red = vec3(1.0,0.0,0.0);
            red.x = 1.0;
            red.y = 0.0;
            red.z = 0.0;
        
        if(segmentRatio > currentTime - 0.05 && segmentRatio < currentTime + 0.05)
          gl_FragColor = vColor;
          else gl_FragColor = vec4(1.0, 1.0, 1.0, 0.1);;
        }
    `;



const vertexShader = `
        #define SHADER_NAME arclaunch-vertex-shader

        attribute vec3 positions;
        attribute vec4 instanceSourceColors;
        attribute vec4 instanceTargetColors;
        attribute vec4 instancePositions;
        attribute vec3 instancePickingColors;
        
        attribute float instanceWidths;

        
        uniform float numSegments;
        // uniform vec2 project_uViewportSize;
        uniform float strokeWidth;
        uniform float opacity;
        uniform float currentTime;

        varying vec4 vColor;
        varying float segmentRatio;

        
        float paraboloid(vec2 source, vec2 target, float ratio) {
        
          vec2 x = mix(source, target, ratio);
          vec2 center = mix(source, target, 0.5);
        
          float dSourceCenter = distance(source, center);
          float dXCenter = distance(x, center);
          return (dSourceCenter + dXCenter) * (dSourceCenter - dXCenter);
        }
        
        // offset vector by strokeWidth pixels
        // offset_direction is -1 (left) or 1 (right)
        vec2 getExtrusionOffset(vec2 line_clipspace, float offset_direction) {
          // normalized direction of the line
          vec2 dir_screenspace = normalize(line_clipspace * project_uViewportSize);
          // rotate by 90 degrees
          dir_screenspace = vec2(-dir_screenspace.y, dir_screenspace.x);
        
          vec2 offset_screenspace = dir_screenspace * offset_direction * strokeWidth / 2.0;
          vec2 offset_clipspace = offset_screenspace / project_uViewportSize * 2.0;
        
          return offset_clipspace;
        }
        
        float getSegmentRatio(float index) {
          return smoothstep(0.0, 1.0, index / (numSegments - 1.0));
        }
        
        vec3 getPos(vec2 source, vec2 target, float segmentRatio) {
          float vertex_height = paraboloid(source, target, segmentRatio);
        
          return vec3(
            mix(source, target, segmentRatio),
            sqrt(max(0.0, vertex_height))
          );
        }
        
        void main(void) {
          vec2 source = project_position(instancePositions.xy);
          vec2 target = project_position(instancePositions.zw);
        
          float segmentIndex = positions.x;
          segmentRatio = getSegmentRatio(segmentIndex);
          // if it's the first point, use next - current as direction
          // otherwise use current - prev
          float indexDir = mix(-1.0, 1.0, step(segmentIndex, 0.0));
          float nextSegmentRatio = getSegmentRatio(segmentIndex + indexDir);
        
          vec3 currPos = getPos(source, target, segmentRatio);
          vec3 nextPos = getPos(source, target, nextSegmentRatio);
          vec4 curr = project_to_clipspace(vec4(currPos, 1.0));
          vec4 next = project_to_clipspace(vec4(nextPos, 1.0));
        
          // extrude
          vec2 offset = getExtrusionOffset((next.xy - curr.xy) * indexDir, positions.y);
          gl_Position = curr + vec4(offset, 0.0, 0.0);
        
          vec4 color = mix(instanceSourceColors, instanceTargetColors, segmentRatio) / 255.;
        
          // vColor = mix(
          //   vec4(color.rgb, color.a * opacity),
          //   vec4(instancePickingColors / 255., 1.)
          // );
          
            vColor = vec4(color.rgb, color.a * opacity);

        }
`;

// const tcount = Math.floor((Date.now() / 10) % 100)/100;


export class ArcLauncher extends ArcLayer {



  initializeState() {
        super.initializeState();

        // this.state.attributeManager.addInstanced({
        //     instanceAngles: {size: 1, accessor: 'getAngle'}
        // });
    }

    updateState({props}) {
        super.updateState(...arguments);

        this.state.model.setUniforms({
            currentTime: props.currentTime
        });
    }


    getShaders() {
        // console.log(super.getShaders().fs);
        // console.log(super.getShaders().vs);

        return {
            ...super.getShaders(),
            fs: fragmentShader,
            vs: vertexShader
        };
    }
}

ArcLauncher.layerName = 'ArcLauncher';
