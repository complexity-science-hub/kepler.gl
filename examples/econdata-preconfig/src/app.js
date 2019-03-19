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

import React, {Component} from 'react';
import {findDOMNode} from 'react-dom';
import styled, {ThemeProvider}  from 'styled-components';
import window from 'global/window';
import {connect} from 'react-redux';
import {theme} from 'kepler.gl/styles';
import Banner from './components/banner';
import Announcement from './components/announcement';
import {replaceLoadDataModal} from './factories/load-data-modal';
import ExportUrlModal from './components/sharing/export-url-modal';

import {
  exportFileToCloud,
  loadRemoteMap,
  loadSampleConfigurations,
  setCloudLoginSuccess
} from './actions';

const KeplerGl = require('kepler.gl/components').injectComponents([
  replaceLoadDataModal()
]);

// Sample data
/* eslint-disable no-unused-vars */
// import sampleTripData from './data/sample-trip-data';
// import sampleGeojson from './data/sample-small-geojson.json';
// import sampleGeojsonPoints from './data/sample-geojson-points.json';
// import sampleH3Data from './data/sample-hex-id-csv';
// import sampleIconCsv, {config as savedMapConfig} from './data/sample-icon-csv';

import {addDataToMap, addNotification} from 'kepler.gl/actions';
import {processCsvData, processGeojson} from 'kepler.gl/processors';
import Processors from 'kepler.gl/processors';
import econData from './data/economic_loss_40k.csv';
import econConfig from './data/econ_map-cfg';
// import KeplerGlSchema from 'kepler.gl/dist/schemas';
// import autConfig from './data/austria_config';
// import deuConfig from './data/germ_config';
// import usaConfig from './data/us_config';
import econDataLarge from './data/economicloss146k_enh.csv';

const autConfig = require('./data/austria_config.json');
const deuConfig = require('./data/germ_config.json');
const usaConfig = require('./data/us_config.json');

/* eslint-enable no-unused-vars */

const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const BannerHeight = 30;
const BannerKey = 'kgHideBanner-iiba';

const GlobalStyle = styled.div`
  font-family: ff-clan-web-pro, 'Helvetica Neue', Helvetica, sans-serif;
  font-weight: 400;
  font-size: 0.875em;
  line-height: 1.71429;

  *,
  *:before,
  *:after {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }

  ul {
    margin: 0;
    padding: 0;
  }

  li {
    margin: 0;
  }

  a {
    text-decoration: none;
    color: ${props => props.theme.labelColor};
  }
`;

class App extends Component {


  componentDidMount() {
    // Use processCsvData helper to convert csv file into kepler.gl structure {fields, rows}
    const data = Processors.processCsvData(econData);
    // Create dataset structure
    const dataset = {
      data,
      info: {
        // this is used to match the dataId defined in nyc-config.json. For more details see API documentation.
        // It is paramount that this id matches your configuration otherwise the configuration file will be ignored.
        id: 'my_data'
      }
    };
    // addDataToMap action to inject dataset into kepler.gl instance
    // this.props.dispatch(addDataToMap({ config: econConfig}));
    this.props.dispatch(addDataToMap({datasets: dataset, config: econConfig}));

  }


  // This method is used as reference to show how to export the current kepler.gl instance configuration
  // Once exported the configuration can be imported using parseSavedConfig or load method from KeplerGlSchema
  // getMapConfig() {
  //   // retrieve kepler.gl store
  //   const {keplerGl} = this.props;
  //   // retrieve current kepler.gl instance store
  //   const {map} = keplerGl;
  //
  //   // create the config object
  //   return KeplerGlSchema.getConfigToSave(map);
  // }

  // This method is used as reference to show how to export the current kepler.gl instance configuration
  // Once exported the configuration can be imported using parseSavedConfig or load method from KeplerGlSchema
  // exportMapConfig = () => {
  //   // create the config object
  //   const mapConfig = this.getMapConfig();
  //   // save it as a json file
  //   downloadJsonFile(mapConfig, 'kepler.gl.json');
  // };

