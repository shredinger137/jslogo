/* eslint eqeqeq: "off", no-extend-native: "off", no-throw-literal: "off", no-use-before-define: "off" */

import React, { Component } from 'react';
import '../css/styles.css';
import '../css/layout.css';
import { Scatter } from 'react-chartjs-2'

export default class Chart extends Component {

    state = {
        options: {}
    }

    chartRef = {}

    render() {
        return (
            <div style={{ height: "100%", width: "100%" }}>
                {this.props.chartType == "single" ?
                    <Scatter
                        data={{
                            datasets:
                                [
                                    {
                                        data: this.props.chartDataSingle
                                    }

                                ]
                        }}


                        options={this.props.chartOptionsSingle}                        
                        redraw={true}
                        ref={this.chartReference
                        }
                    />
                    :

                    this.props.chartType == "double" ?
                        <>
                            <div style={{ height: "50%" }}>
                                <Scatter
                                    data={{
                                        datasets:
                                            [
                                                {
                                                    data: this.props.chartDataTop
                                                }

                                            ]
                                    }}


                                    options={
                                        this.props.chartOptionsTop}
                                    redraw={true}
                                    ref={this.chartReference}
                                />
                            </div>

                            <div style={{ height: "50%" }}>
                                <Scatter
                                    data={{
                                        datasets:
                                            [
                                                {
                                                    data: this.props.chartDataBottom
                                                }

                                            ]
                                    }}


                                    options={this.props.chartOptionsBottom}
                                    redraw={true}
                                    ref={this.chartReference}
                                />
                            </div>
                        </>

                        : null

                }

            </div>
        )

    }
}