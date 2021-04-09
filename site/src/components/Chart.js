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


                        options={{

                            title: {
                                text: this.props.chartOptionsSingle.title,
                                display: true

                            },
                            scales: {
                                yAxes: [{
                                    scaleLabel: {
                                        display: true,
                                        labelString: this.props.chartOptionsSingle.yLabel
                                    },
                                    ticks: this.props.chartOptionsSingle.ticks
                                }],
                                xAxes: [{
                                    scaleLabel: {
                                        display: true,
                                        labelString: this.props.chartOptionsSingle.xLabel
                                    }
                                }]
                            },
                            legend: {
                                display: false
                            },
                            responsive: true,
                            maintainAspectRatio: false,
                            animation: {
                                duration: 0
                            },
                            elements: {
                                point: {
                                    radius: 4,
                                    backgroundColor: "black"
                                }
                            },
                        }
                        }
                        redraw={true}
                        ref={this.chartReference}
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


<<<<<<< Updated upstream
                                    options={this.props.chartOptionsTop}
=======
                                    options={{

                                        title: {
                                            text: this.props.chartOptionsTop.title,
                                            display: true

                                        },

                                        scales: {
                                            yAxes: [{
                                                scaleLabel: {
                                                    display: true,
                                                    labelString: this.props.chartOptionsTop.yLabel
                                                },
                                                ticks: this.props.chartOptionsTop.ticks
                                            }],
                                            xAxes: [{
                                                scaleLabel: {
                                                    display: true,
                                                    labelString: this.props.chartOptionsTop.xLabel
                                                }
                                            }]
                                        },
                                        legend: {
                                            display: false
                                        },
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        animation: {
                                            duration: 0
                                        },
                                        elements: {
                                            point: {
                                                radius: 4,
                                                backgroundColor: "black"
                                            }
                                        }
                                    }
                                    }
>>>>>>> Stashed changes
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


<<<<<<< Updated upstream
                                    options={this.props.chartOptionsBottom}
=======
                                    options={{

                                        title: {
                                            text: this.props.chartOptionsBottom.title,
                                            display: true

                                        },

                                        scales: {
                                            yAxes: [{
                                                scaleLabel: {
                                                    display: true,
                                                    labelString: this.props.chartOptionsBottom.yLabel
                                                },
                                                ticks: this.props.chartOptionsBottom.ticks
                                            }],
                                            xAxes: [{
                                                scaleLabel: {
                                                    display: true,
                                                    labelString: this.props.chartOptionsBottom.xLabel
                                                }
                                            }]
                                        },
                                        legend: {
                                            display: false
                                        },
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        animation: {
                                            duration: 0
                                        },
                                        elements: {
                                            point: {
                                                radius: 4,
                                                backgroundColor: "black"
                                            }
                                        }
                                    }
                                    }
>>>>>>> Stashed changes
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