  // Created to show how to replace dataset with new data and keeping the same configuration
  replaceData = (scen) => {
    // Use processCsvData helper to convert csv file into kepler.gl structure {fields, rows}
    var config;
    switch(scen)
    {
      case 0:
        config = autConfig;
        break;
      case 1:
        config = deuConfig;
        break;
      case 2:
        config = usaConfig;
        break;
    }
    const data = Processors.processCsvData(econDataLarge);


    // Create dataset structure
    const dataset = {
      data,
      info: {
        id: 'my_data'
        // this is used to match the dataId defined in nyc-config.json. For more details see API documentation.
        // It is paramount that this id mathces your configuration otherwise the configuration file will be ignored.
      }
    };

    // read the current configuration
    // const config = this.getMapConfig();

    // addDataToMap action to inject dataset into kepler.gl instance
    // this.props.dispatch(addDataToMap({datasets: dataset, config: autConfig}));
    this.props.dispatch(addDataToMap({datasets: dataset, config: config}));

  };



  state = {
    showBanner: false,
    width: window.innerWidth,
    height: window.innerHeight
  };

  componentWillMount() {
    // if we pass an id as part of the url
    // we ry to fetch along map configurations
    const {params: {id} = {}, location: {query = {}}} = this.props;

    // Load sample using its id
    if (id) {
      this.props.dispatch(loadSampleConfigurations(id));
    }

    // Load map using a custom
    if (query.mapUrl) {
      // TODO?: validate map url
      this.props.dispatch(loadRemoteMap({dataUrl: query.mapUrl}));
    }

    // event listeners
    window.addEventListener('resize', this._onResize);

    this._onResize();
  }



  componentWillUnmount() {
    window.removeEventListener('resize', this._onResize);
  }

