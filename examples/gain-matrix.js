import React from 'react';
import { render } from 'react-dom';

import RAudioContext from '../src/base/audio-context.js';
import RPipeline from '../src/graph/pipeline.js';
import RSplit from '../src/graph/split.js';
import RExtensible from '../src/graph/extensible.js';
import RSplitChannels from '../src/graph/split-channels.js';

import {
  RGain,
  RBufferSource
} from '../src/audio-nodes/index.js';

class GainMatrix extends RExtensible {
  constructor(props) {
    super(props);

    const gains = (new Array(props.channelCount || 2))
      .fill((new Array(props.channelCount || 2)).fill(1));

    this.state = { gains };
    this.makeRow = this.makeRow.bind(this);
  }

  onGainInput(e) {
    const [x, y] = e.target.name.split('').map(v => parseInt(v));

    const gains = this.state.gains.slice().map(arr => arr.slice());
    gains[x][y] = e.target.value;

    this.setState({ gains });
  }

  makeRow(row, rowIndex) {
    return (
      <RSplit key={rowIndex}>
        {
          row.map((cellGain, columnIndex) => (
            <RPipeline key={columnIndex}>
              <RGain name={`gain${rowIndex}${columnIndex}`} gain={cellGain}
                connectToChannel={columnIndex}/>
              <input type="range" min="0" max="1" step="any"
                onChange={this.onGainInput.bind(this)} name={`${rowIndex}${columnIndex}`} />
            </RPipeline>
          ))
        }
      </RSplit>
    );
  }

  renderGraph() {
    return (
      <RSplitChannels channelCount={this.props.channelCount}>
        { this.state.gains.map(this.makeRow) }
      </RSplitChannels>
    );
  }
}

export default class GainMatrixExample extends React.Component {
  constructor() {
    super();
    this.state = {
      buffer: null
    };
  }

  componentDidMount() {
    fetch('/assets/audio/clarinet.mp3')
      .then(res => res.arrayBuffer())
      .then(ab => this.audioContext.decodeAudioData(ab))
      .then(buffer => this.setState({ buffer }));
  }

  render() {
    return (
      <RAudioContext debug={false} onInit={ctx => this.audioContext = ctx}>
        <article>
          <h1>Gain Matrix</h1>
          <p>
            This example (courtesy of <a href="http://github.com/tomjnixon">Tom Nixon</a> from
            BBC R&amp;D) shows how we can create complex multichannel graphs
            using <code>RSplitChannels</code> and explicit <code>connectToChannel</code> props.
          </p>
          <p>
            Each channel of the stereo input signal is routed to both channels of the output signal
            and each branch is processed by a separate <code>RGain</code>.
            This kind of graph is particularly useful when binauralising audio.
          </p>
          <p>
            Stereo audio recording by Freesound user <a href="https://freesound.org/people/debudding/">debudding</a> (Public Domain).
          </p>
        </article>
        <RPipeline>
          <RBufferSource buffer={this.state.buffer} loop start={0}/>
          <GainMatrix channelCount={2}/>
        </RPipeline>
      </RAudioContext>
    );
  }
}