  _onResize = () => {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    });
  };

  _showBanner = () => {
    this.setState({showBanner: true});
  };

  _hideBanner = () => {
    this.setState({showBanner: false});
  };

  _disableBanner = () => {
    this._hideBanner();
    window.localStorage.setItem(BannerKey, 'true');
  };

  _loadMockNotifications = () => {
    const notifications = [
      [{message: 'Welcome to Kepler.gl'}, 3000],
      [{message: 'Something is wrong', type: 'error'}, 1000],
      [{message: 'I am getting better', type: 'warning'}, 1000],
      [{message: 'Everything is fine', type: 'success'}, 1000]
    ];

    this._addNotifications(notifications);
  };

  _addNotifications(notifications) {
    if (notifications && notifications.length) {
      const [notification, timeout] = notifications[0];

      window.setTimeout(() => {
        this.props.dispatch(addNotification(notification));
        this._addNotifications(notifications.slice(1));
      }, timeout);
    }
  }

  // _loadSampleData() {
  //   // this._loadTripData();
  //   // this._loadGeojsonData();
  //   this._loadIconData();
  //   this._loadH3HexagonData();
  // }
  //
  // _loadTripData() {
  //   this.props.dispatch(
  //     addDataToMap({
  //       datasets: {
  //         info: {
  //           label: 'Sample Taxi Trips in New York City',
  //           id: 'test_trip_data'
  //         },
  //         data: sampleTripData
  //       },
  //       option: {
  //         centerMap: true,
  //         readOnly: false
  //       },
  //       config: {
  //         visState: {
  //           filters: [
  //             {
  //               id: 'me',
  //               dataId: 'test_trip_data',
  //               name: 'tpep_pickup_datetime',
  //               type: 'timeRange',
  //               enlarged: true
  //             }
  //           ]
  //         }
  //       }
  //     })
  //   );
  // }
  //
  // _loadIconData() {
  //   // load icon data and config and process csv file
  //   this.props.dispatch(
  //     addDataToMap({
  //       datasets: [
  //         {
  //           info: {
  //             label: 'Icon Data',
  //             id: 'test_icon_data'
  //           },
  //           data: processCsvData(sampleIconCsv)
  //         }
  //       ],
  //       options: {
  //         centerMap: false
  //       },
  //       config: savedMapConfig
  //     })
  //   );
  // }
  //
  // _loadGeojsonData() {
  //   // load geojson
  //   this.props.dispatch(
  //     addDataToMap({
  //       datasets: [{
  //         info: {label: 'Bart Stops Geo'},
  //         data: processGeojson(sampleGeojsonPoints)
  //       }, {
  //         info: {label: 'SF Zip Geo'},
  //         data: processGeojson(sampleGeojson)
  //       }]
  //     })
  //   );
  // }
  //
  // _loadH3HexagonData() {
  //   // load h3 hexagon
  //   this.props.dispatch(
  //     addDataToMap({
  //       datasets: [
  //         {
  //           info: {
  //             label: 'H3 Hexagons V2',
  //             id: 'h3-hex-id'
  //           },
  //           data: processCsvData(sampleH3Data)
  //         }
  //       ]
  //     })
  //   );
  // }

  _isCloudStorageEnabled = () => {
    const {app} = this.props.demo;
    return app.featureFlags.cloudStorage;
  };

  _toggleCloudModal = () => {
    // TODO: this lives only in the demo hence we use the state for now
    // REFCOTOR using redux
    this.setState({
      cloudModalOpen: !this.state.cloudModalOpen
    });
  };

  _onExportToCloud = () => {
    this.props.dispatch(exportFileToCloud());
  };

  _onCloudLoginSuccess = () => {
    this.props.dispatch(setCloudLoginSuccess());
  };

  render() {



    const {showBanner, width, height} = this.state;
    const {sharing} = this.props.demo;
    const rootNode = this.root;
    return (
      <ThemeProvider theme={theme}>
        <GlobalStyle
          // this is to apply the same modal style as kepler.gl core
          // because styled-components doesn't always return a node
          // https://github.com/styled-components/styled-components/issues/617
          innerRef={node => {node ? this.root = node : null}}
        >
          <Banner
            show={this.state.showBanner}
            height={BannerHeight}
            bgColor="#82368c"
            onClose={this._hideBanner}
          >
            <Announcement onDisable={this._disableBanner}/>
          </Banner>
          {this._isCloudStorageEnabled() && rootNode && (
            <ExportUrlModal
              sharing={sharing}
              isOpen={Boolean(this.state.cloudModalOpen)}
              onClose={this._toggleCloudModal}
              onExport={this._onExportToCloud}
              onCloudLoginSuccess={this._onCloudLoginSuccess}
              // this is to apply the same modal style as kepler.gl core
              parentSelector={() => findDOMNode(this.root)}
            />
          )}
          <div
            style={{
              transition: 'margin 1s, height 1s',
              position: 'absolute',
              width: '100%',
              height: showBanner ? `calc(100% - ${BannerHeight}px)` : '100%',
              minHeight: `calc(100% - ${BannerHeight}px)`,
              marginTop: showBanner ? `${BannerHeight}px` : 0
            }}
          >
            <KeplerGl
              mapboxApiAccessToken={MAPBOX_TOKEN}
              id="map"
              /*
               * Specify path to keplerGl state, because it is not mount at the root
               */
              getState={state => state.demo.keplerGl}
              width={width}
              height={height - (showBanner ? BannerHeight : 0)}
              onSaveMap={this._isCloudStorageEnabled() && this._toggleCloudModal}
            />
          </div>


          <button style={ {    position: 'absolute',
            zIndex: 100,
            bottom: 0,
            right: -15,
            width: '120px',
            height: '40px',
            backgroundColor: '#1f7cf4',
            color: '#FFFFFF',
            cursor: 'pointer',
            border: 0,
            borderRadius: '3px',
            fontSize: '12p}x',
            margin:'30px'}} onClick={() => this.replaceData(0)}>Austrian Exposure</button>

          <button style={ {   position: 'absolute',
            zIndex: 100,
            bottom: 50,
            right: -15,
            width: '120px',
            height: '40px',
            backgroundColor: '#1f7cf4',
            color: '#FFFFFF',
            cursor: 'pointer',
            border: 0,
            borderRadius: '3px',
            fontSize: '12px',
            margin:'30px'}} onClick={() => this.replaceData(1)}>Ger. Autom. Shock</button>

          <button style={ { position: 'absolute',
            zIndex: 100,
            bottom: 100,
            right: -15,
            width: '120px',
            height: '40px',
            backgroundColor: '#1f7cf4',
            color: '#FFFFFF',
            cursor: 'pointer',
            border: 0,
            borderRadius: '3px',
            fontSize: '12px',
            margin:'30px'}} onClick={() => this.replaceData(2)}>US Tariff Shock</button>

        </GlobalStyle>
      </ThemeProvider>

    );
  }
}

const mapStateToProps = state => state;
const dispatchToProps = dispatch => ({dispatch});

export default connect(
  mapStateToProps,
  dispatchToProps
)(App);
